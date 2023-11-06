# Bluetooth Quick Connect

This extension allows paired Bluetooth devices to be connected and
disconnected via the GNOME system menu, without need to enter the
Settings.

---

<div align="center">
<div>
<a href="https://extensions.gnome.org/extension/1401/bluetooth-quick-connect">
<img alt="Get it on Gnome Extensions" height="100" src="https://raw.githubusercontent.com/andyholmes/gnome-shell-extensions-badge/master/get-it-on-ego.svg?sanitize=true">
</a>
</div>
<a href="https://github.com/Extensions-Valhalla/gnome-bluetooth-quick-connect">
<img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/Extensions-Valhalla/gnome-bluetooth-quick-connect?style=for-the-badge">
</a>
<a href="https://github.com/Extensions-Valhalla/gnome-bluetooth-quick-connect/graphs/contributors">
<img alt="GitHub contributors" src="https://img.shields.io/github/contributors/Extensions-Valhalla/gnome-bluetooth-quick-connect?style=for-the-badge">
</a>
<a href="https://github.com/Extensions-Valhalla/gnome-bluetooth-quick-connect/blob/master/LICENSE">
<img alt="GitHub" src="https://img.shields.io/github/license/Extensions-Valhalla/gnome-bluetooth-quick-connect?style=for-the-badge">
</a>
</div>

> [!NOTE]
> This is a maintained fork of orignal Extension by [bjarosze](https://github.com/bjarosze).

## Installation

### Requirements

- Properly working `bluez` setup

### Installation from source code

Make sure you have Node.js and `pnpm` installed

```bash
git clone https://github.com/Extensions-Valhalla/gnome-bluetooth-quick-connect
cd gnome-bluetooth-quick-connect
pnpm install
pnpm extension:install
```

## Troubleshooting Guide

### Battery Level Doesn't work

Headset battery (currently) requires enabling experimental features in `bluez`.

See https://github.com/bjarosze/gnome-bluetooth-quick-connect/pull/42 for more details.

### Guides

- [Enabling Experimental Features](https://wiki.archlinux.org/title/bluetooth#Enabling_experimental_features)
- [Check Bluetooth headphones battery status in Linux](https://askubuntu.com/questions/1117563/check-bluetooth-headphones-battery-status-in-linux)
