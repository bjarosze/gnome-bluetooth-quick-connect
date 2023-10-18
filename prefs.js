// Copyright 2018 Bartosz Jaroszewski
// SPDX-License-Identifier: GPL-2.0-or-later
// (see extension.js for details)

import Gtk from "gi://Gtk";
import Adw from "gi://Adw";

import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class SettingsBuilder extends ExtensionPreferences {
    constructor (ext) {
        super(ext);
        this._ext = ext;
    }

    build(_settings) {
        this._settings = _settings;
        this._builder = new Gtk.Builder();
        this._builder.add_from_file(this._ext.path + '/Settings.ui');

        this._widget = this._builder.get_object('items_container')

        this._builder.get_object('auto_power_off_settings_button').connect('clicked', () => {
            let dialog = new Gtk.Dialog({
                title: 'Auto power off settings',
                transient_for: this._widget.get_ancestor(Gtk.Window),
                use_header_bar: true,
                modal: true
            });


            let box = this._builder.get_object('auto_power_off_settings');
            dialog.get_content_area().append(box);

            dialog.connect('response', (dialog) => {
                dialog.get_content_area().remove(box);
                dialog.destroy();
            });

            dialog.show();
        });


        this._bind();

        return this._widget;
    }

    _bind() {
        let autoPowerOnSwitch = this._builder.get_object('auto_power_on_switch');
        this._settings.bind('bluetooth-auto-power-on', autoPowerOnSwitch, 'active', 0/*Gio.SettingsBindFlags.DEFAULT*/);

        let autoPowerOffSwitch = this._builder.get_object('auto_power_off_switch');
        this._settings.bind('bluetooth-auto-power-off', autoPowerOffSwitch, 'active', 0/*Gio.SettingsBindFlags.DEFAULT*/);

        let autoPowerOffInterval = this._builder.get_object('auto_power_off_interval');
        this._settings.bind('bluetooth-auto-power-off-interval', autoPowerOffInterval, 'value', 0/*Gio.SettingsBindFlags.DEFAULT*/);

        let keepMenuOnToggleSwitch = this._builder.get_object('keep_menu_on_toggle');
        this._settings.bind('keep-menu-on-toggle', keepMenuOnToggleSwitch, 'active', 0/*Gio.SettingsBindFlags.DEFAULT*/);

        let refreshButtonOnSwitch = this._builder.get_object('refresh_button_on');
        this._settings.bind('refresh-button-on', refreshButtonOnSwitch, 'active', 0/*Gio.SettingsBindFlags.DEFAULT*/);

        let debugModeOnSwitch = this._builder.get_object('debug_mode_on');
        this._settings.bind('debug-mode-on', debugModeOnSwitch, 'active', 0/*Gio.SettingsBindFlags.DEFAULT*/);

        let batteryValueOnSwitch = this._builder.get_object('show_battery_value_on');
        this._settings.bind('show-battery-value-on', batteryValueOnSwitch, 'active', 0/*Gio.SettingsBindFlags.DEFAULT*/);

        let batteryIconOnSwitch = this._builder.get_object('show_battery_icon_on');
        this._settings.bind('show-battery-icon-on', batteryIconOnSwitch, 'active', 0/*Gio.SettingsBindFlags.DEFAULT*/);
    }

    fillPreferencesWindow(window) {
        let widget = this.build(this.getSettings());
        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup();
        group.add(widget);
        page.add(group);
        window.add(page);

    }
}
