const path = require('path')
const fs = require('fs')
const os = require('os')
const {
  spawn,
  spawnSync,
  execSync
} = require('child_process')

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

function updateManifest(file) {
  let version = process.env.npm_package_version
  let manifest = JSON.parse(fs.readFileSync(file, 'utf8'))
  manifest.version = version
  fs.writeFileSync(file, JSON.stringify(manifest, null, 2))
}

updateManifest('./src/manifest.json')
