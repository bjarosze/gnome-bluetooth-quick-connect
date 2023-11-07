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

export class Logger {
  constructor(settings) {
    this._enabled = settings.isDebugModeEnabled();
  }

  log(message) {
    if (!this._enabled) return;
    console.log(`[bluetooth-quick-connect] ${message}`);
  }

  warn(message) {
    console.warn(`[bluetooth-quick-connect WARNING] ${message}`);
  }
}
