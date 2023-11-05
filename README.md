# Bluetooth Quick Connect

This extension allows paired Bluetooth devices to be connected and
disconnected via the GNOME system menu, without need to enter the
Settings.

> [!NOTE]
> This is a maintained fork of orignal Extension by [bjarosze](https://github.com/bjarosze).

## Installation

### Requirements

- `bluez` (on ubuntu: `sudo apt install bluez`)

### Installation from extensions.gnome.org

https://extensions.gnome.org/extension/1401/bluetooth-quick-connect/

### Installation from source code

Make sure you have Node.js and `pnpm` installed

```
git clone https://github.com/Extensions-Valhalla/gnome-bluetooth-quick-connect
cd gnome-bluetooth-quick-connect
pnpm install
pnpm extension:install
```

## Battery level

Headset battery (currently) requires enabling experimental features in bluez.
See https://github.com/bjarosze/gnome-bluetooth-quick-connect/pull/42 for more details.
