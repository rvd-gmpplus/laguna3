"""Eigendomscontrole voor een agenttak vóór het samenvoegen.

    python3 tools/orkestratie/mergecheck.py DOMEIN COMMIT [BASIS]

Meldt welke bestanden de tak wijzigt, of ze binnen het eigendom van het domein vallen, en of alleen-lezen
bestanden (testbestanden van de orkestrator, index.html, docs) zijn aangeraakt. Exitcode 1 bij een overtreding.
"""
import os, sys, subprocess, fnmatch

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OWN = {
    'app': ['src/head.html', 'src/core.js', 'src/app1.js', 'src/presetdata.js', 'src/presets.js', 'src/app2.js', 'tools/itest.py', 'tools/ui_*.py', 'tools/opentest.py'],
    'body': ['src/body.js', 'src/bodyparts.js', 'src/panorama.js'],
    'engine': ['src/engine1.js', 'src/engine2.js', 'src/engine3.js'],
    'drivetrain': ['src/drivetrain.js'],
    'chassis': ['src/chassis.js'],
    'interior': ['src/interior.js'],
    'systems': ['src/systems.js'],
    'data': ['src/partnumbers.js', 'docs/onderdeelnummers.csv', 'docs/onderdeelnummers-schema.md', 'data/*', 'tools/orkestratie/build_pn.py', 'tools/pncheck.py'],
    'docs': ['README.md', 'docs/*.md', 'docs/screenshots/*', 'CHANGELOG.md', 'handomdraai.md'],
    # de orkestrator mag alles; deze lijst dient om een orkestratortak te laten zien wat hij raakt
    'orkestrator': ['*'],
}
# Alleen-lezen voor domeineigenaars: contracten, testscripts, poortbestanden en de gebouwde pagina. Wijzigen alleen door de orkestrator.
READONLY = ['build.py', 'auto.json', 'framework.json', 'tools/framework.py', 'VERSION', 'requirements.txt', 'LICENSE', 'CLAUDE.md', '.claude/*', 'tools/setup.sh', 'tools/harness.py', 'tools/smoke.py',
            'tools/integrity.py', 'tools/silhouette.py', 'tools/pubsmoke.py', 'tools/tri.py', 'tools/shot.py', 'tools/anchors.json',
            'tools/open_allow.json', 'tools/orkestratie/*', 'index.html', 'docs/*', 'README.md', 'CHANGELOG.md', 'src/core.js', 'src/body.js']


def main():
    if len(sys.argv) < 3 or sys.argv[1] not in OWN:
        print(__doc__); print('domeinen:', ', '.join(OWN)); return 2
    dom, commit = sys.argv[1], sys.argv[2]
    base = sys.argv[3] if len(sys.argv) > 3 else subprocess.run(['git', '-C', REPO, 'merge-base', 'HEAD', commit], capture_output=True, text=True).stdout.strip()
    files = subprocess.run(['git', '-C', REPO, 'diff', '--name-only', f'{base}..{commit}'], capture_output=True, text=True, check=True).stdout.split()
    bad = []
    for f in files:
        owned = any(fnmatch.fnmatch(f, p) for p in OWN[dom])
        ro = any(fnmatch.fnmatch(f, p) for p in READONLY)
        tag = 'eigen' if owned else ('ALLEEN-LEZEN' if ro else 'VAN EEN ANDER')
        if not owned:
            bad.append(f)
        print(f'  {tag:14s} {f}')
    stat = subprocess.run(['git', '-C', REPO, 'diff', '--shortstat', f'{base}..{commit}'], capture_output=True, text=True).stdout.strip()
    print(f'{dom}: {len(files)} bestanden, {stat}; basis {base[:7]}, tak {commit[:7]}')
    if bad:
        print('OVERTREDINGEN:', *bad)
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
