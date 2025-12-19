#!/usr/bin/env node

const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')

function printHelp() {
  console.log(`Usage: open-explorer [path] [options]

Options:
  -r, --reveal      Reveal the file in the OS file manager (select file)
  -l, --list        List directory contents instead of opening
  -h, --help        Show this help

Examples:
  node scripts/open-explorer.js           # open current working directory
  node scripts/open-explorer.js . --list  # list current directory
  node scripts/open-explorer.js src --reveal  # reveal src file/folder in file manager
`)
}

function listDir(p) {
  try {
    const entries = fs.readdirSync(p, { withFileTypes: true })
    entries.forEach((e) => {
      const type = e.isDirectory() ? 'DIR ' : e.isFile() ? 'FILE' : 'OTHR'
      console.log(`${type}  ${e.name}`)
    })
  } catch (err) {
    console.error('Failed to list directory:', err.message)
    process.exit(2)
  }
}

function openPath(p, reveal) {
  const resolved = path.resolve(p)

  if (!fs.existsSync(resolved)) {
    console.error('Path does not exist:', resolved)
    process.exit(2)
  }

  const isFile = fs.statSync(resolved).isFile()
  const platform = process.platform
  let cmd

  if (platform === 'win32') {
    if (reveal && isFile) {
      // explorer /select, "C:\path\to\file"
      cmd = `explorer /select,"${resolved.replace(/\//g, '\\\\')}"`
    } else {
      // cmd /c start "" "C:\path"
      cmd = `cmd /c start "" "${resolved.replace(/\//g, '\\\\')}"`
    }
  } else if (platform === 'darwin') {
    if (reveal && isFile) {
      cmd = `open -R "${resolved}"`
    } else {
      cmd = `open "${resolved}"`
    }
  } else {
    // Linux/Unix: no reliable "select"; open parent for reveal
    const target = reveal && isFile ? path.dirname(resolved) : resolved
    // try xdg-open, then gio, then gnome-open
    cmd = `xdg-open "${target}" || gio open "${target}" || gnome-open "${target}"`
  }

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error('Failed to open path:', err.message)
      if (stderr) console.error(stderr.trim())
      process.exit(3)
    } else {
      console.log('Opened:', resolved)
      process.exit(0)
    }
  })
}

// Simple arg parsing
const argv = process.argv.slice(2)
if (argv.length === 0) {
  // default: open cwd
  openPath(process.cwd(), false)
} else {
  if (argv.includes('-h') || argv.includes('--help')) {
    printHelp()
    process.exit(0)
  }
  const reveal = argv.includes('-r') || argv.includes('--reveal')
  const list = argv.includes('-l') || argv.includes('--list')

  // path is first non-flag arg
  const p = argv.find((a) => !a.startsWith('-')) || process.cwd()

  if (list) {
    const resolved = path.resolve(p)
    if (!fs.existsSync(resolved)) {
      console.error('Path does not exist:', resolved)
      process.exit(2)
    }
    if (!fs.statSync(resolved).isDirectory()) {
      console.error('Path is not a directory:', resolved)
      process.exit(2)
    }
    listDir(resolved)
  } else {
    openPath(p, reveal)
  }
}
