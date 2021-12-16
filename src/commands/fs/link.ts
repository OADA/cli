import { flags } from '@oclif/command';

import Command from '../../BaseCommand';
import getConn from '../../connections';
import { shell } from '../../highlight';

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
        const { data: _id } = (await conn.get({
          path: `${file}/_id`,
        })) as any;

        if (force && method === 'put') {
          // delete anything in the way
          await conn.delete({ path: file });
        }

        // Create link
        await conn[method]({
          path,
          data: versioned ? { _id } : { _id, _rev: 0 },
        });
      } catch (err) {
        console.error(err);
      }
    }
  }
}
