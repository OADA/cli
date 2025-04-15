/**
 * @license
 * Copyright (c) 2021 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { Flags } from '@oclif/core';

import Command from '../BaseCommand.js';
import getConn from '../connections.js';
import { shell } from '../highlight.js';
import { expandPath } from '../io.js';

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
    recursive: Flags.boolean({ char: 'R', default: false }),
  };

  static override strict = false;

  async run() {
    const { argv: paths } = await this.parse(Delete);
    const conn = getConn(this.iconfig);

    for await (const p of paths) {
      const pp = expandPath(conn, `${p}`);
      for await (const path of pp) {
        await conn.delete({ path });
      }
    }
  }
}
