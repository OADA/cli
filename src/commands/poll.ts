/**
 * @license
 * Copyright (c) 2022 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { setInterval } from 'node:timers/promises';

import { Args, Flags } from '@oclif/core';

import type Tree from '@oada/types/oada/tree/v1.js';
import { oadaify } from '@oada/oadaify';

import Command from '../BaseCommand.js';

import { loadFile, output } from '../io.js';
import getConn from '../connections.js';

const examples = [''];

/**
 * Poll OADA with GETs
 */
export default class Poll extends Command {
  static override description = 'Poll an OADA path with periodic GETs';

  static override aliases = ['POLL'];

  static override examples = examples;

  static override flags = {
    out: Flags.string({ char: 'o', default: '-' }),
    tree: Flags.string({
      char: 'T',
      description: 'file containing an OADA tree to use for a tree GET',
    }),
    interval: Flags.integer({ char: 'i', default: 1000 }),
  };

  static override args = {
    path: Args.string({ required: true, description: 'OADA path to poll' }),
  };

  static override strict = true;

  async run() {
    const {
      args: { path: rawpath },
      flags: { out, tree: treefile, interval },
    } = await this.parse(Poll);
    const conn = getConn(this.iconfig);

    // Load tree
    const tree = treefile ? ((await loadFile(treefile)) as Tree) : undefined;

    const path = `${rawpath}`;
    await output(
      out,
      async function* () {
        // Poll until something breaks?
        const poll = setInterval(interval);
        for await (const _ of poll) {
          const { data } = await conn.get({ path, tree });

          if (Buffer.isBuffer(data)) {
            yield data;
            return;
          }

          // @ts-expect-error oadaify nonsense
          const oadaified = oadaify(data);

          yield oadaified;
        }
      },
      this.iconfig
    );
  }
}
