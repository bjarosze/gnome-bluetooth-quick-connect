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

var PopupSwitchWithButtonMenuItem = GObject.registerClass(
    {Signals: {'clicked': {}}},
    class PopupSwitchWithButtonMenuItem extends PopupMenu.PopupSwitchMenuItem {
        _init(text, active, icon, params) {
            super._init(text, active, params);

            this.label.x_expand = true;
            this._statusBin.x_expand = false;
            this.isEmitActivatedEnabled = true;

            if (icon) {
                this.insert_child_at_index(
                    this.create_button(icon),
                    this.get_n_children() - 1
                );
            }
        }

        create_button(iconName) {
            let icon = new St.Icon({
                icon_name: iconName,
                style_class: 'popup-menu-icon',
            });

            let button = new St.Button({
                child: icon,
                x_align: Clutter.ActorAlign.END
            });

            button.connect("enter-event", (widget) => {
                Tweener.addTween(
                    widget.child, {
                        scale_x: 1.1,
                        scale_y: 1.1,
                        time: 0.05,
                        transition: 'linear'
                    }
                );
            });

            button.connect("leave-event", (widget) => {
                Tweener.addTween(
                    widget.child, {
                        scale_x: 1,
                        scale_y: 1,
                        time: 0.05,
                        transition: 'linear'
                    }
                );
            });

            button.connect('clicked', () => {
                this.emit('clicked');
                if (this.isEmitActivatedEnabled)
                    this.emit('activate', Clutter.get_current_event());
            });

            return button;
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
    }
);
