// Copyright 2010-2022 GNOME Shell contributors
// Copyright 2022 Simon McVittie
// SPDX-License-Identifier: GPL-2.0-or-later
//
// Adapted from gnome-shell js/ui/status/bluetooth.js

/* exported BluetoothToggleMenu */

const {GObject} = imports.gi;
const {QuickMenuToggle} = imports.ui.quickSettings;

var BluetoothToggleMenu = GObject.registerClass(
class BluetoothToggleMenu extends QuickMenuToggle {
    _init(originalBluetoothToggle) {
        super._init({label: originalBluetoothToggle.label});

        this._original = originalBluetoothToggle;
        this._client = this._original._client;

        this._original.bind_property('visible', this, 'visible',
            GObject.BindingFlags.SYNC_CREATE);
        this._original.bind_property('checked', this, 'checked',
            GObject.BindingFlags.SYNC_CREATE);
        this._original.bind_property('icon-name', this, 'icon-name',
            GObject.BindingFlags.SYNC_CREATE);

        this.connect('clicked', () => this._client.toggleActive());

        this.menu.setHeader('bluetooth-active-symbolic', originalBluetoothToggle.label);
    }
});

