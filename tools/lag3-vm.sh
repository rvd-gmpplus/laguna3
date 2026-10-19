#!/bin/bash
# Linux-testomgeving met Apple container (macOS, CLI `container` 1.5.0 of later). Elke container is een eigen lichte
# Linux-VM. De Linux-basislijn van visdiff (docs/baseline) komt uit dit image; zie docs/testen.md.
#
#   tools/lag3-vm.sh test [--repo PAD] [UITMAP]   volledige set (finaltests.sh) in een tijdelijke container die na de run
#                                                 vanzelf verdwijnt (container run --rm); uitvoer standaard /out/ft-<repo>-<commit>
#   tools/lag3-vm.sh sh [--repo PAD] [CMD...]     shell of commando in een tijdelijke container
#   tools/lag3-vm.sh start | status | stop | rm   de oude vaste VM lag3-vm (niet meer nodig voor test en sh)
#
# PAD is een repo of een worktree (standaard de repo van dit script; espace5 met --repo ~/Documents/GitHub/espace5). Bij een
# worktree wordt de hoofdrepo op /repo gekoppeld en wijzen GIT_DIR en GIT_WORK_TREE naar de worktree.
# Instellingen: image lag3-vm:1 (linux/arm64, Ubuntu 24.04), LAG3_CPUS (standaard 8), LAG3_MEM (standaard 8G);
# koppelingen: ~/.cache/explosietekening op /root/.cache/explosietekening (three.js en Fonts-cache),
# ~/.cache/explosietekening/lag3-vm/out op /out (uitvoer).
set -euo pipefail
NAME=lag3-vm
IMG=lag3-vm:1
R="$(cd "$(dirname "$0")/.." && pwd)"
CACHE="$HOME/.cache/explosietekening"
ARCH="$CACHE/lag3-vm/lag3-vm-1.oci.tar"
OUT="$CACHE/lag3-vm/out"
CPUS="${LAG3_CPUS:-8}"
MEM="${LAG3_MEM:-8G}"

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

prep() {
  container system status >/dev/null 2>&1 || container system start
  ensure_img
  mkdir -p "$OUT" "$CACHE"
  python3 "$R/tools/harness.py" --ensure-three >/dev/null   # three.js in de gedeelde cache (npm ontbreekt in de VM)
}

# repo of worktree PAD: zet MNT (op /repo te koppelen map), WD (werkmap in de container) en GENV (git-omgeving)
locate() {
  local pad top common
  pad="$(cd "$1" && pwd)"
  top="$(git -C "$pad" rev-parse --show-toplevel)"
  common="$(git -C "$pad" rev-parse --path-format=absolute --git-common-dir)"
  MNT="$(dirname "$common")"; REPO="$(basename "$MNT")"
  if [ "$top" = "$MNT" ]; then
    WD=/repo; GENV=""
  else
    WD="/repo${top#"$MNT"}"
    GENV="export GIT_DIR=/repo/.git/worktrees/$(basename "$(git -C "$pad" rev-parse --absolute-git-dir)") GIT_WORK_TREE=$WD;"
  fi
  COMMIT="$(git -C "$pad" rev-parse --short HEAD)"
}

# tijdelijke container; verdwijnt na afloop (--rm)
tmprun() {
  local tty="$1"; shift
  container run --rm $tty --name "lag3-tmp-$$" --cpus "$CPUS" --memory "$MEM" \
    -v "$MNT":/repo -v "$CACHE":/root/.cache/explosietekening -v "$OUT":/out \
    "$IMG" bash -c "git config --global --add safe.directory '*'; $GENV cd '$WD' && $*"
}

repo_arg() { PAD="$R"; if [ "${1:-}" = "--repo" ]; then PAD="$2"; SHIFTN=2; else SHIFTN=0; fi; }

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
    shift; repo_arg "$@"; shift $SHIFTN
    prep; locate "$PAD"
    u="${1:-/out/ft-$REPO-$COMMIT}"
    echo "tijdelijke container: $REPO $COMMIT, $CPUS CPU's, $MEM, uitvoer $u"
    tmprun "" "tools/orkestratie/finaltests.sh '$u'; rc=\$?; for f in '$u'/*.txt; do echo \"\$(basename \$f): \$(tail -1 \$f)\"; done; exit \$rc"
    ;;
  sh)
    shift; repo_arg "$@"; shift $SHIFTN
    prep >/dev/null; locate "$PAD"
    if [ $# -eq 0 ]; then tmprun "-it" "exec bash"; else tmprun "" "$*"; fi
    ;;
  status) container list --all | awk 'NR==1 || $1=="'"$NAME"'"' ;;
  stop) container stop "$NAME" ;;
  rm) container stop "$NAME" 2>/dev/null || true; container rm "$NAME" ;;
  *) sed -n '2,15p' "$0"; exit 2 ;;
esac
