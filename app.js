
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const fmt = n => new Intl.NumberFormat('ru-RU').format(Number(n||0)) + ' ₽';
const forms = ['Очная','Очно-заочная','Заочная'];
let level = 'Все';
let formFilter = 'Все';
let q = '';
let selectedForms = {};

function keyOf(p){ return `${p.level}|${p.code}|${p.name}`; }
function groupPrograms(){
  const map = new Map();
  window.FEM_PROGRAMS.forEach(p=>{
    const k = keyOf(p);
    if(!map.has(k)) map.set(k, {key:k, level:p.level, code:p.code, name:p.name, tag:p.tag, variants:[]});
    map.get(k).variants.push(p);
  });
  map.forEach(g => g.variants.sort((a,b)=>forms.indexOf(a.form)-forms.indexOf(b.form)));
  return [...map.values()];
}
function chipHTML(items, dataName){
  return items.map((x,i)=>`<button class="chip ${i===0?'active':''}" data-${dataName}="${x}">${x}</button>`).join('');
}
$('#levelFilters').innerHTML = chipHTML(['Все','Бакалавриат','Магистратура','СПО'],'level');
$('#formFilters').innerHTML = chipHTML(['Все','Очная','Очно-заочная','Заочная'],'form');

function pickVariant(g){
  const available = g.variants.map(v=>v.form);
  let wanted = selectedForms[g.key];
  if(formFilter !== 'Все' && available.includes(formFilter)) wanted = formFilter;
  if(!wanted || !available.includes(wanted)) wanted = g.variants[0].form;
  selectedForms[g.key] = wanted;
  return g.variants.find(v=>v.form === wanted) || g.variants[0];
}
function render(){
  const text = q.trim().toLowerCase();
  let groups = groupPrograms().filter(g => {
    const hay = `${g.level} ${g.code} ${g.name} ${g.tag} ${g.variants.map(v=>`${v.form} ${v.about}`).join(' ')}`.toLowerCase();
    const hasForm = formFilter === 'Все' || g.variants.some(v => v.form === formFilter);
    return (level === 'Все' || g.level === level) && hasForm && (!text || hay.includes(text));
  });
  $('#countGroups').textContent = groupPrograms().length;
  $('#cards').innerHTML = groups.map(g => {
    const p = pickVariant(g);
    const available = new Set(g.variants.map(v=>v.form));
    const formButtons = forms.map(f => {
      const disabled = available.has(f) ? '' : 'disabled';
      const active = p.form === f ? 'active' : '';
      return `<button class="form-btn ${active}" data-program-key="${g.key}" data-select-form="${f}" ${disabled}>${f}</button>`;
    }).join('');
    const exams = (p.exams||[]).map(e=>`${e[0]}${e[1] ? ` — ${e[1]}` : ''}`).join('; ');
    return `<article class="program glass" data-key="${g.key}">
      <div class="meta"><span class="pill">${g.level}</span><span class="pill">${g.code}</span><span class="pill">${p.form}</span></div>
      <h3>${g.name}</h3>
      <p class="about">${p.about}</p>
      <div class="form-picker" aria-label="Выбор формы обучения">${formButtons}</div>
      <div class="facts">
        <div class="fact"><small>Стоимость РФ</small><b>${fmt(p.price)}</b></div>
        <div class="fact"><small>Срок</small><b>${p.years}</b></div>
        <div class="fact"><small>Бюджет</small><b>${p.budget}</b></div>
        <div class="fact"><small>Контракт</small><b>${p.contract}</b></div>
        <div class="fact"><small>Первый платёж</small><b>${fmt(p.minpay)}</b></div>
        <div class="fact"><small>Документы</small><b>${p.deadline}</b></div>
      </div>
      <p class="exams"><b>Вступительные:</b> ${exams}.</p>
      <a class="more" target="_blank" rel="noopener" href="${p.url}">Официальная страница ↗</a>
    </article>`;
  }).join('') || `<div class="empty glass"><h3>Подходящих программ не найдено.</h3><p class="fineprint">Смените уровень, форму обучения или поисковый запрос.</p></div>`;
  calc();
}
function setFilter(container, btn){
  [...container.children].forEach(x=>x.classList.remove('active'));
  btn.classList.add('active');
}
$('#levelFilters').addEventListener('click',e=>{const b=e.target.closest('.chip'); if(!b)return; setFilter($('#levelFilters'),b); level=b.dataset.level; render();});
$('#formFilters').addEventListener('click',e=>{const b=e.target.closest('.chip'); if(!b)return; setFilter($('#formFilters'),b); formFilter=b.dataset.form; render();});
$('#cards').addEventListener('click',e=>{const b=e.target.closest('[data-select-form]'); if(!b || b.disabled)return; selectedForms[b.dataset.programKey] = b.dataset.selectForm; render();});
$('#search').addEventListener('input',e=>{q=e.target.value; render();});

