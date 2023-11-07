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

export default class Settings {
  constructor(extension) {
    this.settings = extension.getSettings();
  }

  isAutoPowerOnEnabled() {
    return this.settings.get_boolean("bluetooth-auto-power-on");
  }

  isAutoPowerOffEnabled() {
    return this.settings.get_boolean("bluetooth-auto-power-off");
  }

  autoPowerOffCheckingInterval() {
    return this.settings.get_int("bluetooth-auto-power-off-interval");
  }

  isKeepMenuOnToggleEnabled() {
    return this.settings.get_boolean("keep-menu-on-toggle");
  }

  isShowRefreshButtonEnabled() {
    return this.settings.get_boolean("refresh-button-on");
  }

  isDebugModeEnabled() {
    return this.settings.get_boolean("debug-mode-on");
  }

  isShowBatteryValueEnabled() {
    return this.settings.get_boolean("show-battery-value-on");
  }

  isShowBatteryIconEnabled() {
    return this.settings.get_boolean("show-battery-icon-on");
  }
}
