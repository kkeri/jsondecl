#!/usr/bin/env node

import * as yargs from 'yargs'
import { load, Diagnostics } from './index'
import { existsSync, readFileSync } from 'fs'

yargs
  .command(['match <declfile> [files...]', 'm'],
  'matches one or more json files with a declaration',
  {},
  (argv) => {
    return MatchFiles(argv.declfile, argv.files)
  })
  .demandCommand(1, 'Please specify command.')
  .help()

function MatchFiles (declfile, files) {
  if (!existsSync(declfile)) {
    console.error(`error: Declaration file ${declfile} doesn't exist`)
    return false
  }
  let messages = []
  let decl = load(declfile, {
    messages
  })
  Diagnostics.log(messages)
  let success = true
  if (!decl) return false
  for (let filename of files) {
    success = success && matchFile(decl, filename)
  }
  return success
}

function matchFile (decl, filename) {
  if (!existsSync(filename)) {
    console.error(`error: ${filename} doesn't exist`)
    return false
  }
  let text = readFileSync(filename, 'utf8')
  let json
  try {
    json = JSON.parse(text)
  } catch (e) {
    if (e instanceof SyntaxError) {
      console.error(`${filename}(${e.lineNumber}:${e.columnNumber}): error: ${e.message}`)
      return false
    } else {
      throw e
    }
  }
  let messages = []
  try {
    return decl.match(json, { messages, filename })
  } finally {
    if (messages.length) {
      Diagnostics.log(messages)
    }
  }
}
