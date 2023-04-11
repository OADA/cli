/**
 * @license
 * Copyright (c) 2021 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import Command from '../../BaseCommand.js';
import getConn from '../../connections.js';
import { input } from '../../io.js';
import { shell } from '../../highlight.js';

const examples = [
  shell`$ oada cp /resources/foo /bookmarks/foo`,
  shell`$ oada cp /resources/foo1 /resources/foo2 /bookmarks/foo/`,
];

/**
 * OADA "copy"
 */
export default class Copy extends Command {
  static override description = 'perform an "OADA copy"';

  static override aliases = ['cp'];

  static override examples = examples;

  static override strict = false;

  async run() {
    const { argv: paths } = await this.parse(Copy);
    const conn = getConn(this.iconfig);
    const path = paths.pop()! as string;

    // Do POST for trailing slash, o.w. PUT
    const method = path.endsWith('/') ? 'post' : 'put';

    for await (const file of paths) {
      // eslint-disable-next-line require-yield
      await input(conn, `${file}`, this.iconfig, async function* (source) {
        for await (const data of source) {
          // eslint-disable-next-line security/detect-object-injection
          await conn[method]({ path, data: data as any });
        }
      });
    }
  }
}
