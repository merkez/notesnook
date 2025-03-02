/*
This file is part of the Notesnook project (https://notesnook.com/)

Copyright (C) 2022 Streetwriters (Private) Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

const { app } = require("electron");
const { diary, enable, default_reporter } = require("diary");
const fs = require("fs");
const path = require("path");
const { isDevelopment } = require("./utils");

enable("native");

const LOG_FILE_PATH = path.join(app.getPath("logs"), "notesnook.log");
const logFileStream = fs.createWriteStream(LOG_FILE_PATH, {
  autoClose: true,
  flags: "a"
});

const native = diary("native", (e) => {
  if (isDevelopment()) default_reporter(e);
  logFileReporter(e);
});

function logFileReporter(e) {
  const time = new Date().toLocaleString("en", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  const extra = e.extra.map((ex) => JSON.stringify(ex)).join(" ");
  let str = `[${time}] | ${e.level} | ${e.message} ${extra}\n`;
  logFileStream.write(str);
}

module.exports.logger = native;
