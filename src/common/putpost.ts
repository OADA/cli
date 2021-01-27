/**
 * Shared code for PUT and POST commands
 *
 * @packageDocumentation
 */

import { flags } from '@oclif/command';

import Command from '../BaseCommand';
import { input } from '../io';
import getConn from '../connections';
import { shell } from '../highlight';

/**
 * OADA PUT/POST
 */
const [put, post] = (<const>['put', 'post']).map((method) => {
  const METH = method.toUpperCase();

  // TODO: Fix this nonsense
  const examples =
    method === 'put'
      ? [shell`$ oada put - /bookmarks/ <<< '{"a": 1}'`]
      : [shell`$ oada post - /bookmarks/ <<< '{"a": 1}{"b": true}'`];

  return class Clazz extends Command {
    static description = `Perform an OADA ${METH}`;

    static aliases = [method.slice(0, 2), METH];

    static examples = examples;

    static flags = {
      ...Command.flags,
      recursive: flags.boolean({ char: 'R', default: false }),
    };

    static args = [
      { name: 'paths...', required: true, description: `paths to ${METH}` },
      { name: 'path', required: true, description: 'destination OADA path' },
    ];

    static strict = false;

    async run() {
      const { argv: paths } = this.parse(Clazz);
      const conn = getConn(this.iconfig);
      const path = paths.pop()!;

      for (const file of paths) {
        await input<any>(conn, file, this.iconfig, async function* (source) {
          for await (const data of source) {
            await conn[method]({ path, data });
          }
        });
      }
    }
  };
});

export default { put, post };
