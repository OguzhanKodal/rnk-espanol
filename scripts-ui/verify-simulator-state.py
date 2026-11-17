"""Read-only check after capture-simulator's persist state and app relaunch."""
import json, os, sqlite3, subprocess
from pathlib import Path
env={**os.environ,'DEVELOPER_DIR':'/Applications/Xcode.app/Contents/Developer'}
container=subprocess.check_output(['xcrun','simctl','get_app_container','booted','host.exp.Exponent','data'],env=env,text=True).strip()
paths=list(Path(container).rglob('risale-reader.db'))
assert paths, 'Reader SQLite DB not found'
for path in paths:
 db=sqlite3.connect(path.as_uri()+'?mode=ro',uri=True)
 data={key:json.loads(value) for key,value in db.execute('SELECT key,value FROM state')}
 marks={m['id']:m for m in data.get('marks',[])}
 if 'dev-highlight' not in marks: continue
 assert marks['dev-highlight']['bold'] is True
 assert marks['dev-highlight']['start']==0 and marks['dev-highlight']['end']==23
 assert marks['dev-note']['note']
 assert marks['dev-bookmark']['blockId']==marks['dev-highlight']['blockId']
 assert data['progress']['ramadan-frugalidad-agradecimiento']['page']>=5
 assert 14<=data['settings']['fontSize']<=34
 print('PASS: bookmark, highlight style/offsets, note, per-book progress and settings survived app relaunch in SQLite.')
 break
else: raise AssertionError('No persisted dev annotations found')
