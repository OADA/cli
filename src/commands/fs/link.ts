/**
 * @license
 * Copyright (c) 2021 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { flags } from '@oclif/command';

import Command from '../../BaseCommand.js';
import getConn from '../../connections.js';
import { shell } from '../../highlight.js';

const examples = [
  shell`$ oada ln /resources/my-thingy /bookmarks/thingy`,
  shell`$ oada ln /resources/thingy1 /resources/thingy2 /bookmarks/thingies/`,
];

/**
 * OADA "link"
 */
export default class Link extends Command {
  static override description = 'perform an "OADA link"';

  static override aliases = ['ln'];

  static override examples = examples;

  static override flags = {
    ...Command.flags,
    versioned: flags.boolean({
      char: 'r',
      default: false,
      description: 'make versioned link(s)',
    }),
    force: flags.boolean({
      char: 'f',
      default: false,
      description: 'delete conflicting existing data/links',
    }),
  };

  static override args = [
    { name: 'paths...', required: true, description: 'path(s) to link' },
    { name: 'path', required: true, description: 'OADA path in which to link' },
  ];

  static override strict = false;

  async run() {
    const {
      argv: paths,
      flags: { force, versioned },
    } = this.parse(Link);
    const conn = getConn(this.iconfig);
    const path = paths.pop()!;

    // Do POST for trailing slash or multiple things to link, o.w. PUT?
    const method = path.endsWith('/') || paths.length > 1 ? 'post' : 'put';

    // TODO: Support "linking" stuff not already in the OADA?
    for (const file of paths) {
      try {
        // Get _id for linking
        // eslint-disable-next-line no-await-in-loop
        const { data: _id } = await conn.get({
          path: `${file}/_id`,
        });

        if (typeof _id !== 'string') {
          throw new TypeError(`${file} is not a valid OADA resource`);
        }

        if (force && method === 'put') {
          // Delete anything in the way
          // eslint-disable-next-line no-await-in-loop
          await conn.delete({ path: file });
        }

        // Create link
        // eslint-disable-next-line no-await-in-loop, security/detect-object-injection
        await conn[method]({
          path,
          data: versioned ? { _id } : { _id, _rev: 0 },
        });
      } catch (error: unknown) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }
  }
}
