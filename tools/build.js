const path = require('path')
const fs = require('fs')
const os = require('os')
const { spawn, spawnSync } = require('child_process')

let cwd = process.cwd()

function cd(d) {
  cwd = path.relative(cwd, d)
}

function env(key, val) {
  process.env[key] = val
}

function execAsync(file, args = [], options) {
  spawn(file, args, {
    stdio: 'inherit',
    cwd: cwd,
    ...options,
  })
}

function exec(file, args = [], options) {
  spawnSync(file, args, {
    stdio: 'inherit',
    cwd: cwd,
    ...options,
  })
}


const DevPluginDirs = {
  darwin: `${os.homedir()}/Library/Application\ Support/Adobe/Adobe\ XD\ CC/develop`,
  win32: `${os.homedir()}/AppData/Local/Packages/Adobe.CC.XD_adky2gkssdxte/LocalState/`,
}

cd('./src')

const IsWatch = process.argv.indexOf('-w') >= 0
const DistDir = path.join(DevPluginDirs[process.platform], 'inker8')

if (IsWatch) {
  exec('sync-glob', ['--watch', './**', DistDir])
} else {
  exec('sync-glob', ['./**', DistDir])
}
