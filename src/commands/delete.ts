import { flags } from '@oclif/command';

import Command from '../BaseCommand';
import getConn from '../connections';
import { expandPath } from '../io';
import { shell } from '../highlight';

const examples = [
  shell`$ oada delete /bookmarks/foo`,
  shell`$ oada rm /bookmarks/foo /bookmarks/bar /bookmarks/baz*`,
];

/**
 * OADA DELETE
 */
export default class Delete extends Command {
  static description = 'perform an OADA DELETE';

  static aliases = ['d', 'rm', 'DELETE'];

  static examples = examples;

  static flags = {
    ...Command.flags,
    recursive: flags.boolean({ char: 'R', default: false }),
  };

  static args = [
    { name: 'paths...', required: true, description: 'OADA path(s) to GET' },
  ];

  static strict = false;

  async run() {
    const { argv: paths } = this.parse(Delete);
    const conn = getConn(this.iconfig);

    for (const p of paths) {
      const pp = expandPath(conn, p);
      for await (const path of pp) {
        await conn.delete({ path });
      }
    }
  }
}
