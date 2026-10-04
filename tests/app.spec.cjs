const { test, expect } = require('@playwright/test');
test('TypeDuck target, blank answer, wrong answer, hint, correct text, reload persistence', async ({page}) => {
  await page.goto('./');
  await expect(page.locator('#target')).toHaveText('夏天');
  await expect(page.locator('#solution')).toBeHidden();
  await page.locator('#check').click();
  await expect(page.locator('#feedback')).toContainText('先輸入');
  await expect(page.locator('#attempts')).toHaveText('0');
  await page.locator('#answer').fill('冬天');
  await page.locator('#check').click();
  await expect(page.locator('#feedback')).toContainText('未啱');
  await expect(page.locator('#solution')).toBeVisible();
  await page.locator('#answer').fill('夏天');
  await page.locator('#check').click();
  await expect(page.locator('#feedback')).toContainText('打啱');
  await page.reload();
  await expect(page.locator('#attempts')).toHaveText('1');
  const data = await page.evaluate(() => JSON.parse(localStorage.getItem('jyutping-practice-v1')));
  expect(data.records.typing['structure-1'].mistakes).toBe(1);
});

test('spelling, tone toggle and per-mode records remain distinct', async ({page}) => {
  await page.goto('./');
  await page.locator('#mode').selectOption('spelling');
  await page.locator('#answer').fill('haa tin');
  await page.locator('#check').click();
  await expect(page.locator('#feedback')).toContainText('拼啱');
  await page.locator('#tones').check();
  await page.locator('#answer').fill('haa tin');
  await page.locator('#check').click();
  await expect(page.locator('#feedback')).toContainText('未啱');
  await page.locator('#answer').fill('haa6 tin1');
  await page.locator('#check').click();
  await expect(page.locator('#feedback')).toContainText('拼啱');
  const data = await page.evaluate(() => JSON.parse(localStorage.getItem('jyutping-practice-v1')));
  expect(data.records.spelling['structure-1'].streak).toBe(1);
  expect(data.records.tones['structure-1'].streak).toBe(0);
  expect(data.records.typing).toEqual({});
});
test('hints do not advance mastery and IME composition does not grade', async ({page}) => {
  await page.goto('./');
  await page.locator('#hint').click();
  await expect(page.locator('#solution')).toContainText('h + …');
  await page.locator('#answer').fill('夏天');
  await page.locator('#answer').dispatchEvent('compositionstart');
  await page.locator('#check').click();
  await expect(page.locator('#attempts')).toHaveText('0');
  await page.locator('#answer').dispatchEvent('compositionend');
  await page.locator('#check').click();
  const data=await page.evaluate(() => JSON.parse(localStorage.getItem('jyutping-practice-v1')));
  expect(data.records.typing['structure-1'].streak).toBe(0);
  await page.locator('#next').click();
  await expect(page.locator('#target')).toHaveText('今天');
});
test('export/import round trip, bad import preservation, no third-party requests or errors', async ({page}) => {
  const errors=[]; const external=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(!r.url().startsWith(new URL(page.context()._options.baseURL).origin))external.push(r.url());});
  await page.goto('./');
  await page.locator('#answer').fill('夏天'); await page.locator('#check').click();
  await page.getByText('進度與備份',{exact:true}).click();
  const downloadPromise=page.waitForEvent('download'); await page.locator('#export').click();
  const download=await downloadPromise;
  const file=await download.path();
  const before=await page.evaluate(()=>localStorage.getItem('jyutping-practice-v1'));
  await page.locator('#import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"version":77}')});
  await expect(page.locator('#storage-status')).toContainText('原有進度冇改動');
  expect(await page.evaluate(()=>localStorage.getItem('jyutping-practice-v1'))).toBe(before);
  page.once('dialog',d=>d.accept()); await page.locator('#reset').click();
  await expect(page.locator('#attempts')).toHaveText('0');
  page.once('dialog',d=>d.accept()); await page.locator('#import').setInputFiles(file);
  await expect(page.locator('#storage-status')).toHaveText('已匯入備份。');
  await expect(page.locator('#attempts')).toHaveText('1');
  expect(errors).toEqual([]);expect(external).toEqual([]);
});
test('narrow and landscape layouts fit viewport; lesson video has timestamp', async ({page}) => {
  await page.goto('./');
  await page.locator('#lesson').selectOption('eo');
  await expect(page.locator('#video')).toHaveAttribute('href',/t=2356s$/);
  for(const size of [{width:320,height:640},{width:844,height:390}]){
    await page.setViewportSize(size);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    expect(await page.locator('#answer').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
  }
});
