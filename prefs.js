// Copyright 2018 Bartosz Jaroszewski
// SPDX-License-Identifier: GPL-2.0-or-later
// (see extension.js for details)

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const Gettext = imports.gettext.domain('gnome-shell-extensions');
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;


class SettingsBuilder {

    constructor() {
        this._settings = new Convenience.getSettings();
        this._builder = new Gtk.Builder();
    }

    build() {
        this._builder.add_from_file(Me.path + '/Settings.ui');
        this._settingsBox = this._builder.get_object('bluetooth_quick_connect_settings');


        this._viewport = new Gtk.Viewport();
        this._viewport.add(this._settingsBox);
        this._widget = new Gtk.ScrolledWindow();
        this._widget.add(this._viewport);


        this._builder.get_object('auto_power_off_settings_button').connect('clicked', () => {
            let dialog = new Gtk.Dialog({ title: 'Auto power off settings',
                transient_for: this._widget.get_toplevel(),
                use_header_bar: true,
                modal: true });


            let box = this._builder.get_object('auto_power_off_settings');
            dialog.get_content_area().add(box);

            dialog.connect('response', (dialog) => {
                dialog.get_content_area().remove(box);
                dialog.destroy();
            });

            dialog.show_all();
        });


        this._bind();

        return this._widget;
    }

    _bind() {
        let autoPowerOnSwitch = this._builder.get_object('auto_power_on_switch');
        this._settings.bind('bluetooth-auto-power-on', autoPowerOnSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);

        let autoPowerOffSwitch = this._builder.get_object('auto_power_off_switch');
        this._settings.bind('bluetooth-auto-power-off', autoPowerOffSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);

        let autoPowerOffInterval = this._builder.get_object('auto_power_off_interval');
        this._settings.bind('bluetooth-auto-power-off-interval', autoPowerOffInterval, 'value', Gio.SettingsBindFlags.DEFAULT);
    }

}

function init() {
    // Convenience.initTranslations();
}

function buildPrefsWidget() {
    let settings = new SettingsBuilder();
    let widget = settings.build();
    widget.show_all();

    return widget;
}
