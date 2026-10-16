#!/bin/bash
# Linux-testomgeving lag3-vm met Apple container (macOS, CLI `container` 1.5.0 of later). Elke container is een eigen
# lichte Linux-VM. De Linux-basislijn van visdiff (docs/baseline) komt uit deze VM; zie docs/testen.md.
#
#   tools/lag3-vm.sh start          image laden of bouwen (eenmalig) en de VM starten
#   tools/lag3-vm.sh test [UITMAP]  volledige set in de VM (finaltests.sh), uitvoer onder UIT (standaard /out/ft-<commit>)
#   tools/lag3-vm.sh sh [CMD...]    shell of commando in /repo in de VM
#   tools/lag3-vm.sh status | stop | rm
#
# Vaste instellingen: naam lag3-vm, image lag3-vm:1 (linux/arm64, Ubuntu 24.04), 4 CPU's, 8 GB geheugen;
# koppelingen: deze repo op /repo, ~/.cache/explosietekening op /root/.cache/explosietekening (three.js en Fonts-cache),
# ~/.cache/explosietekening/lag3-vm/out op /out (uitvoer).
set -euo pipefail
NAME=lag3-vm
IMG=lag3-vm:1
R="$(cd "$(dirname "$0")/.." && pwd)"
CACHE="$HOME/.cache/explosietekening"
ARCH="$CACHE/lag3-vm/lag3-vm-1.oci.tar"
OUT="$CACHE/lag3-vm/out"

have_img() { container image list 2>/dev/null | awk '{print $1":"$2}' | grep -qx "$IMG"; }
running() { container list 2>/dev/null | awk 'NR>1{print $1}' | grep -qx "$NAME"; }
exists() { container list --all 2>/dev/null | awk 'NR>1{print $1}' | grep -qx "$NAME"; }

ensure_img() {
  have_img && return
  if [ -f "$ARCH" ]; then
    echo "image laden uit $ARCH"; container image load --input "$ARCH"
  else
    echo "geen archief; image bouwen uit tools/vm/Containerfile"; container build --tag "$IMG" --file "$R/tools/vm/Containerfile" "$R/tools/vm"
  fi
}

case "${1:-status}" in
  start)
    container system status >/dev/null 2>&1 || container system start
    ensure_img
    mkdir -p "$OUT" "$CACHE"
    python3 "$R/tools/harness.py" --ensure-three >/dev/null   # three.js in de gedeelde cache (npm ontbreekt in de VM)
    if running; then echo "$NAME draait al"; exit 0; fi
    exists && container rm "$NAME" >/dev/null
    container run -d --name "$NAME" --cpus 4 --memory 8G \
      -v "$R":/repo -v "$CACHE":/root/.cache/explosietekening -v "$OUT":/out \
      "$IMG" sleep infinity >/dev/null
    container exec "$NAME" git config --global --add safe.directory '*'
    container exec "$NAME" bash -c 'uname -sr; . /etc/os-release; echo "$PRETTY_NAME"; python3 -c "import playwright; print(\"playwright ok\")"'
    ;;
  test)
    shift; c=$(git -C "$R" rev-parse --short HEAD); u="${1:-/out/ft-$c}"
    container exec "$NAME" bash -c "cd /repo && tools/orkestratie/finaltests.sh '$u'; rc=\$?; for f in '$u'/*.txt; do echo \"\$(basename \$f): \$(tail -1 \$f)\"; done; exit \$rc"
    ;;
  sh)
    shift
    if [ $# -eq 0 ]; then container exec -it "$NAME" bash -c 'cd /repo && exec bash'; else container exec "$NAME" bash -c "cd /repo && $*"; fi
    ;;
  status) container list --all | awk 'NR==1 || $1=="'"$NAME"'"' ;;
  stop) container stop "$NAME" ;;
  rm) container stop "$NAME" 2>/dev/null || true; container rm "$NAME" ;;
  *) sed -n '2,13p' "$0"; exit 2 ;;
esac
