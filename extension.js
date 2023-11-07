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

import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import { Extension, gettext as _ } from "resource:///org/gnome/shell/extensions/extension.js";
import GLib from "gi://GLib";
import { Logger } from "./utils.js";
import Settings from "./settings.js";
import BluetoothController from "./bluetooth.js";
import { PopupBluetoothDeviceMenuItem } from "./ui.js";

export default class BluetoothQuickConnect extends Extension {
  constructor(metadata) {
    super(metadata);
  }

  enable() {
    this._settings = new Settings(this);
    this._logger = new Logger(this._settings);
    this._controller = new BluetoothController();
    this._logger.log("Enabling extension");
    this._queueModify();
    this._menu = new PopupMenu.PopupMenuSection();
    this._items = {};
    this._controller.enable();
    this._refresh();
    this._connectControllerSignals();
    this._connectIdleMonitor();
    this._connectMenuSignals();
  }

  disable() {
    this._logger.log("Disabling extension");
    this._settings = null;
    this._logger = null;
    this._controller && this._controller.destroy();
    this._controller = null;
    this._menu = null;
    this._disconnectSignals();
    this._removeDevicesFromMenu();
    this._disconnectIdleMonitor();
  }

  _queueModify() {
    GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
      if (!Main.panel.statusArea.quickSettings._bluetooth) {
        return GLib.SOURCE_CONTINUE;
      }
      let btIndicator = Main.panel.statusArea.quickSettings._bluetooth;
      let bluetoothToggle = btIndicator.quickSettingsItems[0];
      bluetoothToggle._updateDeviceVisibility = () => {
        bluetoothToggle._deviceSection.actor.visible = false;
        bluetoothToggle._placeholderItem.actor.visible = false;
      };
      bluetoothToggle._updateDeviceVisibility();

      this._proxy = bluetoothToggle._client._proxy;

      bluetoothToggle.menu.addMenuItem(this._menu, 0);
      return GLib.SOURCE_REMOVE;
    });
  }

  _connectMenuSignals() {
    this._connectSignal(this._menu, "open-state-changed", (_menu, isOpen) => {
      this._logger.log(`Menu toggled: ${isOpen}`);
      if (isOpen) this._disconnectIdleMonitor();
      else this._connectIdleMonitor();

      if (isOpen && this._settings.isAutoPowerOnEnabled() && this._proxy.BluetoothAirplaneMode) {
        this._logger.log("Disabling airplane mode");
        this._proxy.BluetoothAirplaneMode = false;
      }
    });
  }

  _connectControllerSignals() {
    this._logger.log("Connecting bluetooth controller signals");

    this._connectSignal(this._controller, "default-adapter-changed", (_ctrl) => {
      this._logger.log("Default adapter changed event");
      this._refresh();
    });

    this._connectSignal(this._controller, "device-inserted", (_ctrl, device) => {
      this._logger.log(`Device inserted event: ${device.alias || device.name}`);
      if (device.paired) {
        this._addMenuItem(device);
      } else {
        this._logger.log(`Device ${device.alias || device.name} not paired, ignoring`);
      }
    });

    this._connectSignal(this._controller, "device-changed", (_ctrl, device) => {
      this._logger.log(`Device changed event: ${device.alias || device.name}`);

      if (device.paired) this._syncMenuItem(device);
      else
        this._logger.log(
          `Skipping change event for unpaired device ${device.alias || device.name}`,
        );
    });

    this._connectSignal(this._controller, "device-deleted", (_ctrl, skipDevicePath) => {
      this._logger.log(`Device deleted event`);
      this._refresh(skipDevicePath);
    });
  }

  _syncMenuItem(device) {
    this._logger.log(`Synchronizing device menu item: ${device.alias || device.name}`);
    let item = this._items[device.address] || this._addMenuItem(device);
    item.sync(device);
  }

  _addMenuItem(device) {
    this._logger.log(`Adding device menu item: ${device.alias || device.name} ${device.address}`);

    let menuItem = new PopupBluetoothDeviceMenuItem(
      this._controller._client,
      device,
      this._logger,
      {
        showRefreshButton: this._settings.isShowRefreshButtonEnabled(),
        closeMenuOnAction: !this._settings.isKeepMenuOnToggleEnabled(),
        showBatteryValue: this._settings.isShowBatteryValueEnabled(),
        showBatteryIcon: this._settings.isShowBatteryIconEnabled(),
      },
    );

    this._items[device.address] = menuItem;
    this._menu.addMenuItem(menuItem);
    return menuItem;
  }

  _connectIdleMonitor() {
    if (this._idleMonitorId) return;
    this._logger.log("Connecting idle monitor");
    this._idleMonitorId = GLib.timeout_add(
      GLib.PRIORITY_DEFAULT,
      this._settings.autoPowerOffCheckingInterval() * 1000,
      () => {
        if (
          this._settings.isAutoPowerOffEnabled() &&
          this._controller.getConnectedDevices().length === 0
        ) {
          this._proxy.BluetoothAirplaneMode = true;
        }

        return true;
      },
    );
  }

  _disconnectIdleMonitor() {
    if (!this._idleMonitorId) return;

    this._logger.log("Disconnecting idle monitor");

    GLib.Source.remove(this._idleMonitorId);
    this._idleMonitorId = null;
  }

  _connectSignal(subject, signal_name, method) {
    if (!this._signals) this._signals = [];

    let signal_id = subject.connect(signal_name, method);
    this._signals.push({
      subject,
      signal_id,
    });
  }

  _disconnectSignals() {
    if (!this._signals) return;

    this._signals.forEach((signal) => {
      signal.subject.disconnect(signal.signal_id);
    });

    this._signals = [];
  }

  _refresh(skipDevice = null) {
    this._removeDevicesFromMenu();
    this._addDevicesToMenu(skipDevice);
    this._logger.log("Refreshing devices list");
  }

  _addDevicesToMenu(skipDevice = null) {
    this._controller
      .getDevices()
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((device) => {
        if (device.paired && device.get_object_path() !== skipDevice) {
          this._addMenuItem(device);
        } else {
          this._logger.log(`skipping adding device ${device.alias || device.name}`);
        }
      });
  }

  _removeDevicesFromMenu() {
    Object.values(this._items).forEach((item) => item.destroy());
    this._items = {};
  }
}
