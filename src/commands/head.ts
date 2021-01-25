import Command from '../BaseCommand';
import getConn from '../connections';

/**
 * OADA HEAD
 */
export default class Head extends Command {
  static description = 'perform an OADA HEAD';

  static aliases = ['h', 'HEAD'];

  static args = [
    { name: 'paths...', required: true, description: 'OADA path(s) to HEAD' },
  ];

  static strict = false;

  async run() {
    const { argv: paths } = this.parse(Head);
    const conn = getConn(this.iconfig);

    for (const path of paths) {
      await conn.head({ path });
    }
  }
}
