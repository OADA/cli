# clioada

CLI OADA

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/clioada.svg)](https://npmjs.org/package/clioada)
[![Downloads/week](https://img.shields.io/npm/dw/clioada.svg)](https://npmjs.org/package/clioada)
[![License](https://img.shields.io/npm/l/clioada.svg)](https://github.com/awlayton/clioada/blob/master/package.json)

<!-- toc -->
* [clioada](#clioada)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g clioada
$ oada COMMAND
running command...
$ oada (-v|--version|version)
clioada/1.0.0 linux-x64 node-v15.6.0
$ oada --help [COMMAND]
USAGE
  $ oada COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`oada delete PATHS...`](#oada-delete-paths)
* [`oada fs:copy PATHS... PATH`](#oada-fscopy-paths-path)
* [`oada fs:link PATHS... PATH`](#oada-fslink-paths-path)
* [`oada fs:move PATHS... PATH`](#oada-fsmove-paths-path)
* [`oada fs:remove PATHS...`](#oada-fsremove-paths)
* [`oada get PATHS...`](#oada-get-paths)
* [`oada head PATHS...`](#oada-head-paths)
* [`oada post PATHS... PATH`](#oada-post-paths-path)
* [`oada put PATHS... PATH`](#oada-put-paths-path)

## `oada delete PATHS...`

perform an OADA DELETE

```
USAGE
  $ oada delete PATHS...

ARGUMENTS
  PATHS...  OADA path(s) to GET

OPTIONS
  -R, --recursive
  --domain=domain  [default: localhost] default OADA API domain
  --token=token    [default: god] default OADA API token
  --[no-]tty       format output for TTY
  --[no-]ws        use WebSockets for OADA API

ALIASES
  $ oada d
  $ oada rm
  $ oada DELETE
```

_See code: [dist/commands/delete.ts](https://github.com/awlayton/clioada/blob/v1.0.0/dist/commands/delete.ts)_

## `oada fs:copy PATHS... PATH`

perform an "OADA copy"

```
USAGE
  $ oada fs:copy PATHS... PATH

ARGUMENTS
  PATHS...  path(s) to copy
  PATH      OADA path to which to copy

OPTIONS
  --domain=domain  [default: localhost] default OADA API domain
  --token=token    [default: god] default OADA API token
  --[no-]tty       format output for TTY
  --[no-]ws        use WebSockets for OADA API

ALIASES
  $ oada cp
```

_See code: [dist/commands/fs/copy.ts](https://github.com/awlayton/clioada/blob/v1.0.0/dist/commands/fs/copy.ts)_

## `oada fs:link PATHS... PATH`

perform an "OADA link"

```
USAGE
  $ oada fs:link PATHS... PATH

ARGUMENTS
  PATHS...  path(s) to link
  PATH      OADA path in which to link

OPTIONS
  -f, --force      delete conflicting existing data/links
  -r, --versioned  make versioned link(s)
  --domain=domain  [default: localhost] default OADA API domain
  --token=token    [default: god] default OADA API token
  --[no-]tty       format output for TTY
  --[no-]ws        use WebSockets for OADA API

ALIASES
  $ oada ln
```

_See code: [dist/commands/fs/link.ts](https://github.com/awlayton/clioada/blob/v1.0.0/dist/commands/fs/link.ts)_

## `oada fs:move PATHS... PATH`

perform an "OADA move"

```
USAGE
  $ oada fs:move PATHS... PATH

ARGUMENTS
  PATHS...  path(s) to move
  PATH      OADA path to which to move

OPTIONS
  --domain=domain  [default: localhost] default OADA API domain
  --token=token    [default: god] default OADA API token
  --[no-]tty       format output for TTY
  --[no-]ws        use WebSockets for OADA API

ALIASES
  $ oada mv
```

_See code: [dist/commands/fs/move.ts](https://github.com/awlayton/clioada/blob/v1.0.0/dist/commands/fs/move.ts)_

## `oada fs:remove PATHS...`

perform an OADA DELETE

```
USAGE
  $ oada fs:remove PATHS...

ARGUMENTS
  PATHS...  OADA path(s) to GET

OPTIONS
  -R, --recursive
  --domain=domain  [default: localhost] default OADA API domain
  --token=token    [default: god] default OADA API token
  --[no-]tty       format output for TTY
  --[no-]ws        use WebSockets for OADA API

ALIASES
  $ oada d
  $ oada rm
  $ oada DELETE
```

_See code: [dist/commands/fs/remove.ts](https://github.com/awlayton/clioada/blob/v1.0.0/dist/commands/fs/remove.ts)_

## `oada get PATHS...`

perform an OADA GET (read)

```
USAGE
  $ oada get PATHS...

ARGUMENTS
  PATHS...  OADA path(s) to GET

OPTIONS
  -R, --recursive
  -m, --meta
  -o, --out=out    [default: -]
  --domain=domain  [default: localhost] default OADA API domain
  --token=token    [default: god] default OADA API token
  --[no-]tty       format output for TTY
  --[no-]ws        use WebSockets for OADA API

ALIASES
  $ oada g
  $ oada GET

EXAMPLE
  $ oada get /bookmark
  {
     "_id": "resources/default:resources_bookmarks_321",
     "_rev": 45,
     "_type": "application/vnd.oada.bookmarks.1+json",
     "_meta": {
       "_id": "resources/default:resources_bookmarks_321/_meta",
       "_rev": 45
     }
  }
```

_See code: [dist/commands/get.ts](https://github.com/awlayton/clioada/blob/v1.0.0/dist/commands/get.ts)_

## `oada head PATHS...`

perform an OADA HEAD

```
USAGE
  $ oada head PATHS...

ARGUMENTS
  PATHS...  OADA path(s) to HEAD

OPTIONS
  --domain=domain  [default: localhost] default OADA API domain
  --token=token    [default: god] default OADA API token
  --[no-]tty       format output for TTY
  --[no-]ws        use WebSockets for OADA API

ALIASES
  $ oada h
  $ oada HEAD
```

_See code: [dist/commands/head.ts](https://github.com/awlayton/clioada/blob/v1.0.0/dist/commands/head.ts)_

## `oada post PATHS... PATH`

Perform an OADA POST

```
USAGE
  $ oada post PATHS... PATH

ARGUMENTS
  PATHS...  paths to POST
  PATH      destination OADA path

OPTIONS
  -R, --recursive
  --domain=domain  [default: localhost] default OADA API domain
  --token=token    [default: god] default OADA API token
  --[no-]tty       format output for TTY
  --[no-]ws        use WebSockets for OADA API

ALIASES
  $ oada po
  $ oada POST
```

_See code: [dist/commands/post.ts](https://github.com/awlayton/clioada/blob/v1.0.0/dist/commands/post.ts)_

## `oada put PATHS... PATH`

Perform an OADA PUT

```
USAGE
  $ oada put PATHS... PATH

ARGUMENTS
  PATHS...  paths to PUT
  PATH      destination OADA path

OPTIONS
  -R, --recursive
  --domain=domain  [default: localhost] default OADA API domain
  --token=token    [default: god] default OADA API token
  --[no-]tty       format output for TTY
  --[no-]ws        use WebSockets for OADA API

ALIASES
  $ oada pu
  $ oada PUT
```

_See code: [dist/commands/put.ts](https://github.com/awlayton/clioada/blob/v1.0.0/dist/commands/put.ts)_
<!-- commandsstop -->
