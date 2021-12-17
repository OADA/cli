/**
 * @license
 * Copyright (c) 2021 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { flags } from '@oclif/command';

import Command from '../BaseCommand';
import { expandPath } from '../io';
import getConn from '../connections';
import { shell } from '../highlight';

const examples = [
  shell`$ oada delete /bookmarks/foo`,
  shell`$ oada rm /bookmarks/foo /bookmarks/bar /bookmarks/baz*`,
];

/**
 * OADA DELETE
 */
export default class Delete extends Command {
  static override description = 'perform an OADA DELETE';

  static override aliases = ['d', 'rm', 'DELETE'];

  static override examples = examples;

  static override flags = {
    ...Command.flags,
    recursive: flags.boolean({ char: 'R', default: false }),
  };

  static override args = [
    { name: 'paths...', required: true, description: 'OADA path(s) to GET' },
  ];

  static override strict = false;

  async run() {
    const { argv: paths } = this.parse(Delete);
    const conn = getConn(this.iconfig);

    for (const p of paths) {
      const pp = expandPath(conn, p);
      // eslint-disable-next-line no-await-in-loop
      for await (const path of pp) {
        await conn.delete({ path });
      }
    }
  }
}
