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

import { Flags } from '@oclif/core';

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
      tree: Flags.string({
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
      } = await this.parse(PutPost);
      const conn = getConn(this.iconfig);
      const path = paths.pop()!;

      // Load tree
      const tree = treefile
        ? ((await loadFile(treefile)) as Record<string, unknown>)
        : undefined;

      for (const file of paths) {
        // eslint-disable-next-line no-await-in-loop, require-yield
        await input(conn, file, this.iconfig, async function* (source) {
          for await (const data of source) {
            // eslint-disable-next-line security/detect-object-injection, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
            await conn[method]({ path, tree, data: data as any });
          }
        });
      }
    }
  };
});

/** @internal */
export default { put, post };
