#!/bin/bash
# Volledige testset op de werktak, uitvoer naar $1 (map). Draait in twee parallelle reeksen.
# Gebruik: tools/orkestratie/finaltests.sh UITVOERMAP
OUT="$(mkdir -p "$1" && cd "$1" && pwd)"; R="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$R" || exit 1
git log --oneline -1 > "$OUT/commit.txt"
python3 build.py --lint > "$OUT/lint.txt" 2>&1; echo "exit $?" >> "$OUT/lint.txt"
( python3 tools/smoke.py > "$OUT/smoke.txt" 2>&1; echo "exit $?" >> "$OUT/smoke.txt"
  python3 tools/integrity.py > "$OUT/integ.txt" 2>&1; echo "exit $?" >> "$OUT/integ.txt"
  python3 tools/silhouette.py > "$OUT/sil.txt" 2>&1; echo "exit $?" >> "$OUT/sil.txt"
  python3 tools/ui_inner.py --open > "$OUT/inner.txt" 2>&1; echo "exit $?" >> "$OUT/inner.txt"
  python3 tools/opentest.py --out "$OUT/opentest" > "$OUT/opentest.txt" 2>&1; echo "exit $?" >> "$OUT/opentest.txt" ) &
( ITEST_GATES=1 python3 tools/itest.py > "$OUT/itest.txt" 2>&1; echo "exit $?" >> "$OUT/itest.txt"
  python3 tools/tri.py > "$OUT/tri.txt" 2>&1; echo "exit $?" >> "$OUT/tri.txt"
  python3 tools/pubsmoke.py > "$OUT/pub.txt" 2>&1; echo "exit $?" >> "$OUT/pub.txt"
  python3 "$R/tools/orkestratie/stats.py" "$R" "$OUT/stats.json" > "$OUT/stats.txt" 2>&1; echo "exit $?" >> "$OUT/stats.txt" ) &
wait
for f in lint smoke integ sil inner opentest itest tri pub stats; do echo "== $f: $(tail -n 3 "$OUT/$f.txt" | tr '\n' ' ' | cut -c1-260)"; done
