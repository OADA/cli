import Command from '../../BaseCommand';

import { output } from '../../io';

/**
 * Class for showing the config and from where it is loaded?
 */
export default class ShowConfig extends Command {
  static description = 'Show the current config settings';

  static aliases = ['config'];

  static flags = {
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
