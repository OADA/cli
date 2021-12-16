import Command from '../../BaseCommand';
import getConn from '../../connections';
import { shell } from '../../highlight';

const examples = [
  shell`$ oada mv /resources/foo /bookmarks/foo`,
  shell`$ oada mv /resources/foo1 /resources/foo2 /bookmarks/foos/`,
];

/**
 * OADA "move"
 */
export default class Move extends Command {
  static override description = 'perform an "OADA move"';

  static override aliases = ['mv'];

  static override flags = {
    ...Command.flags,
  };

  static override examples = examples;

  static override args = [
    { name: 'paths...', required: true, description: 'path(s) to move' },
    { name: 'path', required: true, description: 'OADA path to which to move' },
  ];

  static override strict = false;

  async run() {
    const { argv: paths } = this.parse(Move);
    const conn = getConn(this.iconfig);
    const path = paths.pop()!;

    // Do POST for trailing slash, o.w. PUT
    const method = path.endsWith('/') ? 'post' : 'put';

    // TODO: Figure out to do this with io stuff (move between OADAs)
    for (const file of paths) {
      try {
        // GET original
        const { data } = await conn.get({ path: file });

        if (!data) {
          throw new Error(`No data found at ${file}`);
        }

        // PUT/POST to destination
        await conn[method]({ path, data });

        // DELETE original
        await conn.delete({ path: file });
      } catch (err) {
        console.error(err);
      }
    }
  }
}
