import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {parseHTML} from 'linkedom';
import path from 'node:path';

const baseline=JSON.parse(fs.readFileSync('research/content-baseline.json','utf8'));
let scenes=0, questions=0, images=0;
for(const record of baseline){
  const file=`public/lessons/week-${record.week}.html`;
  const html=fs.readFileSync(file,'utf8');
  const {document}=parseHTML(html);
  const slides=[...document.querySelectorAll('section.slide')];
  assert.equal(slides.length,record.count,`Week ${record.week} scene count`);
  const hashes=slides.map(s=>crypto.createHash('sha256').update(s.textContent.replace(/\s+/g,' ').trim()).digest('hex'));
  assert.deepEqual(hashes,record.hashes,`Week ${record.week} original lesson text`);
  assert(!/KIST|rhdms21109|오고은/.test(html),`Week ${record.week} author credit`);
  assert(!/data:image\/[a-z]+;base64/.test(html),`Week ${record.week} old raster`);
  for(const script of document.querySelectorAll('script:not([src])'))new vm.Script(script.textContent);
  for(const image of document.querySelectorAll('img[src]')){
    const src=image.getAttribute('src');if(!src)continue;
    assert(fs.existsSync(path.resolve(path.dirname(file),src)),`Missing image ${src}`);images++;
  }
  for(const quiz of document.querySelectorAll('.qz-card')){
    assert(quiz.querySelector('.qz-a button[data-ok]'),`Missing correct answer in week ${record.week}`);
    for(const b of quiz.querySelectorAll('.qz-a button'))assert(b.getAttribute('data-fb'),`Missing feedback in week ${record.week}`);
    questions++;
  }
  for(const button of document.querySelectorAll('[data-goto]'))assert(document.getElementById(button.getAttribute('data-goto')),`Broken lesson anchor ${button.getAttribute('data-goto')}`);
  scenes+=slides.length;
}
for(const name of ['cabin','cave','grove','hero','fairy','boss','doctor'])assert(fs.existsSync(`public/assets/${name}.webp`));
console.log(`PASS: ${scenes} scenes preserve original text, ${questions} quiz questions have answers and feedback, ${images} instruction image references resolve. No author credit or original raster remains in lessons.`);