function basePrice(category, form){
  if(category === 'master') return form === 'Заочная' ? 98000 : 244000;
  if(category === 'spo') return form === 'Заочная' ? 65000 : 130000;
  if(category === 'pr') return form === 'Заочная' ? 90000 : form === 'Очно-заочная' ? 120000 : 260000;
  return form === 'Заочная' ? 78000 : form === 'Очно-заочная' ? 110000 : 260000;
}
function calc(){
  const category = $('#calcCategory').value;
  const form = $('#calcForm').value;
  const score = Number($('#score').value || 0);
  const diploma = $('#diploma').value;
  let discount = 0;
  let reason = 'скидка не применена';
  if(category === 'spo'){
    if(score >= 4.6){discount=.40; reason='средний балл 4,6–5,0'}
    else if(score >= 4.1){discount=.30; reason='средний балл 4,1–4,5'}
    else if(score >= 3.7){discount=.20; reason='средний балл 3,7–4,0'}
  } else if(category === 'master'){
    if(diploma === 'fem-red'){discount=.50; reason='красный диплом ФЭМ'}
    else if(diploma === 'spbti'){discount=.40; reason='выпускник СПбГТИ(ТУ)'}
    else if(diploma === 'red'){discount=.25; reason='диплом с отличием другого вуза'}
  } else {
    const pr = category === 'pr';
    if(score > (pr ? 260 : 250)){discount=.60; reason='высокая сумма баллов'}
    else if(score >= (pr ? 240 : 230)){discount=.50; reason='средняя шкала скидки'}
    else if(score >= (pr ? 210 : 200)){discount=.40; reason='средняя шкала скидки'}
    else if(score >= (pr ? 190 : 180)){discount=.20; reason='минимальный диапазон скидки'}
    if(diploma === 'red-spo'){discount=Math.max(discount,.50); reason='красный диплом СПО'}
    else if(diploma === 'spo'){discount=Math.max(discount,.40); reason='диплом СПО'}
  }
  const price = Math.round(basePrice(category, form) * (1-discount));
  $('#calcPrice').textContent = fmt(price);
  $('#calcDesc').textContent = `Скидка ${Math.round(discount*100)}%, основание: ${reason}.`;
}
['calcCategory','calcForm','score','diploma'].forEach(id=>$('#'+id).addEventListener('input',calc));
function applyTheme(dark){document.body.classList.toggle('dark',dark); localStorage.setItem('fem-theme',dark?'dark':'light');}
$('#theme').addEventListener('click',()=>applyTheme(!document.body.classList.contains('dark')));
$('#themeMobile').addEventListener('click',()=>applyTheme(!document.body.classList.contains('dark')));
if(localStorage.getItem('fem-theme') === 'dark') applyTheme(true);
document.querySelector('[data-mobile-form]')?.addEventListener('click',()=>{formFilter='Очная'; const btn=[...$('#formFilters').children].find(b=>b.dataset.form==='Очная'); if(btn){setFilter($('#formFilters'),btn); render();}});
let deferredPrompt=null; window.addEventListener('beforeinstallprompt',e=>{e.preventDefault(); deferredPrompt=e;});
$('#installBtn')?.addEventListener('click', async()=>{ if(deferredPrompt){deferredPrompt.prompt(); deferredPrompt=null;} else {document.getElementById('iosInstall')?.classList.add('show'); location.hash='sources';}});
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').catch(()=>{});}
if(/iphone|ipad|ipod/i.test(navigator.userAgent)) document.getElementById('iosInstall')?.classList.add('show');
render();
