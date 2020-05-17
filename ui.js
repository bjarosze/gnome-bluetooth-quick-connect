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


const {Atk, Clutter, Gio, GObject, Graphene, Shell, St} = imports.gi;
const Tweener = imports.ui.tweener;
const PopupMenu = imports.ui.popupMenu;

var PopupBluetoothDeviceMenuItem = GObject.registerClass(
    class PopupSwitchWithButtonMenuItem extends PopupMenu.PopupSwitchMenuItem {
        _init(bluetoothDevice, params) {
            super._init(bluetoothDevice.name, bluetoothDevice.isConnected, params);

            this._bluetoothDevice = bluetoothDevice
            this.isBluetoothDeviceSwitcher = true;
            this.isEmitActivatedEnabled = true;

            this.label.x_expand = true;
            this._statusBin.x_expand = false;

            this._refreshButton = this._buildRefreshButton();
            this._pendingLabel = this._buildPendingLabel();
            this._connectToggledEvent();

            this.insert_child_at_index(this._refreshButton, this.get_n_children() - 1);
            this.add_child(this._pendingLabel);
        }

        _buildRefreshButton() {
            let icon = new St.Icon({
                icon_name: 'view-refresh',
                style_class: 'popup-menu-icon',
                opacity: 155
            });

            let button = new St.Button({
                child: icon,
                x_align: Clutter.ActorAlign.END
            });

            button.connect("enter-event", (widget) => {
                Tweener.addTween(
                    widget.child, {
                        opacity: 255,
                        time: 0.05,
                        transition: 'linear'
                    }
                );
            });

            button.connect("leave-event", (widget) => {
                Tweener.addTween(
                    widget.child, {
                        opacity: 155,
                        time: 0.05,
                        transition: 'linear'
                    }
                );
            });

            button.connect('clicked', () => {
                this._pending();
                this._bluetoothDevice.reconnect();

                if (this.isEmitActivatedEnabled)
                    this.emit('activate', Clutter.get_current_event());
            });

            if (!this._bluetoothDevice.isConnected)
                button.hide();

            return button;
        }

        _buildPendingLabel() {
            let label = new St.Label({ text: _('Wait') });
            label.hide();

            return label;
        }

        _connectToggledEvent() {
            this.connect('toggled', (item, state) => {
                if (state)
                    this._bluetoothDevice.connect();
                else
                    this._bluetoothDevice.disconnect();
            });
        }

        activate(event) {
            if (this._switch.mapped)
                this.toggle();

            // we allow pressing space to toggle the switch
            // without closing the menu
            if (event.type() == Clutter.EventType.KEY_PRESS &&
                event.get_key_symbol() == Clutter.KEY_space)
                return;

            if (this.isEmitActivatedEnabled)
                this.emit('activate', event);
        }

        toggle() {
            super.toggle();
            this._pending();
        }

        hideRefreshButton() {
            this._refreshButton.hide();
        }

        _pending() {
            this._refreshButton.hide();
            this._switch.hide();
            this._pendingLabel.show();
            this.reactive = false;
        }
    }
);
