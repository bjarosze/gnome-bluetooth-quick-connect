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

import GnomeBluetooth from "gi://GnomeBluetooth";
import * as Signals from "resource:///org/gnome/shell/misc/signals.js";

export default class BluetoothController extends Signals.EventEmitter {
  constructor() {
    super();
    this._client = new GnomeBluetooth.Client();
    this._deviceNotifyConnected = new Set();
    this._store = this._client.get_devices();
  }

  enable() {
    this._connectSignal(this._client, "notify::default-adapter", () => {
      this._deviceNotifyConnected.clear();
      this.emit("default-adapter-changed");
    });
    this._connectSignal(this._client, "notify::default-adapter-powered", () => {
      this._deviceNotifyConnected.clear();
      this.emit("default-adapter-changed");
    });
    this._connectSignal(this._client, "device-removed", (c, path) => {
      this._deviceNotifyConnected.delete(path);
      this.emit("device-deleted", path);
    });
    this._connectSignal(this._client, "device-added", (c, device) => {
      this._connectDeviceNotify(device);
      this.emit("device-inserted", device);
    });
  }

  getDevices() {
    let devices = [];
    for (let i = 0; i < this._store.get_n_items(); i++) {
      let device = this._store.get_item(i);
      devices.push(device);
    }
    return devices;
  }

  getConnectedDevices() {
    return this.getDevices().filter(({ connected }) => connected);
  }

  destroy() {
    this._disconnectSignals();
  }

  _connectDeviceNotify(device) {
    const path = device.get_object_path();

    if (this._deviceNotifyConnected.has(path)) return;

    this._deviceNotifyConnected.add(path);
    this._connectSignal(device, "notify", (device) => {
      this.emit("device-changed", device);
    });
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
}
