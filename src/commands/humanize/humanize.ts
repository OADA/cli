import KSUID from 'ksuid';

import Command from '../../BaseCommand';
import { input } from '../../io';
import getConn from '../../connections';
//import { json, shell } from '../../highlight';

function humanize(val: unknown): any {
  if (!val) {
    return val;
  }
  if (typeof val === 'object') {
    const out = new Map<any, any>();
    for (const [k, vval] of Object.entries(val!)) {
      const v = humanize(vval);
      let t = false;
      for (const transform of transforms) {
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
  return val;
}

interface Item {
  k: unknown;
  v: unknown;
}
type Transform = {
  match: (val: Item) => boolean;
  apply: (val: Item) => Item;
};
const transforms: readonly Transform[] = [
  // KSUIDs transform
  {
    // TODO: Better check?
    match: ({ k }) => typeof k === 'string' && k.length === 27,
    apply: ({ k, v }) => {
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
    apply: ({ k, v }) => {
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
    const { argv: paths } = this.parse(Humanize);
    const conn = getConn(this.iconfig);

    for (const file of paths) {
      await input<any>(conn, file, this.iconfig, async function* (source) {
        for await (const data of source) {
          const out = humanize(data);
          console.dir(out, { depth: null });
        }
      });
    }
  }
}
