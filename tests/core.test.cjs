const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const file = path.join(__dirname, '../core.js');
const C = fs.existsSync(file) ? require(file) : {};
test('Jyutping matching accepts case, separators and optional tones but not different spellings', () => {
  assert.equal(typeof C.grade, 'function', 'Missing Jyutping answer grading');
  const card = { text: '香港', readings: ['hoeng1 gong2'] };
  assert.equal(C.grade(card, ' HOENG gong ', 'spelling', false).correct, true);
  assert.equal(C.grade(card, 'hoeng1gong2', 'spelling', false).correct, true);
  assert.equal(C.grade(card, "hoeng'gong", 'spelling', false).correct, true);
  assert.equal(C.grade(card, 'heong gong', 'spelling', false).correct, false);
  assert.equal(C.grade(card, '', 'spelling', false).empty, true);
});
test('tone practice requires the correct numbers and rejects invalid digits', () => {
  const card = { text: '香港', readings: ['hoeng1 gong2'] };
  assert.equal(C.grade(card, 'hoeng1 gong2', 'spelling', true).correct, true);
  assert.equal(C.grade(card, 'hoeng gong', 'spelling', true).correct, false);
  assert.equal(C.grade(card, 'hoeng2 gong1', 'spelling', true).correct, false);
  assert.equal(C.grade(card, 'hoeng7 gong2', 'spelling', false).correct, false);
});
test('spelling decomposes two-letter initials, zero initials and syllabic ng', () => {
  assert.equal(typeof C.split, 'function', 'Missing syllable decomposition');
  assert.deepEqual(C.split('gwong1'), { initial: 'gw', rhyme: 'ong', tone: '1' });
  assert.deepEqual(C.split('ngaa4'), { initial: 'ng', rhyme: 'aa', tone: '4' });
  assert.deepEqual(C.split('ng5'), { initial: '', rhyme: 'ng', tone: '5' });
  assert.deepEqual(C.split('aa3'), { initial: '', rhyme: 'aa', tone: '3' });
  assert.deepEqual(C.split('jyu4'), { initial: 'j', rhyme: 'yu', tone: '4' });
});
test('review scheduling keeps mistakes and assisted recall soon; grows unaided intervals', () => {
  assert.equal(typeof C.review, 'function', 'Missing review scheduling');
  const now = 1000000;
  const wrong = C.review(null, false, false, now);
  assert.equal(wrong.due, now + 60000);
  assert.equal(wrong.streak, 0);
  assert.equal(wrong.mistakes, 1);
  const assisted = C.review(null, true, true, now);
  assert.equal(assisted.streak, 0);
  assert.equal(assisted.due, now + 60000);
  const right = C.review(null, true, false, now);
  assert.equal(right.streak, 1);
  assert.equal(right.due, now + 600000);
  assert.equal(C.review(right, true, false, now).due, now + 86400000);
});
test('practice queue prioritizes due mistakes then unseen cards, and excludes future cards', () => {
  assert.equal(typeof C.queue, 'function', 'Missing due queue');
  const cards = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
  const records = { a: { due: 9999, mistakes: 0 }, c: { due: 3, mistakes: 2 }, d: { due: 2, mistakes: 0 } };
  assert.deepEqual(C.queue(cards, records, 100).map(c => c.id), ['c', 'd', 'b']);
});

test('backup validation accepts known progress and rejects malformed or hostile content', () => {
  assert.equal(typeof C.validateBackup, 'function', 'Missing backup validation');
  const cards = [{id:'a'}], lessons = [{id:'structure'}];
  const valid = { version: 1, settings: { mode:'typing', lesson:'all', tones:false }, records:{typing:{a:{ attempts:1, correct:0, mistakes:1, streak:0, due:60000, last:0 }}, spelling:{}, tones:{}} };
  assert.deepEqual(C.validateBackup(valid,cards,lessons), valid);
  assert.throws(() => C.validateBackup({...valid, version:2},cards,lessons));
  assert.throws(() => C.validateBackup({...valid, records:{typing:{unknown:valid.records.typing.a}}},cards,lessons));
  const malformed = JSON.parse(JSON.stringify(valid)); malformed.records.typing.a.due = -1;
  assert.throws(() => C.validateBackup(malformed,cards,lessons));
  assert.throws(() => C.validateBackup(JSON.parse('{"version":1,"records":{"typing":{"__proto__":{}}}}'),cards,lessons));
});

test('custom flashcards survive backups and reject invalid spellings, ids and counts', () => {
  const data={version:1,settings:{mode:'typing',lesson:'custom',tones:false},custom:[{id:'custom-test1',text:'地衣',readings:['dei6 ji1'],lesson:'custom',note:'自己嘅字卡'}],records:{typing:{},spelling:{},tones:{}}};
  const lessons=[{id:'custom'}];
  assert.deepEqual(C.validateBackup(data,[],lessons).custom,data.custom);
  const saved=JSON.parse(JSON.stringify(data));
  saved.records.typing['custom-test1']={attempts:1,correct:0,mistakes:1,streak:0,due:60000,last:0};
  assert.ok(C.validateBackup(saved,[],lessons).records.typing['custom-test1']);
  for(const change of [{id:'__proto__'},{readings:['dei6']},{readings:['dei7 ji1']},{text:'<script>'}]){
    const invalid=JSON.parse(JSON.stringify(data));Object.assign(invalid.custom[0],change);
    assert.throws(()=>C.validateBackup(invalid,[],lessons));
  }
});

test('deck has stable unique ids and valid readings for every target character', () => {
  const p = path.join(__dirname, '../deck.js');
  assert.ok(fs.existsSync(p), 'Missing verified learning deck');
  const deck = require(p);
  assert.equal(new Set(deck.cards.map(c => c.id)).size, deck.cards.length);
  assert.ok(deck.cards.length >= 60);
  for (const card of deck.cards) {
    assert.ok(deck.lessons.some(l => l.id === card.lesson));
    for (const reading of card.readings) {
      assert.equal(reading.split(' ').length, [...card.text].length, card.text);
      assert.ok(reading.split(' ').every(s => C.split(s)), card.text);
    }
  }
});

test('TypeDuck practice checks committed Chinese, ignores spacing and punctuation, not Latin input', () => {
  const card = { text: '香港', readings: ['hoeng1 gong2'] };
  assert.equal(C.grade(card, '香 港！', 'typing', false).correct, true);
  assert.equal(C.grade(card, '香江', 'typing', false).correct, false);
  assert.equal(C.grade(card, 'hoeng gong', 'typing', false).correct, false);
  assert.equal(C.grade(card, '？！', 'typing', false).empty, true);
});
