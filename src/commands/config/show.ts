/**
 * @license
 * Copyright (c) 2021 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/* eslint-disable no-console */

import Command from '../../BaseCommand.js';

import { output } from '../../io.js';

/**
 * Class for showing the config and from where it is loaded?
 */
export default class ShowConfig extends Command {
  static override description = 'Show the current config settings';

  static override aliases = ['config'];

  async run() {
    const config = this.iconfig;
    console.error(this.configFiles, 'Loading configs');
    await output(
      '-',
      async function* () {
        yield config;
      },
      this.iconfig
    );
  }
}
