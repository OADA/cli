import Command from '../../BaseCommand';
import getConn from '../../connections';
import { expandPath } from '../../io';
import { shell } from '../../highlight';

const examples = [shell`$ oada touch /bookmarks`];

/**
 * OADA version of touch
 *
 * @todo this maybe not work with future OADA versions?
 */
export default class Touch extends Command {
  static description = 'perform and "OADA touch"';

  static aliases = ['touch'];

  static examples = examples;

  static args = [
    { name: 'paths...', required: true, description: `paths to touch` },
  ];

  static strict = false;

  async run() {
    const { argv: paths } = this.parse(Touch);
    const conn = getConn(this.iconfig);

    for (const p of paths) {
      const pp = expandPath(conn, p);
      for await (const path of pp) {
        // PUT an empty object
        await conn.put({ path, data: {} });
      }
    }
  }
}
