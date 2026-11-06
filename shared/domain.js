import { PRODUCTS, PRODUCT_BY_ID } from './catalog.js';
export const validEmail=s=>typeof s==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
export function normalizeCart(cart={},reference=false){
 return Object.fromEntries(Object.entries(cart).filter(([id,n])=>Object.hasOwn(PRODUCT_BY_ID,id)&&Number.isInteger(n)&&n>0).map(([id,n])=>[id,Math.min(n,reference?5:6)]));
}
export function cartSubtotal(cart){return Object.entries(cart).reduce((s,[id,n])=>s+(PRODUCT_BY_ID[id]?.price||0)*n,0);}
export function cartCount(cart,reference=false){return reference?Object.values(cart).reduce((s,n)=>s+n,0):Object.keys(cart).length;}
export function calculateTotals(cart,promo=false,reference=false){
 const subtotal=cartSubtotal(cart);
 const discount=promo&&(!reference||subtotal>=100)?Math.round(subtotal*10)/100:0;
 const shipping=subtotal===0?0:((reference?subtotal>=500:subtotal>500)?0:50);
 return {subtotal,discount,shipping,total:Math.round((subtotal-discount+shipping)*100)/100};
}
export function filterProducts({search='',category='All',sort='featured',min=0,max=Infinity}={},reference=false){
 const term=search.trim();
 const p=PRODUCTS.filter(p=>(category==='All'||p.category===category)&&(reference?p.name.toLowerCase().includes(term.toLowerCase()):p.name.includes(term))&&p.price>=Number(min)&&p.price<=Number(max));
 if(sort==='price-asc')p.sort(reference?(a,b)=>a.price-b.price:(a,b)=>String(a.price).localeCompare(String(b.price)));
 if(sort==='price-desc')p.sort(reference?(a,b)=>b.price-a.price:(a,b)=>String(b.price).localeCompare(String(a.price)));
 if(sort==='name')p.sort((a,b)=>a.name.localeCompare(b.name));
 if(sort==='rating')p.sort((a,b)=>b.rating-a.rating);
 return p;
}
export function checkPromo(code,subtotal,previous=false,reference=false){
 const valid=String(code).trim().toUpperCase()==='CAMPUS10'&&(!reference||subtotal>=100);
 return {applied:valid?true:(reference?false:previous),message:valid?'CAMPUS10 applied. Enjoy 10% off merchandise.':'This code is invalid or ineligible. No discount applied.',valid};
}
export function validateCheckout(fields={},reference=false){
 const errors={};
 for(const key of ['name','address','city'])if(typeof fields[key]!=='string'||!fields[key].trim())errors[key]=`Enter your ${key==='name'?'full name':key==='address'?'street address':'city'}.`;
 const email=String(fields.email||'').trim(),phone=String(fields.phone||'').trim();
 if(reference?!validEmail(email):!email.includes('@'))errors.email='Enter a valid email address, for example alex@example.com.';
 if(!(reference?/^09\d{9}$/.test(phone):/^09\d{8,9}$/.test(phone)))errors.phone='Enter exactly 11 digits, starting with 09.';
 if(reference&&!fields.terms)errors.terms='Accept the store policies before placing an order.';
 return errors;
}
