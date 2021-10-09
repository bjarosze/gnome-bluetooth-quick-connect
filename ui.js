// Copyright 2018 Bartosz Jaroszewski
// SPDX-License-Identifier: GPL-2.0-or-later
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 2 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.


const Clutter = imports.gi.Clutter;
const GObject = imports.gi.GObject;
const St = imports.gi.St;
const GLib = imports.gi.GLib;
const PopupMenu = imports.ui.popupMenu;
const Config = imports.misc.config;

var PopupBluetoothDeviceMenuItem = GObject.registerClass(
    class PopupSwitchWithButtonMenuItem extends PopupMenu.PopupSwitchMenuItem {
        _init(device, batteryProvider, logger, params) {
            let label = device.name || '(unknown)';
            super._init(label, device.isConnected, {});

            this._logger = logger;

            this._device = device;
            this._optBatDevice = [];
            this._batteryProvider = batteryProvider;
            this._batteryDeviceChangeSignal = null;
            this._batteryDeviceLocateTimeout = null;

            this._showRefreshButton = params.showRefreshButton;
            this._closeMenuOnAction = params.closeMenuOnAction;

            this.label.x_expand = true;
            this._statusBin.x_expand = false;

            this._refreshButton = this._buildRefreshButton();
            this._pendingLabel = this._buildPendingLabel();
            this._connectToggledEvent();

            if (this._isOldGnome()) {
                this.remove_child(this._statusBin);
                this.add(this._statusBin, { expand: false });
            }

            this.insert_child_at_index(this._refreshButton, this.get_n_children() - 1);
            this.add_child(this._pendingLabel);

            this.sync(device);
        }

        _tryLocateBatteryWithTimeout(count = 10) {

            let device = this._device;

            this._logger.info(`looking up battery info for ${device.name}`);

            this._batteryDeviceLocateTimeout = GLib.timeout_add(
                GLib.PRIORITY_DEFAULT,
                1000,
                () => {
                    this._logger.info(`Looking up battery info for ${device.name}`);
                    let _bat_device = this._batteryProvider.locateBatteryDevice(device);

                    if (_bat_device.length) {
                        this.batteryFound(_bat_device);
                        this._batteryDeviceLocateTimeout = null;
                    } else if (count) {
                        // try again
                        this._tryLocateBatteryWithTimeout(count - 1);
                    } else {
                        this._logger.info(`Did not find a battery for device ${device.name}`);
                        this._batteryDeviceLocateTimeout = null;
                    }
                });
        }

        batteryFound(optBatDevice) {
            this._optBatDevice = optBatDevice;
            this._update_label();

            this._optBatDevice.map(bat =>
                this._batteryDeviceChangeSignal = bat.connect("notify", (_dev, pspec) => {
                    this._logger.info(`${_dev.native_path} notified ${pspec.name}, percentage is ${_dev.percentage}`);
                    this._update_label();
                })
            );
        }

        disconnectSignals() {
            this._optBatDevice.map(bat => bat.disconnect(this._batteryDeviceChangeSignal));
            this._batteryDeviceChangeSignal = null;

            if (this._batteryDeviceLocateTimeout != null) {
                GLib.Source.remove(this._batteryDeviceLocateTimeout);
                this._batteryDeviceLocateTimeout = null;
            }
        }

        sync(device) {
            this.disconnectSignals();

            this._optBatDevice = [];

            this._device = device;

            if (device.isConnected)
                this._tryLocateBatteryWithTimeout();

            this._syncSwitch(device);
            this.visible = device.isPaired;
            if (this._showRefreshButton && device.isConnected)
                this._refreshButton.show();
            else
                this._refreshButton.hide();

            this._update_label();
        }

        _syncSwitch(device) {
            if (this._isOldGnome()) {
                this._switch.setToggleState(device.isConnected);
            } else {
                this._switch.state = device.isConnected;
            }
        }

        _update_label() {
            this._logger.info(`updating label for ${this._device.name} ${this._optBatDevice.map(bat => bat.percentage)}`);
            let dev_name = this._device.name || "unknown";
            let opt_bat_percent = this._optBatDevice
                .filter(bat => bat.percentage != null)
                .map(bat => ` (${bat.percentage}%)`);

            let bat_percent = opt_bat_percent[0] || "";

            this.label.text = dev_name + bat_percent;
        }

        _buildRefreshButton() {
            let icon = new St.Icon({
                icon_name: 'view-refresh',
                style_class: 'popup-menu-icon',
                opacity: 155
            });

            let button = new St.Button({
                child: icon,
                x_align: St.Align.END
            });

            button.connect("enter-event", (widget) => {
                    widget.child.ease( {
                        opacity: 255,
                        time: 0.05,
                        transition: Clutter.AnimationMode.LINEAR
                    }
                );
            });

            button.connect("leave-event", (widget) => {
                    widget.child.ease( {
                        opacity: 155,
                        time: 0.05,
                        transition: Clutter.AnimationMode.LINEAR
                    }
                );
            });

            button.connect('clicked', () => {
                this._enablePending();
                this._device.reconnect(() => {
                    this._disablePending();
                    this._update_label();
                });

                if (this._closeMenuOnAction)
                    this.emit('activate', Clutter.get_current_event());
            });

            return button;
        }

        _buildPendingLabel() {
            let label = new St.Label({text: _('Wait')});
            label.hide();

            return label;
        }

        _connectToggledEvent() {
            this.connect('toggled', (item, state) => {
                if (state) {
                    this._device.connect(() => {
                        this._disablePending();
                        this._update_label();
                    });
                } else {
                    this._device.disconnect(() => {
                        this._disablePending()
                    });
                }
            });
        }

        activate(event) {
            if (this._switch.mapped) {
                this.toggle();
                this._switch.toggle(); // toggle back, state will be updated by signal
            }

            // we allow pressing space to toggle the switch
            // without closing the menu
            if (event.type() == Clutter.EventType.KEY_PRESS &&
                event.get_key_symbol() == Clutter.KEY_space)
                return;

            if (this._closeMenuOnAction)
                this.emit('activate', event);
        }

        toggle() {
            super.toggle();
            this._enablePending();
        }

        _enablePending() {
            this._refreshButton.reactive = false;
            this._switch.hide();
            this._pendingLabel.show();
            this.reactive = false;
        }

        _disablePending() {
            this._refreshButton.reactive = true;
            this._switch.show();
            this._pendingLabel.hide();
            this.reactive = true;
        }

        _isOldGnome() {
            return Config.PACKAGE_VERSION.startsWith('3.34');
        }
    }
);
