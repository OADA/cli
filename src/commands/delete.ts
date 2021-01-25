import { flags } from '@oclif/command';

import Command from '../BaseCommand';
import getConn from '../connections';

/**
 * OADA DELETE
 */
export default class Delete extends Command {
  static description = 'perform an OADA DELETE';

  static aliases = ['d', 'rm', 'DELETE'];

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

    for (const path of paths) {
      await conn.delete({ path });
    }
  }
}
