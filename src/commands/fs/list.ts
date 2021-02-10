import Command from '../../BaseCommand';
import { output, expandPath } from '../../io';
import getConn from '../../connections';

/**
 * OADA version of ls
 */
export default class List extends Command {
  static description = 'perform an "OADA ls"';

  static aliases = ['ls', 'l'];

  static flags = {
    ...Command.flags,
  };

  static args = [
    { name: 'paths...', required: true, description: 'path(s) to list' },
  ];

  static strict = false;

  async run() {
    const { argv: paths } = this.parse(List);
    const conn = getConn(this.iconfig);

    await output(
      '-',
      async function* () {
        for (const p of paths) {
          yield* expandPath(conn, p + '/*');
        }
      },
      this.iconfig
    );
  }
}
