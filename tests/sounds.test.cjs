const {test}=require('node:test');
const assert=require('node:assert/strict');
const S=require('../sounds.js');
test('sound manifest is complete, unique and source-bound',()=>{
 assert.equal(Object.keys(S.initials).length,19);assert.equal(Object.keys(S.finals).length,60);
 const displayed=S.groups.flatMap(g=>g.symbols);
 assert.equal(new Set(displayed).size,displayed.length);
 assert.deepEqual([...displayed].sort(),Object.keys(S.finals).sort());
 for(const kind of ['initials','finals'])for(const [symbol,item] of Object.entries(S[kind])){
  const url=new URL(item.url);assert.equal(url.origin,'https://opencantonese.org');
  assert.match(url.pathname,new RegExp('/'+(kind==='initials'?'initial':'final')+'-\\d{2}-'+symbol+'\\.mp3$'));
  assert.equal(Number.isInteger(item.order),true);
 }
 assert.ok(S.groups.find(g=>g.symbols.includes('eo')).note.includes('韻腹'));
 assert.equal(Object.hasOwn(S.initials,'∅'),false);
});
