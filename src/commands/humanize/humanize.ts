/**
 * @license
 * Copyright (c) 2021 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import KSUID from 'ksuid';

import Command from '../../BaseCommand';
import getConn from '../../connections';
import { input } from '../../io';
// Import { json, shell } from '../../highlight';

function humanize(value: unknown): unknown {
  if (!value) {
    return value;
  }

  if (typeof value === 'object') {
    const out = new Map<unknown, unknown>();
    for (const [k, vValue] of Object.entries(value)) {
      const v = humanize(vValue);
      let t = false;
      for (const transform of transforms) {
        // eslint-disable-next-line unicorn/prefer-regexp-test
        if (transform.match({ k, v })) {
          const { k: kk, v: vv } = transform.apply({ k, v });
          out.set(kk, vv);
          t = true;
        }
      }

      if (!t) {
        out.set(k, v);
      }
    }

    return out;
  }

  return value;
}

interface Item {
  k: unknown;
  v: unknown;
}
type Transform = {
  match(value: Item): boolean;
  apply(value: Item): Item;
};
const transforms: readonly Transform[] = [
  // KSUIDs transform
  {
    // TODO: Better check?
    match({ k }) {
      return typeof k === 'string' && k.length === 27;
    },
    apply({ k, v }) {
      const { date, payload } = KSUID.parse(k as string);
      // TODO: Show payload?
      return {
        k: { date: date.toLocaleString(), payload: payload.toString('hex') },
        v,
      };
    },
  },
  // Modified time transform
  {
    // TODO: Better check?
    match: ({ k, v }) => k === 'modified' && typeof v === 'number',
    apply({ k, v }) {
      const d = new Date((v as number) * 1000);
      // TODO: Show payload?
      return {
        k,
        v: d.toLocaleString(),
      };
    },
  },
];

export default class Humanize extends Command {
  static override aliases = ['humanize'];

  static override args = [
    { name: 'paths...', required: true, description: 'OADA path(s) to GET' },
  ];

  static override flags = {
    ...Command.flags,
  };

  static override strict = false;

  async run() {
    const { argv: paths } = await this.parse(Humanize);
    const conn = getConn(this.iconfig);

    for (const file of paths) {
      // eslint-disable-next-line no-await-in-loop, require-yield
      await input(conn, file, this.iconfig, async function* (source) {
        for await (const data of source) {
          const out = humanize(data);
          // eslint-disable-next-line no-console
          console.dir(out, {
            depth: null,
          });
        }
      });
    }
  }
}
