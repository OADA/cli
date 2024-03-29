/**
 * @license
 * Copyright (c) 2021 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import Command from '../BaseCommand.js';
import getConn from '../connections.js';
import { shell } from '../highlight.js';

const examples = [
  shell`$ oada head /bookmarks/does-exist; echo $?\n0`,
  shell`$ oada head /bookmarks/does-not-exist; echo $?\n1`,
];

/**
 * OADA HEAD
 */
export default class Head extends Command {
  static override description = 'perform an OADA HEAD';

  static override aliases = ['h', 'HEAD'];

  static override examples = examples;

  static override strict = false;

  async run() {
    const { argv: paths } = await this.parse(Head);
    const conn = getConn(this.iconfig);

    for (const path of paths) {
      // eslint-disable-next-line no-await-in-loop
      await conn.head({ path: `${path}` });
    }
  }
}
