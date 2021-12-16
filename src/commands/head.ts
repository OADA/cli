/**
 * @license
 * Copyright (c) 2021 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
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
  static override description = 'perform an OADA HEAD';

  static override aliases = ['h', 'HEAD'];

  static override examples = examples;

  static override flags = {
    ...Command.flags,
  };

  static override args = [
    { name: 'paths...', required: true, description: 'OADA path(s) to HEAD' },
  ];

  static override strict = false;

  async run() {
    const { argv: paths } = this.parse(Head);
    const conn = getConn(this.iconfig);

    for (const path of paths) {
      await conn.head({ path });
    }
  }
}
