/**
 * @license
 * Copyright (c) 2021 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/* eslint-disable sonarjs/no-nested-template-literals */
/* eslint-disable no-secrets/no-secrets */

import { Flags } from '@oclif/core';

import { json, shell } from '../highlight';
import Command from '../BaseCommand';

import getConn from '../connections';
import { output } from '../io';

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
  static override description = 'perform and OADA WATCH';

  static override aliases = ['w', 'WATCH'];

  static override examples = examples;

  static override flags = {
    ...Command.flags,
    out: Flags.string({ char: 'o', default: '-' }),
    rev: Flags.integer({
      char: 'r',
      description: 'rev from which to start (negative means latest - n)',
    }),
    type: Flags.enum({
      options: ['single', 'tree'],
      char: 't',
      default: 'tree',
    }),
  };

  static override args = [
    { name: 'path', required: true, description: 'OADA path to WATCH' },
  ];

  static override strict = true;

  async run() {
    const {
      args: { path: rawpath },
      flags: { out, type, rev: r },
    } = await this.parse(Watch);
    const conn = getConn(this.iconfig);

    const path = `${rawpath}`;
    await output(
      out,
      async function* () {
        let rev = r;
        // Interpret negative rev as "n before latest"
        if (rev && rev < 0) {
          const {
            headers: { 'x-oada-rev': current },
          } = await conn.get({ path });
          rev = Number(current!) + rev;
        }

        // @ts-expect-error the deprecated v2 API confuses the types
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const { changes } = await conn.watch({
          type: type as 'single' | 'tree',
          rev: `${rev}`,
          path,
        });

        yield* changes;
      },
      this.iconfig
    );
  }
}
