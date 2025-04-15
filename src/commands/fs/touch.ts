/**
 * @license
 * Copyright (c) 2021 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import Command from '../../BaseCommand.js';
import getConn from '../../connections.js';
import { shell } from '../../highlight.js';
import { expandPath } from '../../io.js';

const examples = [shell`$ oada touch /bookmarks`];

/**
 * OADA version of touch
 *
 * @todo this maybe not work with future OADA versions?
 */
export default class Touch extends Command {
  static override description = 'perform and "OADA touch"';

  static override aliases = ['touch'];

  static override examples = examples;

  static override strict = false;

  async run() {
    const { argv: paths } = await this.parse(Touch);
    const conn = getConn(this.iconfig);

    for (const p of paths) {
      const pp = expandPath(conn, `${p}`);
      // eslint-disable-next-line no-await-in-loop
      for await (const path of pp) {
        // PUT an empty object
        await conn.put({ path, data: {} });
      }
    }
  }
}
