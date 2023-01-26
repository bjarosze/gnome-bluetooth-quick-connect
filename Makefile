# Copyright 2019 Simon McVittie
# SPDX-License-Identifier: GPL-2.0-or-later
# (see extension.js for details)

dist:
	gnome-extensions pack -f --extra-source=bluetooth.js --extra-source=bluetooth_legacy.js \
	--extra-source=power.js --extra-source=quickSettings.js --extra-source=settings.js \
	--extra-source=Settings.ui --extra-source=ui.js --extra-source=utils.js -o .

clean:
	rm -fr gnome-bluetooth-quick-connect.zip schemas/gschemas.compiled

install: dist
	gnome-extensions install -f bluetooth-quick-connect@bjarosze.gmail.com.shell-extension.zip

translation:
	mkdir -p po
	xgettext --from-code=UTF-8 extension.js quickSettings.js ui.js Settings.ui \
	-o po/bluetooth-quick-connect.pot

.PHONY: clean dist
