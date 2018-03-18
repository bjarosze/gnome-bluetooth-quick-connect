const Main = imports.ui.main;
const GnomeBluetooth = imports.gi.GnomeBluetooth;
const PopupMenu = imports.ui.popupMenu;
const GLib = imports.gi.GLib;
const Util = imports.misc.util;

class BluetoothDevice {
    constructor(model, device) {
        this._name = model.get_value(device, GnomeBluetooth.Column.NAME);
        this._isConnected = model.get_value(device, GnomeBluetooth.Column.CONNECTED);
        this._isPaired = model.get_value(device, GnomeBluetooth.Column.PAIRED);
        this._mac = model.get_value(device, GnomeBluetooth.Column.ADDRESS);
    }

    get name() {
        return this._name;
    }

    get isConnected() {
        return this._isConnected;
    }

    get isPaired() {
        return this._isPaired;
    }

    get mac() {
        return this._mac;
    }

    get item() {
        if (!this._item)
            this._buildMenuItem();

        return this._item;
    }

    _buildMenuItem() {
        this._item = new PopupMenu.PopupSwitchMenuItem(this.name, this.isConnected);
        this._item.isDeviceSwitcher = true;
        this._item.connect('toggled', (item, state) => {
            if (state)
                this._connect();
            else
                this._disconnect();
        });
    }

    _disconnect() {
        let command = `echo -e "disconnect ${this.mac}\\n" | bluetoothctl`;
        Util.spawn(['/bin/bash', '-c', command]);
    }

    _connect() {
        let command = `echo -e "connect ${this.mac}\\n" | bluetoothctl`;
        Util.spawn(['/bin/bash', '-c', command]);
    }
}

class BluetoothQuickConnect {
    constructor(bluetooth) {
        this._model = bluetooth._model;
        this._getDefaultAdapter = bluetooth._getDefaultAdapter;
        this._menu = bluetooth._item.menu;

        this._signals = [];
    }

    enable() {
        let signal = this._menu.connect('open-state-changed', (menu, isOpen) => {
            if (isOpen)
                this._sync();
        });

        this._signals.push(signal);
    }

    disable() {
        this._destroy();
    }

    _getPairedDevices() {
        let adapter = this._getDefaultAdapter();
        if (!adapter)
            return [];

        let pairedDevices = [];

        let [ret, iter] = this._model.iter_children(adapter);
        while (ret) {
            let bluetoothDevice = new BluetoothDevice(this._model, iter);
            if (bluetoothDevice.isPaired || bluetoothDevice.isConnected)
                pairedDevices.push(bluetoothDevice);

            ret = this._model.iter_next(iter);
        }

        return pairedDevices;
    }

    _sync() {
        this._removeDevicesFromMenu();
        this._addDevicesToMenu();
    }

    _addDevicesToMenu() {
        this._getPairedDevices().forEach((device) => {
            this._menu.addMenuItem(device.item, 1);
        });
    }

    _removeDevicesFromMenu() {
        this._menu._getMenuItems().forEach((item) => {
            if (item.isDeviceSwitcher) {
                item.destroy();
            }
        });
    }

    _destroy() {
        this._signals.forEach((signal) => {
            this._menu.disconnect(signal);
        });
        this._removeDevicesFromMenu();
    }
}


function init() {
    let bluetooth = Main.panel.statusArea.aggregateMenu._bluetooth;
    bluetoothQuickConnect = new BluetoothQuickConnect(bluetooth);
}

function enable() {
    bluetoothQuickConnect.enable();
}

function disable() {
    bluetoothQuickConnect.disable();
}
