/**
 * @license
 * Copyright (c) 2021 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { expandPath, output } from '../../io';
import Command from '../../BaseCommand';
import getConn from '../../connections';

/**
 * OADA version of ls
 */
export default class List extends Command {
  static override description = 'perform an "OADA ls"';

  static override aliases = ['ls', 'l'];

  static override flags = {
    ...Command.flags,
  };

  static override args = [
    { name: 'paths...', required: true, description: 'path(s) to list' },
  ];

  static override strict = false;

  async run() {
    const { argv: paths } = this.parse(List);
    const conn = getConn(this.iconfig);

    await output(
      '-',
      async function* () {
        for (const p of paths) {
          yield* expandPath(conn, `${p}/*`);
        }
      },
      this.iconfig
    );
  }
}
