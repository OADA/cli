import Command from '../../BaseCommand';
import { input } from '../../io';
import getConn from '../../connections';

/**
 * OADA "copy"
 */
export default class Copy extends Command {
  static description = 'perform an "OADA copy"';

  static aliases = ['cp'];

  static args = [
    { name: 'paths...', required: true, description: 'path(s) to copy' },
    { name: 'path', required: true, description: 'OADA path to which to copy' },
  ];

  static strict = false;

  async run() {
    const { argv: paths } = this.parse(Copy);
    const conn = getConn(this.iconfig);
    const path = paths.pop()!;

    // Do POST for trailing slash, o.w. PUT
    const method = path.endsWith('/') ? 'post' : 'put';

    for (const file of paths) {
      await input<any>(conn, file, async function* (source) {
        for await (const data of source) {
          await conn[method]({ path, data });
        }
      });
    }
  }
}
