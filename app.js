(() => {
  'use strict';
  const $ = id => document.getElementById(id), D = {...JP_DECK, lessons:[...JP_DECK.lessons,{id:'custom',title:'我嘅自訂卡',note:'讀音由你提供；可以喺自訂 Flashcards 編輯。',timestamp:null}]}, KEY = 'jyutping-practice-v1';
  const fresh = () => ({ version:1, settings:{mode:'typing',lesson:'all',tones:false}, records:{typing:{},spelling:{},tones:{}}, custom:[] });
  let state = fresh(), queue = [], current = null, assisted = false, recorded = false, composing = false, hintLevel = 0, freeMode = false;
  try { const raw = localStorage.getItem(KEY); if(raw) state = JP.validateBackup(JSON.parse(raw),D.cards,D.lessons); }
  catch (_) { $('storage-status').textContent = '未能讀取舊記錄，暫用新練習。可以匯入備份。'; }
  const lane = () => state.settings.mode === 'typing' ? 'typing' : state.settings.tones ? 'tones' : 'spelling';
  const cards = () => [...D.cards,...(state.custom || [])].filter(c => state.settings.lesson === 'all' || c.lesson === state.settings.lesson);
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
    if(window.speechSynthesis) speechSynthesis.cancel();
    $('pronunciation').pause(); $('pronunciation').removeAttribute('src'); $('pronunciation').load(); $('audio-status').textContent = '';
    current = queue[0] || null; assisted = false; recorded = false; hintLevel = 0; composing = false;
    $('solution').hidden = true; $('solution').replaceChildren(); $('feedback').textContent = ''; $('feedback').dataset.result = '';
    $('answer').value = ''; $('finish').hidden = Boolean(current);
    for (const id of ['answer','check','hint','reveal','next','listen','slow']) $(id).disabled = !current;
    if(current && current.lesson!=='custom') $('pronunciation').src = 'audio/' + current.id + '.mp3';
    $('audio-note').textContent=current && current.lesson==='custom' ? '自訂卡：僅使用本機廣東話聲線；冇聲線就唔播放，唔會讀普通話。多音字以你提供嘅粵拼為準。' : '香港廣東話合成語音，唔係老師錄音；聽音屬提示。多音字讀法未逐字人工校音，以粵拼／影片為準。';
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
  function playAudio(rate) {
    if(!current) return;
    assisted = true;
    if(current.lesson==='custom') {
      const synth=window.speechSynthesis;
      const voice=synth && synth.getVoices().find(v=>v.localService && /^(zh[-_]HK|yue([-_].*)?)$/i.test(v.lang));
      if(!voice){$('audio-status').textContent='呢部裝置未有本機廣東話聲線。仍然可以用文字字卡練習；題庫卡有預製讀音。';return;}
      synth.cancel(); const utterance=new SpeechSynthesisUtterance(current.text);
      utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=rate;
      utterance.onend=()=>{$('audio-status').textContent='播完喇。';};
      utterance.onerror=()=>{$('audio-status').textContent='裝置未能播放，請再試。';};
      $('audio-status').textContent='用本機廣東話聲線播放…';synth.speak(utterance);return;
    }
    const audio = $('pronunciation');
    audio.pause(); audio.currentTime = 0; audio.playbackRate = rate;
    audio.preservesPitch = true;
    $('audio-status').textContent = rate === 1 ? '播放廣東話讀音…' : '慢速播放，保持音高…';
    const pending = audio.play();
    if(pending) pending.catch(error => {
      if(error.name !== 'AbortError') $('audio-status').textContent = '暫時播放唔到，請檢查網絡／音量，再撳一次。';
    });
  }
  $('listen').addEventListener('click',()=>playAudio(1));
  $('slow').addEventListener('click',()=>playAudio(0.75));
  $('pronunciation').addEventListener('ended',()=>{$('audio-status').textContent='播完喇，可以再聽一次。';});
  $('pronunciation').addEventListener('error',()=>{
    if($('pronunciation').hasAttribute('src')) $('audio-status').textContent='讀音檔未能載入，請檢查網絡，再試一次。';
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
      state=imported;save();settings();customList();start();$('storage-status').textContent='已匯入備份。';
    }catch(error){$('storage-status').textContent=error instanceof SyntaxError ? '唔係有效嘅 JSON 備份，原有進度冇改動。' : error.message;}
    finally{e.target.value='';}
  });
  $('reset').addEventListener('click',()=>{if(confirm('清除呢個瀏覽器嘅全部練習進度？建議先匯出備份。')){state=fresh();save();settings();customList();start();$('storage-status').textContent='已清除本機進度。';}});
  for(const lesson of D.lessons){const option=document.createElement('option');option.value=lesson.id;option.textContent=lesson.title;$('lesson').append(option);}
  let editingId=null;
  function clearCustom(){editingId=null;$('custom-form').reset();$('custom-save').textContent='新增卡';}
  function customList(){
    const list=$('custom-list');list.replaceChildren();
    if(!(state.custom||[]).length){list.textContent='未有自訂卡。';return;}
    for(const card of state.custom){
      const box=document.createElement('div');box.className='custom-card';
      const detail=document.createElement('details'),front=document.createElement('summary');front.textContent=card.text;
      const answer=document.createElement('p');answer.className='romanization';answer.textContent=card.readings[0];
      const note=document.createElement('p');note.textContent=card.note;
      detail.append(front,answer,note);
      const edit=document.createElement('button');edit.type='button';edit.textContent='編輯';
      edit.onclick=()=>{editingId=card.id;$('custom-text').value=card.text;$('custom-jyutping').value=card.readings[0];$('custom-note').value=card.note;$('custom-save').textContent='儲存修改';$('custom-text').focus();};
      const remove=document.createElement('button');remove.type='button';remove.textContent='刪除';
      remove.onclick=()=>{if(!confirm('刪除「'+card.text+'」同佢嘅練習記錄？'))return;state.custom=state.custom.filter(c=>c.id!==card.id);for(const records of Object.values(state.records))delete records[card.id];if(editingId===card.id)clearCustom();save();customList();start();};
      box.append(detail,edit,remove);list.append(box);
    }
  }
  $('custom-form').addEventListener('submit',e=>{
    e.preventDefault();
    const card={id:editingId || 'custom-'+crypto.randomUUID(),lesson:'custom',text:$('custom-text').value.trim(),readings:[$('custom-jyutping').value.trim().toLowerCase().replace(/\s+/g,' ')],note:$('custom-note').value.trim()};
    const candidate={...state,custom:[...(state.custom||[]).filter(c=>c.id!==card.id),card]};
    try{JP.validateBackup(candidate,D.cards,D.lessons);}catch(_){$('custom-status').textContent='未儲存：請用 1–24 個中文字，每字一個有效粵拼音節（帶 1–6 聲調，以空格分開）；最多 1000 張。';return;}
    if(editingId)for(const records of Object.values(state.records))delete records[card.id];
    state=candidate;save();clearCustom();customList();start();$('custom-status').textContent='已儲存「'+card.text+'」。';
  });
  $('custom-cancel').onclick=clearCustom;
  $('custom-practice').onclick=()=>{state.settings.lesson='custom';save();settings();start();$('target').scrollIntoView({block:'center'});};
  $('custom-current').onclick=()=>{if(!current)return;clearCustom();$('custom-text').value=current.text;$('custom-jyutping').value=current.readings[0];$('custom-note').value=$('answer').value ? '我之前輸入：'+$('answer').value : '';$('custom-status').textContent='已填入目前題目，撳「新增卡」儲存。';};
  $('custom-export').onclick=()=>{
    const clean=s=>s.replace(/[\t\r\n]+/g,' ').replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
    const text=(state.custom||[]).map(c=>[c.text,c.readings[0],c.note].map(clean).join('\t')).join('\n');
    const url=URL.createObjectURL(new Blob([text],{type:'text/tab-separated-values;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='my-jyutping-flashcards.tsv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    $('custom-status').textContent='已準備 '+(state.custom||[]).length+' 張卡下載（中文字／粵拼／備註）。';
  };
  customList();settings();start();
})();
