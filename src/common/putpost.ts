/**
 * @license
 * Copyright (c) 2021 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/**
 * Shared code for PUT and POST commands
 *
 * @packageDocumentation
 */

import { flags } from '@oclif/command';

// @ts-expect-error shut up ts
import type { Body } from '@oada/client/dist/client';

import { input, loadFile } from '../io';
import Command from '../BaseCommand';
import getConn from '../connections';
import { shell } from '../highlight';

/**
 * OADA PUT/POST
 */
const [put, post] = (['put', 'post'] as const).map((method) => {
  const METH = method.toUpperCase();

  // TODO: Fix this nonsense
  const examples =
    method === 'put'
      ? [shell`$ oada put - /bookmarks/ <<< '{"a": 1}'`]
      : [shell`$ oada post - /bookmarks/ <<< '{"a": 1}{"b": true}'`];

  return class PutPost extends Command {
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        flags: { tree: treefile },
      } = this.parse(PutPost);
      const conn = getConn(this.iconfig);
      const path = paths.pop()!;

      // Load tree
      const tree = treefile
        ? ((await loadFile(treefile)) as Record<string, unknown>)
        : undefined;

      for (const file of paths) {
        // eslint-disable-next-line no-await-in-loop, require-yield
        await input<Body>(conn, file, this.iconfig, async function* (source) {
          for await (const data of source) {
            // eslint-disable-next-line security/detect-object-injection
            await conn[method]({ path, tree, data });
          }
        });
      }
    }
  };
});

export default { put, post };
