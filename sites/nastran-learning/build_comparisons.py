"""Compile authored comparisons; no model or solver data are generated."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
data = json.loads((ROOT / 'card-comparisons.json').read_text(encoding='utf-8'))
keys = [t['key'] for t in data['topics']]
assert len(keys) == len(set(keys))
assert all(alias not in keys and target in keys for alias, target in data.get('aliases', {}).items())
for topic in data['topics']:
    assert all(len(row) == len(topic['columns']) + 1 for row in topic['differences']), topic['key']
    assert all(key in keys for key in topic['related']), topic['key']
    for field in ['summary', 'common', 'choose', 'results', 'pitfalls', 'cards', 'pages']:
        assert topic[field], (topic['key'], field)
    recommendations = topic['recommendations']
    assert len(recommendations) >= 2, topic['key']
    names = set()
    for name, advantage, limitation, use in recommendations:
        assert name and advantage and limitation and use, (topic['key'], name)
        assert name not in names and name.split('（', 1)[0] in topic['cards'], (topic['key'], name)
        names.add(name)
(ROOT / 'dist/comparison-data.js').write_text(
    'window.CardComparisons=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n',
    encoding='utf-8', newline='\n')
index = [{'key': t['key'], 'title': t['title'], 'summary': t['summary'], 'cards': t['cards']} for t in data['topics']]
(ROOT / 'dist/comparison-index.js').write_text(
    'window.CardComparisonIndex=' + json.dumps(index, ensure_ascii=False, separators=(',', ':')) + ';\n',
    encoding='utf-8', newline='\n')
print(f'Built {len(keys)} comparison topics and reciprocal card links.')
