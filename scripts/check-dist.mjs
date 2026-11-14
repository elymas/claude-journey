import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const root = path.resolve('dist');
const base = process.env.VITE_BASE_PATH || '/';
assert(base.startsWith('/') && base.endsWith('/'), 'Base must start and end with /');
let references=0;
function verify(value, from) {
  if(!value || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value))return;
  const url=new URL(value, 'https://example.test'+base+path.relative(root,from));
  assert(url.pathname.startsWith(base), `Reference escapes project base: ${value} in ${from}`);
  const relative=decodeURIComponent(url.pathname.slice(base.length));
  let resolved=path.resolve(root,relative);
  assert(resolved===root||resolved.startsWith(root+path.sep),'Reference escapes dist');
  if(fs.existsSync(resolved)&&fs.statSync(resolved).isDirectory())resolved=path.join(resolved,'index.html');
  assert(fs.existsSync(resolved),`Missing static file: ${url.pathname} (${value})`);
  references++;
}
function scan(dir){
  for(const item of fs.readdirSync(dir,{withFileTypes:true})){
    const file=path.join(dir,item.name);
    assert(!item.isSymbolicLink(),`Symlink cannot be published: ${file}`);
    if(item.isDirectory()){scan(file);continue;}
    if(file.endsWith('.html')){
      const {document}=parseHTML(fs.readFileSync(file,'utf8'));
      for(const e of document.querySelectorAll('[href],[src]'))for(const attr of ['href','src'])verify(e.getAttribute(attr),file);
      for(const style of document.querySelectorAll('style'))checkCss(style.textContent,file);
    }else if(file.endsWith('.css'))checkCss(fs.readFileSync(file,'utf8'),file);
  }
}
function checkCss(css,file){for(const match of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g))verify(match[1],file)}
for(let week=1;week<=8;week++)assert(fs.existsSync(path.join(root,`lessons/week-${week}.html`)));
scan(root);
console.log(`PASS: ${references} local HTML/CSS references resolve under ${base}; all 8 lessons exist.`);
