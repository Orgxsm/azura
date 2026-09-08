#!/usr/bin/env python3
"""Assemble les modules de src/ en un seul fichier HTML autonome.

Usage :  python3 build.py            -> dist/Azura-3D.html (+ copie dans ~/Downloads si présent)
         python3 build.py --check    -> assemble puis vérifie la syntaxe JS avec node
L'ordre de concaténation compte (les const sont initialisées dans l'ordre) : ne pas le changer sans lire COLLAB.md.
"""
import os, sys, subprocess, shutil, tempfile, glob

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
DIST = os.path.join(ROOT, 'dist')
ORDER = ['core.js', 'archipel.js', 'island.js', 'islands/*.js', 'scene_end.js', 'util.js', 'rig.js', 'shaders.js', 'world.js', 'audio.js', 'game.js', 'anim.js', 'render.js']

def read(name):
    with open(os.path.join(SRC, name), encoding='utf-8') as f:
        return f.read()

def build():
    ui = read('ui.html')
    boot = read('boot.html')
    names = []
    for n in ORDER:
        if '*' in n:
            names += sorted(os.path.relpath(p, SRC) for p in glob.glob(os.path.join(SRC, n)))
        else:
            names.append(n)
    parts = []
    for n in names:
        src = read(n)
        if n.startswith('islands/'):
            iid = os.path.splitext(os.path.basename(n))[0]
            src = "sceneMarks.push({id:'%s',start:verts.length/9});\n" % iid + src + "\nsceneMarks[sceneMarks.length-1].end=verts.length/9;\n"
        parts.append(src)
    js = '\n'.join(parts)
    html = ui + '\n' + boot + '<script>\n(function(){\n' + js + '\n})();\n</script></body></html>\n'
    os.makedirs(DIST, exist_ok=True)
    out = os.path.join(DIST, 'Azura-3D.html')
    with open(out, 'w', encoding='utf-8') as f:
        f.write(html)
    dl = os.path.expanduser('~/Downloads')
    if os.path.isdir(dl):
        shutil.copy(out, os.path.join(dl, 'Azura-3D.html'))
    print('écrit', out, len(html), 'octets')
    return js

def check(js):
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
        f.write('(function(){\n' + js + '\n})();')
        path = f.name
    try:
        r = subprocess.run(['node', '--check', path], capture_output=True, text=True)
        if r.returncode:
            print(r.stderr); sys.exit(1)
        print('syntaxe OK')
    finally:
        os.unlink(path)

if __name__ == '__main__':
    js = build()
    if '--check' in sys.argv:
        check(js)
