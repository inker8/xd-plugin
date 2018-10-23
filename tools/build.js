const path = require('path')
const fs = require('fs')
const os = require('os')
const { spawn, spawnSync, execSync } = require('child_process')

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
  win32: `${os.homedir()}/AppData/Local/Packages/Adobe.CC.XD_adky2gkssdxte/LocalState/develop`,
}
let devPluginDir = DevPluginDirs[process.platform]
if (os.release().toLowerCase().includes('microsoft')) {
  console.time('cmd.exe')
  const winUser = execSync('cmd.exe /C "echo %username%"').toString('utf8').trim()
  console.timeEnd('cmd.exe')
  devPluginDir = `/c/Users/${winUser}/AppData/Local/Packages/Adobe.CC.XD_adky2gkssdxte/LocalState/develop`
}

cd('./src')

const IsWatch = process.argv.indexOf('-w') >= 0
const DistDir = path.join(devPluginDir, 'inker8')

if (IsWatch) {
  exec('sync-glob', ['--watch', './**', DistDir])
} else {
  exec('sync-glob', ['./**', DistDir])
}
