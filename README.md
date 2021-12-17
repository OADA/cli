# CLI OADA

Pipeable OADA client CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@oada/cli.svg)](https://npmjs.org/package/@oada/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@oada/cli.svg)](https://npmjs.org/package/@oada/cli)
[![License](https://img.shields.io/npm/l/@oada/cli.svg)](https://github.com/OADA/cli/blob/master/package.json)

<!-- toc -->

- [CLI OADA](#cli-oada)
- [Overview](#overview)
- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

## Overview

The code could use a major refactor, but it is useful and working for me at least.
I mostly put it here for my own safe-keeping.
It is not particularly fast or efficient.

It has help output that is rather terse for now.

It supports various JSON-y input formats:

- JSON
- [JSONL][] (aka. LDJSON or NDJSON)
- [Concatenated JSON][]
- [HJSON][]
- [JSON5][]
- [JSON6][]
- JavaScript/TypeScript (converts what is exported to JSON)

It can get inputs from local files, paths in OADA APIs, or generic URLs to JSON.
Also, it can take [Concatenated JSON][] piped through standard input.

It will currently die a horrible death if you try to use it with
any other non-JSON data.

It outputs [JSONL][] (or pretty-printed Concatenated JSON in TTY mode).
This makes piping with traditional line-based CLI tools easy.
Also, it is _very_ useful with tools like [`jq`][].

There is support for configuring it for multiple OADA APIs
and moving files between them.

It supports "shell expansion" of a sort via [`minimatch`][]
(i.e., you can use paths like `/bookmarks/trellis/*/test{s,y}/`
and they will be expanded).

## Usage

<!-- usage -->

```sh-session
$ yarn global add @oada/cli
$ oada COMMAND
running command...
$ oada --help [COMMAND]
USAGE
  $ oada COMMAND
...
```

<!-- usagestop -->

## Commands

<!-- commands -->

- [`oada autocomplete [SHELL]`](#oada-autocomplete-shell)
- [`oada config:show`](#oada-configshow)
- [`oada delete PATHS...`](#oada-delete-paths)
- [`oada fs:copy PATHS... PATH`](#oada-fscopy-paths-path)
- [`oada fs:link PATHS... PATH`](#oada-fslink-paths-path)
- [`oada fs:list PATHS...`](#oada-fslist-paths)
- [`oada fs:move PATHS... PATH`](#oada-fsmove-paths-path)
- [`oada fs:remove PATHS...`](#oada-fsremove-paths)
- [`oada fs:touch PATHS...`](#oada-fstouch-paths)
- [`oada get PATHS...`](#oada-get-paths)
- [`oada head PATHS...`](#oada-head-paths)
- [`oada help [COMMAND]`](#oada-help-command)
- [`oada plugins`](#oada-plugins)
- [`oada plugins:install PLUGIN...`](#oada-pluginsinstall-plugin)
- [`oada plugins:link PLUGIN`](#oada-pluginslink-plugin)
- [`oada plugins:uninstall PLUGIN...`](#oada-pluginsuninstall-plugin)
- [`oada plugins:update`](#oada-pluginsupdate)
- [`oada post PATHS... PATH`](#oada-post-paths-path)
- [`oada put PATHS... PATH`](#oada-put-paths-path)
- [`oada watch PATH`](#oada-watch-path)

### `oada autocomplete [SHELL]`

display autocomplete installation instructions

```shell
USAGE
  $ oada autocomplete [SHELL]

ARGUMENTS
  SHELL  shell type

OPTIONS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

EXAMPLES
  $ oada autocomplete
  $ oada autocomplete bash
  $ oada autocomplete zsh
  $ oada autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v0.3.0/src/commands/autocomplete/index.ts)_

### `oada config:show`

Show the current config settings

```
USAGE
  $ oada config:show

OPTIONS
  -d, --domain=domain  [default: localhost] default OADA API domain
  -t, --token=token    default OADA API token
  --[no-]tty           format output for TTY
  --[no-]ws            use WebSockets for OADA API

ALIASES
  $ oada config
```

_See code: [src/commands/config/show.ts](https://github.com/OADA/cli/blob/v1.1.0/src/commands/config/show.ts)_

### `oada delete PATHS...`

perform an OADA DELETE

```shell
USAGE
  $ oada delete PATHS...

ARGUMENTS
  PATHS...  OADA path(s) to GET

OPTIONS
  -R, --recursive
  -d, --domain=domain  [default: localhost] default OADA API domain
  -t, --token=token    default OADA API token
  --[no-]tty           format output for TTY
  --[no-]ws            use WebSockets for OADA API

ALIASES
  $ oada d
  $ oada rm
  $ oada DELETE

EXAMPLES
  $ oada delete /bookmarks/foo
  $ oada rm /bookmarks/foo /bookmarks/bar /bookmarks/baz*
```

_See code: [src/commands/delete.ts](https://github.com/OADA/cli/blob/v1.1.0/src/commands/delete.ts)_

### `oada fs:copy PATHS... PATH`

perform an "OADA copy"

```shell
USAGE
  $ oada fs:copy PATHS... PATH

ARGUMENTS
  PATHS...  path(s) to copy
  PATH      OADA path to which to copy

OPTIONS
  -d, --domain=domain  [default: localhost] default OADA API domain
  -t, --token=token    default OADA API token
  --[no-]tty           format output for TTY
  --[no-]ws            use WebSockets for OADA API

ALIASES
  $ oada cp

EXAMPLES
  $ oada cp /resources/foo /bookmarks/foo
  $ oada cp /resources/foo1 /resources/foo2 /bookmarks/foos/
```

_See code: [src/commands/fs/copy.ts](https://github.com/OADA/cli/blob/v1.1.0/src/commands/fs/copy.ts)_

### `oada fs:link PATHS... PATH`

perform an "OADA link"

```shell
USAGE
  $ oada fs:link PATHS... PATH

ARGUMENTS
  PATHS...  path(s) to link
  PATH      OADA path in which to link

OPTIONS
  -d, --domain=domain  [default: localhost] default OADA API domain
  -f, --force          delete conflicting existing data/links
  -r, --versioned      make versioned link(s)
  -t, --token=token    default OADA API token
  --[no-]tty           format output for TTY
  --[no-]ws            use WebSockets for OADA API

ALIASES
  $ oada ln

EXAMPLES
  $ oada ln /resources/my-thingy /bookmarks/thingy
  $ oada ln /resources/thingy1 /resources/thingy2 /bookmarks/thingies/
```

_See code: [src/commands/fs/link.ts](https://github.com/OADA/cli/blob/v1.1.0/src/commands/fs/link.ts)_

### `oada fs:list PATHS...`

perform an "OADA ls"

```shell
USAGE
  $ oada fs:list PATHS...

ARGUMENTS
  PATHS...  path(s) to list

OPTIONS
  -d, --domain=domain  [default: localhost] default OADA API domain
  -t, --token=token    default OADA API token
  --[no-]tty           format output for TTY
  --[no-]ws            use WebSockets for OADA API

ALIASES
  $ oada ls
  $ oada l
```

_See code: [src/commands/fs/list.ts](https://github.com/OADA/cli/blob/v1.1.0/src/commands/fs/list.ts)_

### `oada fs:move PATHS... PATH`

perform an "OADA move"

```shell
USAGE
  $ oada fs:move PATHS... PATH

ARGUMENTS
  PATHS...  path(s) to move
  PATH      OADA path to which to move

OPTIONS
  -d, --domain=domain  [default: localhost] default OADA API domain
  -t, --token=token    default OADA API token
  --[no-]tty           format output for TTY
  --[no-]ws            use WebSockets for OADA API

ALIASES
  $ oada mv

EXAMPLES
  $ oada mv /resources/foo /bookmarks/foo
  $ oada mv /resources/foo1 /resources/foo2 /bookmarks/foos/
```

_See code: [src/commands/fs/move.ts](https://github.com/OADA/cli/blob/v1.1.0/src/commands/fs/move.ts)_

### `oada fs:remove PATHS...`

perform an OADA DELETE

```shell
USAGE
  $ oada fs:remove PATHS...

ARGUMENTS
  PATHS...  OADA path(s) to GET

OPTIONS
  -R, --recursive
  -d, --domain=domain  [default: localhost] default OADA API domain
  -t, --token=token    default OADA API token
  --[no-]tty           format output for TTY
  --[no-]ws            use WebSockets for OADA API

ALIASES
  $ oada d
  $ oada rm
  $ oada DELETE

EXAMPLES
  $ oada delete /bookmarks/foo
  $ oada rm /bookmarks/foo /bookmarks/bar /bookmarks/baz*
```

_See code: [src/commands/fs/remove.ts](https://github.com/OADA/cli/blob/v1.1.0/src/commands/fs/remove.ts)_

### `oada fs:touch PATHS...`

perform and "OADA touch"

```shell
USAGE
  $ oada fs:touch PATHS...

ARGUMENTS
  PATHS...  paths to touch

OPTIONS
  -d, --domain=domain  [default: localhost] default OADA API domain
  -t, --token=token    default OADA API token
  --[no-]tty           format output for TTY
  --[no-]ws            use WebSockets for OADA API

ALIASES
  $ oada touch

EXAMPLE
  $ oada touch /bookmarks
```

_See code: [src/commands/fs/touch.ts](https://github.com/OADA/cli/blob/v1.1.0/src/commands/fs/touch.ts)_

### `oada get PATHS...`

perform an OADA GET (read)

```shell
USAGE
  $ oada get PATHS...

ARGUMENTS
  PATHS...  OADA path(s) to GET

OPTIONS
  -R, --recursive
  -T, --tree=tree      file containing an OADA tree to use for a tree GET
  -d, --domain=domain  [default: localhost] default OADA API domain
  -m, --meta
  -o, --out=out        [default: -]
  -t, --token=token    default OADA API token
  --[no-]tty           format output for TTY
  --[no-]ws            use WebSockets for OADA API

ALIASES
  $ oada g
  $ oada GET

EXAMPLES
  $ oada get /bookmarks
  {
     "_id": "resources/default:resources_bookmarks_321",
     "_rev": 45,
     "_type": "application/vnd.oada.bookmarks.1+json",
     "_meta": {
       "_id": "resources/default:resources_bookmarks_321/_meta",
       "_rev": 45
     },
     "foo": "bar",
     "baz": 700
  }
  $ oada get /bookmarks/*
  "bar"
  700
```

_See code: [src/commands/get.ts](https://github.com/OADA/cli/blob/v1.1.0/src/commands/get.ts)_

### `oada head PATHS...`

perform an OADA HEAD

```shell
USAGE
  $ oada head PATHS...

ARGUMENTS
  PATHS...  OADA path(s) to HEAD

OPTIONS
  -d, --domain=domain  [default: localhost] default OADA API domain
  -t, --token=token    default OADA API token
  --[no-]tty           format output for TTY
  --[no-]ws            use WebSockets for OADA API

ALIASES
  $ oada h
  $ oada HEAD

EXAMPLES
  $ oada head /bookmarks/does-exist; echo $?
  0
  $ oada head /bookmarks/does-not-exist; echo $?
  1
```

_See code: [src/commands/head.ts](https://github.com/OADA/cli/blob/v1.1.0/src/commands/head.ts)_

### `oada help [COMMAND]`

display help for `oada`

```shell
USAGE
  $ oada help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.1/src/commands/help.ts)_

### `oada plugins`

list installed plugins

```shell
USAGE
  $ oada plugins

OPTIONS
  --core  show core plugins

EXAMPLE
  $ oada plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.9.5/src/commands/plugins/index.ts)_

### `oada plugins:install PLUGIN...`

installs a plugin into the CLI

```shell
USAGE
  $ oada plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  plugin to install

OPTIONS
  -f, --force    yarn install with force flag
  -h, --help     show CLI help
  -v, --verbose

DESCRIPTION
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ oada plugins:add

EXAMPLES
  $ oada plugins:install myplugin
  $ oada plugins:install https://github.com/someuser/someplugin
  $ oada plugins:install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.9.5/src/commands/plugins/install.ts)_

### `oada plugins:link PLUGIN`

links a plugin into the CLI for development

```shell
USAGE
  $ oada plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

OPTIONS
  -h, --help     show CLI help
  -v, --verbose

DESCRIPTION
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLE
  $ oada plugins:link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.9.5/src/commands/plugins/link.ts)_

### `oada plugins:uninstall PLUGIN...`

removes a plugin from the CLI

```shell
USAGE
  $ oada plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

OPTIONS
  -h, --help     show CLI help
  -v, --verbose

ALIASES
  $ oada plugins:unlink
  $ oada plugins:remove
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.9.5/src/commands/plugins/uninstall.ts)_

### `oada plugins:update`

update installed plugins

```shell
USAGE
  $ oada plugins:update

OPTIONS
  -h, --help     show CLI help
  -v, --verbose
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.9.5/src/commands/plugins/update.ts)_

### `oada post PATHS... PATH`

Perform an OADA POST

```shell
USAGE
  $ oada post PATHS... PATH

ARGUMENTS
  PATHS...  paths to POST
  PATH      destination OADA path

OPTIONS
  -T, --tree=tree      file containing an OADA tree to use for a tree POST
  -d, --domain=domain  [default: localhost] default OADA API domain
  -t, --token=token    default OADA API token
  --[no-]tty           format output for TTY
  --[no-]ws            use WebSockets for OADA API

ALIASES
  $ oada po
  $ oada POST

EXAMPLE
  $ oada post - /bookmarks/ <<< '{"a": 1}{"b": true}'
```

_See code: [src/commands/post.ts](https://github.com/OADA/cli/blob/v1.1.0/src/commands/post.ts)_

### `oada put PATHS... PATH`

Perform an OADA PUT

```shell
USAGE
  $ oada put PATHS... PATH

ARGUMENTS
  PATHS...  paths to PUT
  PATH      destination OADA path

OPTIONS
  -T, --tree=tree      file containing an OADA tree to use for a tree PUT
  -d, --domain=domain  [default: localhost] default OADA API domain
  -t, --token=token    default OADA API token
  --[no-]tty           format output for TTY
  --[no-]ws            use WebSockets for OADA API

ALIASES
  $ oada pu
  $ oada PUT

EXAMPLE
  $ oada put - /bookmarks/ <<< '{"a": 1}'
```

_See code: [src/commands/put.ts](https://github.com/OADA/cli/blob/v1.1.0/src/commands/put.ts)_

### `oada watch PATH`

perform and OADA WATCH

```shell
USAGE
  $ oada watch PATH

ARGUMENTS
  PATH  OADA path to WATCH

OPTIONS
  -d, --domain=domain       [default: localhost] default OADA API domain
  -o, --out=out             [default: -]
  -r, --rev=rev             rev from which to start (negative means latest - n)
  -t, --token=token         default OADA API token
  -t, --type=(sinlge|tree)  [default: tree]
  --[no-]tty                format output for TTY
  --[no-]ws                 use WebSockets for OADA API

ALIASES
  $ oada w
  $ oada WATCH

EXAMPLE
  $ oada watch /bookmarks
  [
     {
       "resource_id": "resources/dd2d0c95-89ab-400d-863c-e2f62e9570a5",
       "path": "",
       "body": {
         "services": {
           "_rev": 213
         },
         "_meta": {
           "modifiedBy": "system/rev_graph_update",
           "modified": 1610676324.424,
           "_rev": 8799
         },
         "_rev": 8799
       },
       "type": "merge"
     },
     {
       "resource_id": "resources/1e6mHvcV9ZUczdzLDIdz9T8s2eV",
       "path": "/services",
       "body": {
         "ainz": {
           "_rev": 169
         },
         "_meta": {
           "modifiedBy": "system/rev_graph_update",
           "modified": 1610676324.29,
           "_rev": 213
         },
         "_rev": 213
       },
       "type": "merge"
     },
     {
       "resource_id": "resources/7f0d1bcf-c0f9-44a1-a506-18c2fb3e73ed",
       "path": "/services/ainz",
       "body": {
         "rules": {
           "_rev": 151
         },
         "_meta": {
           "modifiedBy": "system/rev_graph_update",
           "modified": 1610676324.12,
           "_rev": 169
         },
         "_rev": 169
       },
       "type": "merge"
     },
     {
       "resource_id": "resources/f6e90c0f-7900-446e-989d-5d32d5dcb741",
       "path": "/services/ainz/rules",
       "body": {
         "_meta": {
           "modifiedBy": "users/5989462",
           "modified": 1610676323.964,
           "_rev": 151
         },
         "_rev": 151
       },
       "type": "merge"
     }
  ]
```

_See code: [src/commands/watch.ts](https://github.com/OADA/cli/blob/v1.1.0/src/commands/watch.ts)_

<!-- commandsstop -->

[jsonl]: https://en.wikipedia.org/wiki/JSON_streaming#Line-delimited_JSON
[concatenated json]: https://en.wikipedia.org/wiki/JSON_streaming#Concatenated_JSON
[hjson]: https://hjson.github.io
[json5]: https://json5.org
[json6]: https://github.com/d3x0r/JSON6
[`jq`]: https://github.com/stedolan/jq
[`minimatch`]: https://github.com/isaacs/minimatch
