"""Compile authored comparisons; no model or solver data are generated."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
data = json.loads((ROOT / 'card-comparisons.json').read_text(encoding='utf-8'))
keys = [t['key'] for t in data['topics']]
assert len(keys) == len(set(keys)) == 13
for topic in data['topics']:
    assert all(len(row) == len(topic['columns']) + 1 for row in topic['differences']), topic['key']
    assert all(key in keys for key in topic['related']), topic['key']
    for field in ['summary', 'common', 'choose', 'results', 'pitfalls', 'cards', 'pages']:
        assert topic[field], (topic['key'], field)
(ROOT / 'dist/comparison-data.js').write_text(
    'window.CardComparisons=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n',
    encoding='utf-8', newline='\n')
index = [{'key': t['key'], 'title': t['title'], 'cards': t['cards']} for t in data['topics']]
(ROOT / 'dist/comparison-index.js').write_text(
    'window.CardComparisonIndex=' + json.dumps(index, ensure_ascii=False, separators=(',', ':')) + ';\n',
    encoding='utf-8', newline='\n')
print(f'Built {len(keys)} comparison topics and reciprocal card links.')
