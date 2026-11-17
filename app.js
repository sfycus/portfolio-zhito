const products=[
  {id:'sourdough',name:'Пшеничный на закваске',type:'bread',price:420,note:'Хрустящая корка · 650 г',label:'01 / классика'},
  {id:'rye',name:'Ржаной с солодом',type:'bread',price:490,note:'Плотный мякиш · 700 г',label:'02 / глубокий вкус'},
  {id:'focaccia',name:'Фокачча с розмарином',type:'bread',price:560,note:'Оливковое масло · 500 г',label:'03 / к ужину'},
  {id:'brioche',name:'Бриошь',type:'pastry',price:390,note:'Сливочная и воздушная · 300 г',label:'04 / к завтраку'},
  {id:'croissant',name:'Круассан миндальный',type:'pastry',price:310,note:'Миндальный крем · 110 г',label:'05 / сладкое'},
  {id:'bun',name:'Булочка с кардамоном',type:'pastry',price:250,note:'Сахарная корка · 95 г',label:'06 / к кофе'}
];
const $=id=>document.getElementById(id),money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽';
let basket={};try{basket=JSON.parse(localStorage.getItem('zhito-basket')||'{}')}catch(_){basket={}}
let saved=null;try{saved=JSON.parse(localStorage.getItem('zhito-subscription')||'null')}catch(_){}

$('productGrid').innerHTML=products.map(p=>'<article class="product-card" data-type="'+p.type+'"><div class="product-art '+p.type+'"><span class="art-caption">'+p.label+'</span></div><div class="product-info"><h3>'+p.name+'</h3><p>'+p.note+'</p><div class="product-bottom"><strong>'+money(p.price)+'</strong><button type="button" data-add="'+p.id+'" aria-label="Добавить '+p.name+' в набор">+</button></div></div></article>').join('');
document.querySelectorAll('.catalog-filter button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.catalog-filter button').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-pressed','false')});b.classList.add('active');b.setAttribute('aria-pressed','true');document.querySelectorAll('.product-card').forEach(card=>card.hidden=b.dataset.filter!=='all'&&card.dataset.type!==b.dataset.filter)}));
function addItem(id){if(!products.some(p=>p.id===id))return;basket[id]=Math.min(12,(basket[id]||0)+1);saveBasket();render();$('subscription').scrollIntoView({behavior:'smooth'})}
$('productGrid').addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(b)addItem(b.dataset.add)});
document.querySelector('.hero-shelf').addEventListener('click',e=>{const b=e.target.closest('[data-feature]');if(b)addItem(b.dataset.feature)});
function saveBasket(){localStorage.setItem('zhito-basket',JSON.stringify(basket))}
const dateInput=$('startDate'),now=new Date();now.setHours(0,0,0,0);const localISO=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');dateInput.min=localISO(now);dateInput.value=localISO(now);
if(saved){basket=saved.basket||basket;$('frequency').value=saved.frequency||1;$('weeks').value=saved.count||4;dateInput.value=saved.start||dateInput.value;const radio=document.querySelector('input[name=pickupDay][value="'+saved.day+'"]');if(radio)radio.checked=true;$('status').textContent='Сохранённый набор восстановлен.'}
function dates(){const count=Number($('weeks').value),step=Number($('frequency').value),day=Number(document.querySelector('input[name=pickupDay]:checked').value);const start=new Date(dateInput.value+'T12:00:00');if(Number.isNaN(start.getTime()))return [];const delta=(day-start.getDay()+7)%7;start.setDate(start.getDate()+delta);return Array.from({length:count},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i*step*7);return d})}
function render(){
  const entries=products.filter(p=>basket[p.id]>0);$('basketCount').textContent=entries.reduce((n,p)=>n+basket[p.id],0);
  $('basketItems').innerHTML=entries.length?entries.map(p=>'<div class="basket-item"><div class="basket-item-name">'+p.name+'<small>'+money(p.price)+' / шт.</small></div><div class="counter"><button type="button" data-minus="'+p.id+'" aria-label="Уменьшить '+p.name+'">−</button><span>'+basket[p.id]+'</span><button type="button" data-plus="'+p.id+'" aria-label="Увеличить '+p.name+'">+</button></div></div>').join(''):'<p class="empty">Пока пусто. Выберите выпечку в витрине выше.</p>';
  const one=entries.reduce((n,p)=>n+p.price*basket[p.id],0),count=Number($('weeks').value),discount=Math.round(one*.08),total=(one-discount)*count;
  $('perPickup').textContent=money(one);$('discount').textContent='− '+money(discount);$('pickupCount').textContent=count;$('grandTotal').textContent=money(total);
  const fmt=new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long'});$('scheduleList').innerHTML=dates().map(d=>'<li>'+fmt.format(d)+'</li>').join('');$('savePlan').disabled=entries.length===0;$('downloadCalendar').disabled=entries.length===0;
}
$('basketItems').addEventListener('click',e=>{const plus=e.target.closest('[data-plus]'),minus=e.target.closest('[data-minus]');if(!plus&&!minus)return;const id=(plus||minus).dataset[plus?'plus':'minus'];basket[id]=Math.max(0,Math.min(12,(basket[id]||0)+(plus?1:-1)));if(!basket[id])delete basket[id];saveBasket();$('status').textContent='';render()});
['frequency','weeks','startDate'].forEach(id=>$(id).addEventListener('change',()=>{$('status').textContent='';render()}));document.querySelectorAll('input[name=pickupDay]').forEach(r=>r.addEventListener('change',()=>{$('status').textContent='';render()}));
$('savePlan').addEventListener('click',()=>{if(dateInput.value<dateInput.min){$('status').textContent='Выберите дату не раньше сегодняшней.';return}const data={basket,frequency:Number($('frequency').value),count:Number($('weeks').value),day:Number(document.querySelector('input[name=pickupDay]:checked').value),start:dateInput.value,dates:dates().map(localISO)};localStorage.setItem('zhito-subscription',JSON.stringify(data));$('status').textContent='Набор и календарь сохранены на этом устройстве.'});
$('downloadCalendar').addEventListener('click',()=>{const rows=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Zhito//Bread Plan//RU'];dates().forEach((d,i)=>{const stamp=localISO(d).replaceAll('-','');rows.push('BEGIN:VEVENT','UID:zhito-'+stamp+'-'+i+'@local','DTSTART;VALUE=DATE:'+stamp,'DTEND;VALUE=DATE:'+localISO(new Date(d.getTime()+86400000)).replaceAll('-',''),'SUMMARY:Забрать хлеб Жито','DESCRIPTION:Локальный план подписки. Москва, Хлебный переулок, 14.','END:VEVENT')});rows.push('END:VCALENDAR');const url=URL.createObjectURL(new Blob([rows.join('\r\n')],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='zhito-pickups.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
render();
