(function (root) {
  'use strict';
  function grade(card, answer, mode, tones) {
    const chinese = value => String(value || '').normalize('NFC').replace(/[\s\p{P}]/gu, '');
    const normalize = value => mode === 'typing' ? chinese(value) : String(value || '').toLowerCase().replace(/[\s'’\-]/g, '').replace(tones ? /$^/g : /[1-6]/g, '');
    const input = normalize(answer);
    const expected = mode === 'typing' ? [card.text] : card.readings;
    return { correct: Boolean(input) && expected.some(r => normalize(r) === input), empty: !input };
  }
  function split(syllable) {
    const match = String(syllable).match(/^([a-z]+)([1-6])$/);
    if (!match) return null;
    const body = match[1];
    const initial = /^(m|ng)$/.test(body) ? '' : ((body.match(/^(gw|kw|ng|[bpmfdtnlgkhwzcsj])/) || [''])[0]);
    return { initial, rhyme: body.slice(initial.length), tone: match[2] };
  }
  function review(previous, correct, assisted, now) {
    const p = previous || { attempts: 0, correct: 0, mistakes: 0, streak: 0 };
    const streak = correct && !assisted ? Math.min((p.streak || 0) + 1, 6) : 0;
    const intervals = [60000, 600000, 86400000, 259200000, 604800000, 1209600000, 2592000000];
    return { attempts: (p.attempts || 0) + 1, correct: (p.correct || 0) + (correct && !assisted ? 1 : 0), mistakes: (p.mistakes || 0) + (!correct ? 1 : 0), streak, due: now + intervals[streak], last: now };
  }
  function queue(cards, records, now) {
    const due = cards.filter(c => records[c.id] && records[c.id].due <= now);
    due.sort((a,b) => (records[b.id].mistakes || 0) - (records[a.id].mistakes || 0) || records[a.id].due - records[b.id].due);
    return due.concat(cards.filter(c => !records[c.id]));
  }
  function validateBackup(data, cards, lessons) {
    const fail = () => { throw new Error('唔係有效嘅練習備份，原有進度冇改動。'); };
    if (!data || data.version !== 1 || !data.records || typeof data.records !== 'object' || Array.isArray(data.records)) fail();
    const settings = data.settings;
    if (!settings || !['typing','spelling'].includes(settings.mode) || typeof settings.tones !== 'boolean' || !['all', ...lessons.map(l => l.id)].includes(settings.lesson)) fail();
    const result = { version: 1, settings: { mode: settings.mode, lesson: settings.lesson, tones: settings.tones }, records: { typing: {}, spelling: {}, tones: {} } };
    const ids = new Set(cards.map(c => c.id));
    if (data.custom !== undefined) {
      if (!Array.isArray(data.custom) || data.custom.length > 1000) fail();
      result.custom = [];
      for (const card of data.custom) {
        if (!card || !/^custom-[a-zA-Z0-9-]{1,80}$/.test(card.id) || ids.has(card.id) || card.lesson !== 'custom') fail();
        if (typeof card.text !== 'string' || !/^[\p{Script=Han}]{1,24}$/u.test(card.text) || typeof card.note !== 'string' || card.note.length > 500) fail();
        if (!Array.isArray(card.readings) || card.readings.length !== 1 || typeof card.readings[0] !== 'string' || card.readings[0].length > 300) fail();
        const syllables = card.readings[0].split(' ');
        if (syllables.length !== [...card.text].length || !syllables.every(s => /^[a-z]+[1-6]$/.test(s) && split(s))) fail();
        result.custom.push({id:card.id, text:card.text, readings:[card.readings[0]], lesson:'custom', note:card.note});
        ids.add(card.id);
      }
    }
    for (const mode of Object.keys(data.records)) if (!['typing','spelling','tones'].includes(mode)) fail();
    for (const mode of ['typing','spelling','tones']) {
      const records = data.records[mode] || {};
      if (typeof records !== 'object' || Array.isArray(records)) fail();
      for (const [id, value] of Object.entries(records)) {
        if (!ids.has(id) || !value || typeof value !== 'object') fail();
        const r = {};
        for (const k of ['attempts','correct','mistakes','streak','due','last']) {
          if (!Number.isSafeInteger(value[k]) || value[k] < 0) fail();
          r[k] = value[k];
        }
        if (r.streak > 6 || r.correct + r.mistakes > r.attempts) fail();
        result.records[mode][id] = r;
      }
    }
    return result;
  }
  const api = { grade, split, review, queue, validateBackup };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.JP = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
