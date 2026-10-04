(() => {
  'use strict';
  const $ = id => document.getElementById(id), D = JP_DECK, KEY = 'jyutping-practice-v1';
  const fresh = () => ({ version:1, settings:{mode:'typing',lesson:'all',tones:false}, records:{typing:{},spelling:{},tones:{}} });
  let state = fresh(), queue = [], current = null, assisted = false, recorded = false, composing = false, hintLevel = 0, freeMode = false;
  try { const raw = localStorage.getItem(KEY); if(raw) state = JP.validateBackup(JSON.parse(raw),D.cards,D.lessons); }
  catch (_) { $('storage-status').textContent = '未能讀取舊記錄，暫用新練習。可以匯入備份。'; }
  const lane = () => state.settings.mode === 'typing' ? 'typing' : state.settings.tones ? 'tones' : 'spelling';
  const cards = () => D.cards.filter(c => state.settings.lesson === 'all' || c.lesson === state.settings.lesson);
  function save() {
    try { localStorage.setItem(KEY,JSON.stringify(state)); }
    catch (_) { $('storage-status').textContent = '瀏覽器唔畀儲存，今次進度只存在記憶體。離開前請匯出備份。'; }
  }
  function stats() {
    const r = state.records[lane()], selected = cards(), now = Date.now();
    $('attempts').textContent = selected.filter(c => r[c.id]).length;
    $('total').textContent = selected.length;
    $('due').textContent = selected.filter(c => r[c.id] && r[c.id].due <= now).length;
    $('learned').textContent = selected.filter(c => r[c.id] && r[c.id].streak >= 2).length;
  }
  function note(card) {
    const lesson = D.lessons.find(l => l.id === (card ? card.lesson : state.settings.lesson)) || D.lessons[0];
    $('lesson-title').textContent = lesson.title;
    $('lesson-note').textContent = lesson.note;
    $('video').href = D.source.video + '&t=' + (lesson.timestamp === null ? 0 : lesson.timestamp) + 's';
    $('video').textContent = lesson.timestamp === null ? '▶ 返影片（應用句唔係影片原句）' : '▶ 返影片睇呢一段';
  }
  function render() {
    current = queue[0] || null; assisted = false; recorded = false; hintLevel = 0; composing = false;
    $('solution').hidden = true; $('solution').replaceChildren(); $('feedback').textContent = ''; $('feedback').dataset.result = '';
    $('answer').value = ''; $('finish').hidden = Boolean(current);
    for (const id of ['answer','check','hint','reveal','next']) $(id).disabled = !current;
    $('target').textContent = current ? current.text : '今日呢輪練完喇';
    $('topic').textContent = current ? D.lessons.find(l => l.id === current.lesson).title : '休息都係學習嘅一部分';
    $('position').textContent = current ? (freeMode ? '自由練習 · ' : '待練 · ') + queue.length : '';
    $('instruction').textContent = state.settings.mode === 'typing' ? '切去 TypeDuck，憑記憶拼出上面嘅中文字。' : '用英文鍵盤輸入粵拼' + (state.settings.tones ? '，每個音節要帶 1–6 聲調。' : '；可以唔打聲調數字。');
    $('answer').placeholder = state.settings.mode === 'typing' ? '喺呢度打中文字' : '喺呢度打粵拼';
    $('hint').textContent = '拆字提示'; note(current); stats();
  }
  function start(free = false) {
    freeMode = free; queue = free ? [...cards()] : JP.queue(cards(),state.records[lane()],Date.now()); render();
  }
  function record(correct) {
    if(recorded || !current) return;
    const records = state.records[lane()];
    records[current.id] = JP.review(records[current.id],correct,assisted,Date.now());
    recorded = true; save(); stats();
  }
  function solution(full) {
    if(!current) return;
    assisted = true; $('solution').hidden = false; $('solution').replaceChildren();
    if(full) { const p = document.createElement('div'); p.className='romanization'; p.textContent=current.readings[0]; $('solution').append(p); }
    const parts = document.createElement('div'); parts.className='parts';
    current.readings[0].split(' ').forEach((s,i) => {
      const x = JP.split(s), el=document.createElement('div'); el.className='part';
      const char=document.createElement('div'); char.textContent=[...current.text][i];
      const value=document.createElement('b'); value.textContent=full ? (x.initial || '∅') + ' + ' + x.rhyme + ' · ' + x.tone : (x.initial || '∅') + ' + …';
      const label=document.createElement('small'); label.textContent=full ? ' 聲母＋韻母 · 聲調' : ' 聲母＋韻母';
      el.append(char,value,document.createElement('br'),label); parts.append(el);
    });
    $('solution').append(parts);
  }
  function feedback(text,kind='') { $('feedback').textContent=text; $('feedback').dataset.result=kind; }
  $('practice-form').addEventListener('submit', e => {
    e.preventDefault(); if(!current) return;
    if(composing) { feedback('先揀好候選字，再按檢查。'); return; }
    const result = JP.grade(current,$('answer').value,state.settings.mode,state.settings.tones);
    if(result.empty) { feedback('先輸入答案，唔使急。'); return; }
    if(!result.correct) {
      record(false); solution(true);
      feedback(state.settings.mode==='typing' ? '未啱：留意候選字。睇住粵拼再打一遍；稍後重練。' : '未啱：對照下面聲母、韻母同聲調，再試一次。','wrong'); return;
    }
    const wasAssisted = assisted || recorded; record(true); solution(true);
    feedback((state.settings.mode==='typing' ? '打啱！' : '拼啱！') + (wasAssisted ? ' 今次有提示／曾答錯，稍後再唔睇提示試。' : ' 無提示答啱，已安排下次溫習。'),'right');
  });
  $('answer').addEventListener('compositionstart',()=>{composing=true;});
  $('answer').addEventListener('compositionend',()=>{composing=false;});
  $('answer').addEventListener('keydown',e=>{ if(e.key==='Enter' && (e.isComposing || composing || e.keyCode===229)) e.preventDefault(); });
  $('hint').addEventListener('click',()=>{ hintLevel++; solution(hintLevel>1); $('hint').textContent=hintLevel===1 ? '顯示完整粵拼' : '已顯示提示'; feedback('提示唔算失敗；下一輪試吓自己記返。'); });
  $('reveal').addEventListener('click',()=>{ assisted=true; record(false); solution(true); feedback('已安排稍後重練。睇住粵拼打一遍。'); });
  $('next').addEventListener('click',()=>{ if(!current) return; if(!recorded){assisted=true;record(false);} queue.shift();render(); });
  for(const id of ['mode','lesson','tones']) $(id).addEventListener('change',()=>{
    state.settings={mode:$('mode').value,lesson:$('lesson').value,tones:$('tones').checked};
    $('tone-control').hidden=state.settings.mode!=='spelling';save();start();
  });
  function settings() {
    $('mode').value=state.settings.mode; $('lesson').value=state.settings.lesson; $('tones').checked=state.settings.tones;
    $('tone-control').hidden=state.settings.mode!=='spelling';
  }
  $('refresh').addEventListener('click',()=>start()); $('free').addEventListener('click',()=>start(true));
  $('export').addEventListener('click',()=>{
    const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='jyutping-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    $('storage-status').textContent='已準備備份下載。喺另一部機開同一頁，再匯入呢個檔案。';
  });
  $('import').addEventListener('change',async e=>{
    const file=e.target.files[0];if(!file)return;
    try{
      if(file.size>1000000)throw new Error('檔案太大，請揀本頁匯出嘅 JSON 備份。');
      const imported=JP.validateBackup(JSON.parse(await file.text()),D.cards,D.lessons);
      if(!confirm('匯入會取代呢個瀏覽器嘅現有進度。繼續？'))return;
      state=imported;save();settings();start();$('storage-status').textContent='已匯入備份。';
    }catch(error){$('storage-status').textContent=error instanceof SyntaxError ? '唔係有效嘅 JSON 備份，原有進度冇改動。' : error.message;}
    finally{e.target.value='';}
  });
  $('reset').addEventListener('click',()=>{if(confirm('清除呢個瀏覽器嘅全部練習進度？建議先匯出備份。')){state=fresh();save();settings();start();$('storage-status').textContent='已清除本機進度。';}});
  for(const lesson of D.lessons){const option=document.createElement('option');option.value=lesson.id;option.textContent=lesson.title;$('lesson').append(option);}
  settings();start();
})();
