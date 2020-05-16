#!/bin/bash
if [[ $# -ne 1 ]]; then
    echo "usage $0 dir" >&2
    exit 1
fi

dir="$1"

if [[ -e $dir ]]; then
    echo "Error: $dir already exists" >&2
    exit 1
fi

mkdir -p "$dir"
cd "$dir"

GS=/usr/lib/gnome-shell/libgnome-shell.so

for r in $(gresource list $GS); do
    t="${r/#\/org\/gnome\/shell\/}"
    mkdir -p $(dirname $t)
    echo Extracting $t
    gresource extract $GS $r >$t
done

echo
echo "Now add the following to /etc/environment and restart gnome-shell"
echo "if you want to run with these extracted source files."
echo "GNOME_SHELL_JS=$PWD"
