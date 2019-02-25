# Copyright 2019 Simon McVittie
# SPDX-License-Identifier: GPL-2.0-or-later
# (see extension.js for details)

all:
	glib-compile-schemas --strict --targetdir=schemas schemas

dist: all
	zip gnome-bluetooth-quick-connect.zip -9r *

clean:
	rm -fr gnome-bluetooth-quick-connect.zip schemas/gschemas.compiled

.PHONY: all clean dist
