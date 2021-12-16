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

import { output, expandPath, loadFile } from '../io';
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
  static override description = 'perform an OADA GET (read)';

  static override aliases = ['g', 'GET'];

  static override examples = examples;

  static override flags = {
    ...Command.flags,
    tree: flags.string({
      char: 'T',
      description: 'file containing an OADA tree to use for a tree GET',
    }),
    recursive: flags.boolean({ char: 'R', default: false }),
    meta: flags.boolean({ char: 'm', default: false }),
    out: flags.string({ char: 'o', default: '-' }),
  };

  static override args = [
    { name: 'paths...', required: true, description: 'OADA path(s) to GET' },
  ];

  static override strict = false;

  async run() {
    const {
      argv: paths,
      flags: { out, meta, tree: treefile },
    } = this.parse(Get);
    const conn = getConn(this.iconfig);

    // Load tree
    const tree = treefile && (await loadFile(treefile));

    await output(
      out,
      async function* () {
        for (const p of paths) {
          const pp = expandPath(conn, p);
          for await (const path of pp) {
            const { data } = await conn.get({ path, tree });

            if (Buffer.isBuffer(data)) {
              yield data;
              return;
            }

            const oadaified = oadaify(data as object);

            if (meta) {
              await getMeta(oadaified);

              async function getMeta(
                oadaified: OADAifiedJsonValue
              ): Promise<OADAifiedJsonValue> {
                if (
                  !oadaified ||
                  typeof oadaified !== 'object' ||
                  Buffer.isBuffer(oadaified)
                ) {
                  return oadaified;
                }

                if (isArray(oadaified)) {
                  return Promise.all(oadaified.map(getMeta));
                }

                for (const [key, value] of Object.entries(oadaified)) {
                  oadaified[key] = await getMeta(value);
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
                  oadaified[_meta] = oadaify(data as object);
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
