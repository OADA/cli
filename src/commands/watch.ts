import { flags } from '@oclif/command';

import { AsyncSink } from 'ix/asynciterable';

import Command from '../BaseCommand';
import { json, shell } from '../highlight';

import { output } from '../io';
import getConn from '../connections';

const examples = [
  `${shell`$ oada watch /bookmarks`}
${json`[
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
]`}`,
];

/**
 * OADA WATCH
 */
export default class Watch extends Command {
  static description = 'perform and OADA WATCH';

  static aliases = ['w', 'WATCH'];

  static examples = examples;

  static flags = {
    ...Command.flags,
    out: flags.string({ char: 'o', default: '-' }),
    rev: flags.integer({
      char: 'r',
      description: 'rev from which to start (negative means latest - n)',
    }),
    type: flags.enum({
      options: ['sinlge', 'tree'],
      char: 't',
      default: 'tree',
    }),
  };

  static args = [
    { name: 'path', required: true, description: 'OADA path to WATCH' },
  ];

  static strict = true;

  async run() {
    const {
      args: { path },
      flags: { out, type, rev: r },
    } = this.parse(Watch);
    const conn = getConn(this.iconfig);

    const sink = new AsyncSink();
    await output(
      out,
      async function* () {
        let rev = r;
        // Interpret negative rev as "n before latest"
        if (rev && rev < 0) {
          const {
            headers: { 'x-oada-rev': cur },
          } = await conn.get({ path });
          rev = +cur! + rev;
        }
        await conn.watch({
          // @ts-ignore
          type,
          rev: rev + '',
          path,
          watchCallback(change) {
            sink.write(change);
          },
        });

        yield* sink;
      },
      this.iconfig
    );
  }
}
