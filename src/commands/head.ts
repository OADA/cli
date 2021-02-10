import Command from '../BaseCommand';
import getConn from '../connections';
import { shell } from '../highlight';

const examples = [
  shell`$ oada head /bookmarks/does-exist; echo $?\n0`,
  shell`$ oada head /bookmarks/does-not-exist; echo $?\n1`,
];

/**
 * OADA HEAD
 */
export default class Head extends Command {
  static description = 'perform an OADA HEAD';

  static aliases = ['h', 'HEAD'];

  static examples = examples;

  static flags = {
    ...Command.flags,
  };

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
