const fs=require('fs')
const src=fs.readFileSync(require('path').join(__dirname,'..','worker','worker_v8.js'),'utf8')
const i=src.indexOf('const MENU_DATA = ')
const start=src.indexOf('[', i)
// find matching close bracket
let d=0,end=-1,inStr=false,esc=false
for(let k=start;k<src.length;k++){const ch=src[k]
 if(inStr){ if(esc){esc=false} else if(ch==='\\'){esc=true} else if(ch==='"'){inStr=false}; continue}
 if(ch==='"'){inStr=true;continue}
 if(ch==='[')d++; else if(ch===']'){d--; if(d===0){end=k;break}}}
const items=JSON.parse(src.slice(start,end+1))
console.log('raw items:',items.length)

const norm=s=>String(s||'').toLowerCase()
const cmsDietTags=i=>new Set(norm(i.dietaryTags).split(',').map(s=>s.trim()).filter(Boolean))
const dietFromCms=(i,...a)=>{ if(!i.dietaryTags) return null; const t=cmsDietTags(i); return a.some(x=>t.has(x)) }
const hasAllergen=(i,words)=>{const hay=norm(i.allergens); if(!hay) return false; return words.some(w=>hay.includes(w))}
const hasAllergenData=i=>{const a=norm(i.allergens).trim(); return a!==''&&a!=='unconfirmed'}
const T={
 "Vegetarian": i=>dietFromCms(i,"vegetarian","vegan","vegetarian-without-chicken","vegan-without-chicken") ?? false,
 "Vegan": i=>dietFromCms(i,"vegan","vegan-without-chicken") ?? false,
 "Gluten-Free": i=>dietFromCms(i,"gluten-free","gluten free") ?? (hasAllergenData(i)&&!hasAllergen(i,["wheat"])),
 "Dairy-Free": i=>dietFromCms(i,"dairy-free","dairy free","low-lactose","low lactose","vegan") ?? (hasAllergenData(i)&&!hasAllergen(i,["milk"])),
 "High Protein": i=>(i.protein||0)>=25,
 "Low Carb": i=>(i.carbs||0)>0&&(i.carbs||0)<=20,
 "GLP-1 Friendly": i=>!i.variable&&(i.calories||0)>0&&(i.protein||0)>=25&&(i.calories||0)<=650,
}
const FORMAT_RE=/^(.*)\s+(Wrap|Bowl)$/
const pair=new Map()
items.forEach(i=>{const m=FORMAT_RE.exec(i.title); if(!m)return; const k=m[1].toLowerCase(); const e=pair.get(k)||{}; if(m[2]==='Wrap')e.wrap=i; else e.bowl=i; pair.set(k,e)})
for(const [k,v] of Array.from(pair)) if(!v.wrap||!v.bowl) pair.delete(k)
const countCards=list=>{let n=list.length; const ids=new Set(list.map(i=>i.id)); pair.forEach(p=>{if(ids.has(p.wrap.id)&&ids.has(p.bowl.id))n--}); return n}
console.log('ALL cards:',countCards(items))
for(const k of Object.keys(T)){const f=items.filter(T[k]); console.log(`${k.padEnd(16)} items=${String(f.length).padStart(3)}  cards=${countCards(f)}`)}
console.log('\n--- Gluten-Free members ---')
console.log(items.filter(T['Gluten-Free']).map(i=>i.title).sort().join(' | '))
console.log('\n--- Dairy-Free members ---')
console.log(items.filter(T['Dairy-Free']).map(i=>i.title).sort().join(' | '))
console.log('\n--- Vegan ---'); console.log(items.filter(T['Vegan']).map(i=>i.title).sort().join(' | '))
console.log('\n--- Vegetarian ---'); console.log(items.filter(T['Vegetarian']).map(i=>i.title).sort().join(' | '))
console.log('\n--- GLP-1 ---'); console.log(items.filter(T['GLP-1 Friendly']).map(i=>i.title).sort().join(' | '))
const wraps=items.filter(i=>/Wrap$/.test(i.title))
console.log('\nWrap-suffix items passing GF:', wraps.filter(T['Gluten-Free']).map(i=>i.title).join(' | ')||'(none)')
