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

const examples = [
  shell`$ oada mv /resources/foo /bookmarks/foo`,
  shell`$ oada mv /resources/foo1 /resources/foo2 /bookmarks/foo/`,
];

/**
 * OADA "move"
 */
export default class Move extends Command {
  static override description = 'perform an "OADA move"';

  static override aliases = ['mv'];

  static override examples = examples;

  static override strict = false;

  async run() {
    const { argv: paths } = await this.parse(Move);
    const conn = getConn(this.iconfig);
    const path = paths.pop()! as string;

    // Do POST for trailing slash, o.w. PUT
    const method = path.endsWith('/') ? 'post' : 'put';

    // TODO: Figure out to do this with io stuff (move between OADAs)
    for (const file of paths) {
      try {
        // GET original
        // eslint-disable-next-line no-await-in-loop
        const { data } = await conn.get({ path: `${file}` });

        if (!data) {
          throw new Error(`No data found at ${file}`);
        }

        // PUT/POST to destination
        // eslint-disable-next-line no-await-in-loop, security/detect-object-injection
        await conn[method]({ path, data });

        // DELETE original
        // eslint-disable-next-line no-await-in-loop
        await conn.delete({ path: `${file}` });
      } catch (error: unknown) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }
  }
}
