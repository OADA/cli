/**
 * Shared code for PUT and POST commands
 *
 * @packageDocumentation
 */

import { flags } from '@oclif/command';

import Command from '../BaseCommand';
import { input, loadFile } from '../io';
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
    static override description = `Perform an OADA ${METH}`;

    static override aliases = [method.slice(0, 2), METH];

    static override examples = examples;

    static override flags = {
      ...Command.flags,
      tree: flags.string({
        char: 'T',
        description: `file containing an OADA tree to use for a tree ${METH}`,
      }),
    };

    static override args = [
      { name: 'paths...', required: true, description: `paths to ${METH}` },
      { name: 'path', required: true, description: 'destination OADA path' },
    ];

    static override strict = false;

    async run() {
      const {
        argv: paths,
        flags: { tree: treefile },
      } = this.parse(Clazz);
      const conn = getConn(this.iconfig);
      const path = paths.pop()!;

      // Load tree
      const tree = treefile && (await loadFile(treefile));

      for (const file of paths) {
        await input<any>(conn, file, this.iconfig, async function* (source) {
          for await (const data of source) {
            await conn[method]({ path, tree, data });
          }
        });
      }
    }
  };
});

export default { put, post };
