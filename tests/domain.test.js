import test from 'node:test';
import assert from 'node:assert/strict';
import {PRODUCTS,PRODUCT_BY_ID} from '../shared/catalog.js';
import {normalizeCart,cartSubtotal,cartCount,calculateTotals,filterProducts,checkPromo,validateCheckout,validEmail} from '../shared/domain.js';
const valid={name:'Alex Student',email:'alex@example.com',phone:'09123456789',address:'123 Sample Street',city:'Sample City',terms:true};
const cases=[
 ['catalog has ten unique products',()=>{assert.equal(PRODUCTS.length,10);assert.equal(new Set(PRODUCTS.map(p=>p.id)).size,10);}],
 ['prices are positive numbers',()=>assert.ok(PRODUCTS.every(p=>Number.isFinite(p.price)&&p.price>0))],
 ['empty cart totals have no delivery',()=>assert.deepEqual(calculateTotals({},false,true),{subtotal:0,discount:0,shipping:0,total:0})],
 ['merchandise subtotal uses quantities',()=>assert.equal(cartSubtotal({notebook:2,notes:1,pen:1}),100)],
 ['reference unit count includes all units',()=>assert.equal(cartCount({notebook:2,pen:3},true),5)],
 ['reference caps persisted quantities at five',()=>assert.deepEqual(normalizeCart({notebook:99},true),{notebook:5})],
 ['cart rejects unknown products and invalid quantities',()=>assert.deepEqual(normalizeCart({unknown:3,notebook:-1,notes:0,pen:1.5},true),{})],
 ['reference search ignores letter case',()=>assert.equal(filterProducts({search:'notebook'},true)[0].id,'notebook')],
 ['search and category filters intersect',()=>assert.equal(filterProducts({search:'Grid',category:'Accessories'},true).length,0)],
 ['price filtering includes boundary values',()=>assert.deepEqual(filterProducts({min:35,max:45},true).map(p=>p.id),['notebook','highlighter'])],
 ['reference prices sort numerically ascending',()=>assert.deepEqual(filterProducts({sort:'price-asc'},true).map(p=>p.price),[5,9,12,18,35,45,65,85,120,220])],
 ['reference prices sort numerically descending',()=>assert.equal(filterProducts({sort:'price-desc'},true)[0].price,220)],
 ['eligible coupon ignores case and surrounding spaces',()=>assert.equal(checkPromo(' campus10 ',100,false,true).applied,true)],
 ['reference coupon enforces minimum',()=>assert.equal(checkPromo('CAMPUS10',99,false,true).applied,false)],
 ['reference invalid coupon clears prior discount',()=>assert.equal(checkPromo('BADCODE',120,true,true).applied,false)],
 ['exact 100 receives ten percent discount',()=>assert.equal(calculateTotals({notebook:2,notes:1,pen:1},true,true).discount,10)],
 ['under threshold delivery is 50',()=>assert.equal(calculateTotals({mug:1},false,true).shipping,50)],
 ['reference exact 500 delivery is free',()=>assert.equal(calculateTotals({bottle:2,notes:2,pen:2},false,true).shipping,0)],
 ['delivery threshold is before discount',()=>assert.deepEqual(calculateTotals({bottle:2,notes:2,pen:2},true,true),{subtotal:500,discount:50,shipping:0,total:450})],
 ['reference valid checkout has no errors',()=>assert.deepEqual(validateCheckout(valid,true),{})],
 ['reference malformed email is rejected',()=>assert.ok(validateCheckout({...valid,email:'alex@'},true).email)],
 ['reference phone length is exact',()=>assert.ok(validateCheckout({...valid,phone:'0912345678'},true).phone)],
 ['reference phone must start 09',()=>assert.ok(validateCheckout({...valid,phone:'08123456789'},true).phone)],
 ['reference terms acceptance is required',()=>assert.ok(validateCheckout({...valid,terms:false},true).terms)],
 ['whitespace-only names are rejected',()=>assert.ok(validateCheckout({...valid,name:'   '},true).name)],
 ['whitespace-only address is rejected',()=>assert.ok(validateCheckout({...valid,address:'   '},true).address)],
 ['whitespace-only city is rejected',()=>assert.ok(validateCheckout({...valid,city:'   '},true).city)],
 ['email format validation accepts ordinary email',()=>assert.equal(validEmail('alex@example.com'),true)],
 ['email format rejects spaces',()=>assert.equal(validEmail('alex @example.com'),false)],
 ['shared healthy checkout path works in practice mode',()=>assert.deepEqual(validateCheckout(valid,false),{})]
];
for(const [name,fn] of cases)test(name,fn);
