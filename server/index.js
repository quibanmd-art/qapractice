import express from 'express';
import {createServer as createViteServer} from 'vite';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {createServer} from 'node:http';
import {PRODUCTS,PRODUCT_BY_ID} from '../shared/catalog.js';
import {calculateTotals,validateCheckout,validEmail} from '../shared/domain.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const app=express();
app.disable('x-powered-by');
app.use(express.json({limit:'32kb'}));
app.use((req,res,next)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');next();});
const dataDir=path.join(root,'server','data');fs.mkdirSync(dataDir,{recursive:true});
const dataPath=path.join(dataDir,'demo-store.json');
const hashPassword=(password,salt=crypto.randomBytes(16).toString('hex'))=>({salt,hash:crypto.scryptSync(password,salt,64).toString('hex')});
let db;
try{db=JSON.parse(fs.readFileSync(dataPath,'utf8'));if(!Array.isArray(db.users)||!Array.isArray(db.orders))throw Error('Invalid data file');}
catch(error){if(error.code!=='ENOENT')throw new Error('Cannot read local demo database. Back it up and check server/data/demo-store.json.');db={users:[{id:crypto.randomUUID(),name:'Alex Student',email:'alex@campus.test',...hashPassword('Demo12345!'),city:'Sample City'}],orders:[],contacts:[]};}
function save(){const temp=dataPath+'.tmp';fs.writeFileSync(temp,JSON.stringify(db,null,2));fs.renameSync(temp,dataPath);}
save();
const sessions=new Map();
const publicUser=u=>u?{id:u.id,name:u.name,email:u.email,city:u.city||''}:null;
app.use('/api',(req,res,next)=>{
 res.setHeader('Cache-Control','no-store');
 let sid=req.headers.cookie?.split(';').map(s=>s.trim()).find(s=>s.startsWith('campus_sid='))?.slice(11);
 if(!sid||!/^[-a-f0-9]{64}$/.test(sid))sid=crypto.randomBytes(32).toString('hex');
 let session=sessions.get(sid);if(!session){session={visitorId:sid,userId:null};sessions.set(sid,session);}
 res.cookie('campus_sid',sid,{httpOnly:true,sameSite:'lax',maxAge:7*24*60*60*1000,path:'/'});
 req.session=session;req.user=db.users.find(u=>u.id===session.userId)||null;
 req.reference=req.headers['x-qa-mode']==='reference';next();
});
app.get('/api/health',(req,res)=>res.json({ok:true,app:'Campus Cart',version:'2.0.0'}));
app.get('/api/products',(req,res)=>res.json({products:PRODUCTS}));
app.get('/api/session',(req,res)=>res.json({user:publicUser(req.user)}));
app.post('/api/auth/register',(req,res)=>{
 const {name,email,password}=req.body||{};
 if(typeof name!=='string'||name.trim().length<2||!validEmail(email)||typeof password!=='string'||password.length<8||password.length>128)return res.status(400).json({error:'Use a name of at least 2 characters, a valid email, and a password of 8 to 128 characters.'});
 const normalized=email.trim().toLowerCase();if(db.users.some(u=>u.email===normalized))return res.status(409).json({error:'An account with this email already exists.'});
 const user={id:crypto.randomUUID(),name:name.trim().slice(0,100),email:normalized,...hashPassword(password),city:''};db.users.push(user);save();req.session.userId=user.id;res.status(201).json({user:publicUser(user)});
});
app.post('/api/auth/login',(req,res)=>{
 const {email,password}=req.body||{};const user=db.users.find(u=>u.email===String(email||'').trim().toLowerCase());
 if(!user||typeof password!=='string'||password.length>128)return res.status(401).json({error:'Email or password is incorrect.'});
 const actual=Buffer.from(hashPassword(password,user.salt).hash,'hex');
 if(!crypto.timingSafeEqual(actual,Buffer.from(user.hash,'hex')))return res.status(401).json({error:'Email or password is incorrect.'});
 req.session.userId=user.id;res.json({user:publicUser(user)});
});
app.post('/api/auth/logout',(req,res)=>{req.session.userId=null;res.json({ok:true});});
app.put('/api/account',(req,res)=>{
 if(!req.user)return res.status(401).json({error:'Please sign in first.'});
 const {name,city}=req.body||{};
 if(typeof name!=='string'||name.trim().length<2||typeof city!=='string'||city.length>100)return res.status(400).json({error:'Provide a name of at least 2 characters and a city of at most 100 characters.'});
 req.user.name=name.trim().slice(0,100);req.user.city=city.trim();save();res.json({user:publicUser(req.user)});
});
app.get('/api/orders',(req,res)=>{
 const mode=req.reference?'reference':'practice';
 const orders=db.orders.filter(o=>o.mode===mode&&(req.user?o.userId===req.user.id:!o.userId&&o.visitorId===req.session.visitorId));
 res.json({orders:orders.map(({visitorId,userId,requestId,...o})=>o).reverse()});
});
app.post('/api/orders',(req,res)=>{
 const {cart,shipping,promo,requestId}=req.body||{};
 if(!cart||Array.isArray(cart)||typeof cart!=='object'||!Object.keys(cart).length)return res.status(400).json({error:'Your bag is empty.'});
 const limit=req.reference?5:6;
 for(const [id,quantity] of Object.entries(cart))if(!Object.hasOwn(PRODUCT_BY_ID,id)||!Number.isInteger(quantity)||quantity<1||quantity>limit)return res.status(400).json({error:'One or more product quantities are invalid.'});
 const errors=validateCheckout(shipping,req.reference);if(Object.keys(errors).length)return res.status(400).json({error:'Review your delivery details.',errors});
 if(typeof requestId!=='string'||requestId.length>100||requestId.length<8)return res.status(400).json({error:'A valid order request is required.'});
 const old=db.orders.find(o=>o.requestId===requestId&&o.visitorId===req.session.visitorId);
 if(old)return res.json({order:old});
 const order={id:'CC-'+crypto.randomBytes(4).toString('hex').toUpperCase(),createdAt:new Date().toISOString(),status:'Demo confirmed',mode:req.reference?'reference':'practice',userId:req.user?.id||null,visitorId:req.session.visitorId,requestId,items:Object.entries(cart).map(([id,quantity])=>({id,name:PRODUCT_BY_ID[id].name,price:PRODUCT_BY_ID[id].price,image:PRODUCT_BY_ID[id].image,quantity})),totals:calculateTotals(cart,!!promo,req.reference),shipping:Object.fromEntries(['name','email','phone','address','city'].map(k=>[k,String(shipping[k]||'').trim().slice(0,250)]))};
 db.orders.push(order);save();res.status(201).json({order});
});
app.post('/api/contact',(req,res)=>{
 const {name,email,subject,message}=req.body||{};
 if(typeof name!=='string'||name.trim().length<2||!validEmail(email)||typeof subject!=='string'||!subject.trim()||typeof message!=='string'||message.trim().length<10||message.length>2000)return res.status(400).json({error:'Complete all fields with a valid email and a message of 10 to 2000 characters.'});
 const ticket={id:'HELP-'+crypto.randomBytes(3).toString('hex').toUpperCase(),createdAt:new Date().toISOString(),name:name.trim().slice(0,100),email:email.trim().slice(0,200),subject:subject.trim().slice(0,100),message:message.trim()};
 db.contacts??=[];db.contacts.push(ticket);save();res.status(201).json({ticket:ticket.id,message:'Demo message saved locally. No email has been sent.'});
});
app.use('/api',(req,res)=>res.status(404).json({error:'API endpoint not found.'}));
const http=createServer(app);
const production=process.argv.includes('--production');
if(production){
 if(!fs.existsSync(path.join(root,'dist/index.html'))){console.error('Build missing. Run npm run build before npm run start:prod.');process.exit(1);}
 app.use(express.static(path.join(root,'dist')));app.get('*',(req,res)=>res.sendFile(path.join(root,'dist/index.html')));
}else{
 const vite=await createViteServer({configFile:path.join(root,'vite.config.js'),root,server:{middlewareMode:true,host:'127.0.0.1',hmr:{server:http}},appType:'spa'});app.use(vite.middlewares);
}
app.use((err,req,res,next)=>{console.error(err.message);if(req.path.startsWith('/api/'))res.status(err.status||500).json({error:'The request could not be completed. Check the local server.'});else res.status(500).send('Local server error. Check the terminal.');});
const port=Number(process.env.PORT)||3000;
http.listen(port,'127.0.0.1',()=>console.log(`\n  Campus Cart QA Lab\n  Open http://localhost:${port}\n  React storefront + local Express API\n  Simulation only. Use fictional data.\n`));
http.on('error',error=>{console.error(error.code==='EADDRINUSE'?`Port ${port} is in use. Stop the other app and retry.`:error.message);process.exit(1);});
