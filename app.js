
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const fmt = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
let level='Все', form='Все', q='';
function chipHTML(items, cls){return items.map((x,i)=>`<button class="chip ${i===0?'active':''}" data-${cls}="${x}">${x}</button>`).join('')}
$('#levelFilters').innerHTML = chipHTML(['Все','Бакалавриат','Магистратура','СПО'],'level');
$('#formFilters').innerHTML = chipHTML(['Все','Очная','Очно-заочная','Заочная'],'form');
function render(){
 const list = window.FEM_PROGRAMS.filter(p=>(level==='Все'||p.level===level)&&(form==='Все'||p.form===form)&&(`${p.name} ${p.code} ${p.form} ${p.level} ${p.tag}`.toLowerCase().includes(q.toLowerCase())));
 $('#countPrograms').textContent=list.length;
 $('#cards').innerHTML = list.map(p=>`<article class="card"><div class="meta"><span class="pill">${p.level}</span><span class="pill">${p.form}</span><span class="pill">${p.code}</span></div><h3>${p.name}</h3><p>${p.about}</p><div class="facts"><div class="fact"><small>Стоимость РФ</small><b>${fmt(p.price)}</b></div><div class="fact"><small>Срок</small><b>${p.years}</b></div><div class="fact"><small>Бюджет</small><b>${p.budget}</b></div><div class="fact"><small>Контракт</small><b>${p.contract}</b></div><div class="fact"><small>Первый платёж</small><b>${fmt(p.minpay)}</b></div><div class="fact"><small>Документы</small><b>${p.deadline}</b></div></div><p class="note"><b>Вступительные:</b> ${p.exams.map(e=>e[0]+(e[1]?` — ${e[1]}`:'' )).join('; ')}.</p><a class="more" target="_blank" rel="noopener" href="${p.url}">Официальная страница ↗</a></article>`).join('') || '<div class="card"><h3>Ничего не найдено</h3><p>Попробуйте сменить уровень, форму или поисковый запрос.</p></div>';
 fillSelect(); calc();
}
function fillSelect(){const sel=$('#calcProgram'); const prev=sel.value; const opts=window.FEM_PROGRAMS.map((p,i)=>`<option value="${i}">${p.level} · ${p.form} · ${p.name} — ${fmt(p.price)}</option>`).join(''); if(sel.dataset.ready!==opts){sel.innerHTML=opts; sel.dataset.ready=opts;} if(prev)sel.value=prev;}
function calc(){const p=window.FEM_PROGRAMS[+$('#calcProgram').value||0]; const score=Number($('#score').value||0); const diploma=$('#diploma').value; let disc=0, reason='Скидка не применена'; if(p.level==='СПО'){ if(score>=4.6){disc=.40;reason='Средний балл 4,6–5,0'} else if(score>=4.1){disc=.30;reason='Средний балл 4,1–4,5'} else if(score>=3.7){disc=.20;reason='Средний балл 3,7–4,0'} } else if(p.level==='Магистратура'){ if(diploma==='fem-red'){disc=.50;reason='Красный диплом ФЭМ'} else if(diploma==='spbti'){disc=.40;reason='Выпускник СПбГТИ(ТУ)'} else if(diploma==='red'){disc=.25;reason='Диплом с отличием другого вуза'} } else { const isPr=p.code==='42.03.01'; if(score>(isPr?260:250)){disc=.60;reason='Высокая сумма баллов'} else if(score>=(isPr?240:230)){disc=.50;reason='Средняя шкала скидки'} else if(score>=(isPr?210:200)){disc=.40;reason='Средняя шкала скидки'} else if(score>=(isPr?190:180)){disc=.20;reason='Минимальный диапазон скидки'} if(diploma==='red-spo'){disc=Math.max(disc,.50);reason='Красный диплом СПО'} else if(diploma==='spo'){disc=Math.max(disc,.40);reason='Диплом СПО'} }
 const total=Math.round(p.price*(1-disc)); $('#calcPrice').textContent=fmt(total); $('#calcDesc').textContent=`${p.name}, ${p.form}: скидка ${Math.round(disc*100)}%. Основание: ${reason}.`;
}
$$('.filters').forEach(f=>f.addEventListener('click',e=>{const b=e.target.closest('.chip'); if(!b)return; [...b.parentNode.children].forEach(x=>x.classList.remove('active')); b.classList.add('active'); if(b.dataset.level) level=b.dataset.level; if(b.dataset.form) form=b.dataset.form; render();}));
$('#search').addEventListener('input',e=>{q=e.target.value; render()}); $('#calcProgram').addEventListener('change',calc); $('#score').addEventListener('input',calc); $('#diploma').addEventListener('change',calc);
$('#theme').addEventListener('click',()=>{document.body.classList.toggle('dark'); localStorage.setItem('fem-theme',document.body.classList.contains('dark')?'dark':'light')}); if(localStorage.getItem('fem-theme')==='dark')document.body.classList.add('dark');
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').catch(()=>{})}
const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent); if(isIOS) $('#iosInstall').classList.add('show');
render();
