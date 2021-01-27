import { flags } from '@oclif/command';

import Command from '../BaseCommand';
import { json, shell } from '../highlight';

import {
  OADAifiedJsonArray,
  OADAifiedJsonObject,
  OADAifiedJsonValue,
  oadaify,
  _meta,
  _id,
} from '@oada/oadaify';

import { output, expandPath } from '../io';
import getConn from '../connections';

/**
 * @todo why does TS need this?
 */
function isArray(
  oadaified: OADAifiedJsonArray | OADAifiedJsonObject
): oadaified is OADAifiedJsonArray {
  return Array.isArray(oadaified);
}

const examples = [
  `${shell`$ oada get /bookmarks`}
${json`{
  "_id": "resources/default:resources_bookmarks_321",
  "_rev": 45,
  "_type": "application/vnd.oada.bookmarks.1+json",
  "_meta": {
    "_id": "resources/default:resources_bookmarks_321/_meta",
    "_rev": 45
  },
  "foo": "bar",
  "baz": 700
}`}`,

  `${shell`$ oada get /bookmarks/*`}
${json`"bar"`}
${json`700`}`,
];

/**
 * OADA GET
 */
export default class Get extends Command {
  static description = 'perform an OADA GET (read)';

  static aliases = ['g', 'GET'];

  static examples = examples;

  static flags = {
    ...Command.flags,
    recursive: flags.boolean({ char: 'R', default: false }),
    meta: flags.boolean({ char: 'm', default: false }),
    out: flags.string({ char: 'o', default: '-' }),
  };

  static args = [
    { name: 'paths...', required: true, description: 'OADA path(s) to GET' },
  ];

  static strict = false;

  async run() {
    const {
      argv: paths,
      flags: { out, meta },
    } = this.parse(Get);
    const conn = getConn(this.iconfig);

    await output(
      out,
      async function* () {
        for (const p of paths) {
          const pp = expandPath(conn, p);
          for await (const path of pp) {
            const { data } = await conn.get({ path });
            const oadaified = oadaify(data);

            if (meta) {
              await getMeta(oadaified);

              async function getMeta(
                oadaified: OADAifiedJsonValue
              ): Promise<OADAifiedJsonValue> {
                if (!oadaified || typeof oadaified !== 'object') {
                  return oadaified;
                }

                if (isArray(oadaified)) {
                  return Promise.all(oadaified.map(getMeta));
                }

                for (const key in oadaified) {
                  oadaified[key] = await getMeta(oadaified[key]);
                }

                // Check for "empty" meta ?
                const meta = oadaified[_meta] as
                  | OADAifiedJsonObject
                  | undefined;
                if (meta) {
                  // Fetch meta?
                  const { data } = await conn.get({
                    path: meta[_id] as string,
                  });
                  // Fill it in
                  oadaified[_meta] = oadaify(data);
                }

                return oadaified;
              }
            }

            yield oadaified;
          }
        }
      },
      this.iconfig
    );
  }
}
