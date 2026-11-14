"""Correct OCR only against matching authored lesson phrases, preserving digits."""
from pathlib import Path
import json, re, difflib

root = Path(__file__).resolve().parent.parent
shots = json.loads((root / 'research/screenshot-text.json').read_text())
corpus = json.loads((root / 'research/content-vocabulary.json').read_text())
def normalized(s):
    return re.sub(r'[^a-z0-9가-힣]', '', s.lower())
lookup = {}
for text in corpus:
    n = normalized(text)
    if len(n) >= 5:
        lookup.setdefault(n, text)
changes = []
cache = {}
for shot in shots:
    for line in shot['lines']:
        before = line['text']
        n = normalized(before)
        if n not in cache:
            candidates = [c for c in lookup if .75 * len(n) <= len(c) <= 1.25 * len(n) and re.findall(r'\d+', c) == re.findall(r'\d+', n)]
            match = difflib.get_close_matches(n, candidates, n=1, cutoff=.8) if len(n)>=7 and re.search('[가-힣]', n) else []
            cache[n] = lookup[match[0]] if match else None
        after = cache[n]
        if after and after != before:
            changes.append({'image':shot['id'],'before':before,'after':after})
            line['text'] = after
(root / 'research/screenshot-text-refined.json').write_text(json.dumps(shots, ensure_ascii=False, indent=2)+'\n')
(root / 'research/ocr-corrections.json').write_text(json.dumps(changes, ensure_ascii=False, indent=2)+'\n')
print(f'Matched {len(changes)} image text lines to exact authored phrases.')
