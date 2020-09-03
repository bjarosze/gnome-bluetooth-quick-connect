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
const PopupMenu = imports.ui.popupMenu;
const Config = imports.misc.config;

var PopupBluetoothDeviceMenuItem = GObject.registerClass(
    class PopupSwitchWithButtonMenuItem extends PopupMenu.PopupSwitchMenuItem {
        _init(device, params) {
            super._init(device.name, device.isConnected, {});

            this._device = device;
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

        sync(device) {
            this._device = device;
            this._syncSwitch(device);
            this.visible = device.isPaired;
            if (this._showRefreshButton && device.isConnected)
                this._refreshButton.show();
            else
                this._refreshButton.hide();
        }

        _syncSwitch(device) {
            if (this._isOldGnome())
                return this._switch.setToggleState(device.isConnected);

            this._switch.state = device.isConnected;
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
                    this._disablePending()
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
                if (state)
                    this._device.connect(() => {
                        this._disablePending()
                    });
                else
                    this._device.disconnect(() => {
                        this._disablePending()
                    });
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
