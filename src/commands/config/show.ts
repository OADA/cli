/**
 * @license
 * Copyright (c) 2021 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import Command from '../../BaseCommand';

import { output } from '../../io';

/**
 * Class for showing the config and from where it is loaded?
 */
export default class ShowConfig extends Command {
  static override description = 'Show the current config settings';

  static override aliases = ['config'];

  static override flags = {
    ...Command.flags,
  };

  async run() {
    const config = this.iconfig;
    console.error(`Loading configs:\n${this.configFiles.join('\n')}`);
    output(
      '-',
      async function* () {
        yield config;
      },
      this.iconfig
    );
  }
}
