/**
 * @license
 * Copyright (c) 2021 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/* eslint-disable sonarjs/no-nested-template-literals */

import { Flags } from '@oclif/core';

import { json, shell } from '../highlight';
import Command from '../BaseCommand';

import {
  OADAifiedJsonArray,
  OADAifiedJsonObject,
  OADAifiedJsonValue,
  _id,
  _meta,
  oadaify,
} from '@oada/oadaify';

import { expandPath, loadFile, output } from '../io';
import type { OADAClient } from '../client.cjs';
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
    tree: Flags.string({
      char: 'T',
      description: 'file containing an OADA tree to use for a tree GET',
    }),
    recursive: Flags.boolean({ char: 'R', default: false }),
    meta: Flags.boolean({ char: 'm', default: false }),
    out: Flags.string({ char: 'o', default: '-' }),
  };

  static override args = [
    { name: 'paths...', required: true, description: 'OADA path(s) to GET' },
  ];

  static override strict = false;

  async run() {
    const {
      argv: paths,
      flags: { out, meta, tree: treefile },
    } = await this.parse(Get);
    const conn = getConn(this.iconfig);

    // Load tree
    const tree = treefile
      ? ((await loadFile(treefile)) as Record<string, unknown>)
      : undefined;

    await output(
      out,
      async function* () {
        for (const p of paths) {
          const pp = expandPath(conn, p);
          // eslint-disable-next-line no-await-in-loop
          for await (const path of pp) {
            const { data } = await conn.get({ path, tree });

            if (Buffer.isBuffer(data)) {
              yield data;
              return;
            }

            const oadaified = oadaify(data!);

            if (meta) {
              await getMeta(conn, oadaified);
            }

            yield oadaified;
          }
        }
      },
      this.iconfig
    );
  }
}

async function getMeta(
  conn: OADAClient,
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
    return Promise.all(
      oadaified.map(async (element) => getMeta(conn, element))
    );
  }

  const out: OADAifiedJsonObject = Object.fromEntries(
    await Promise.all(
      Object.entries(oadaified).map(async ([k, v]) => [
        k,
        await getMeta(conn, v!),
      ])
    )
  ) as OADAifiedJsonObject;

  // Check for "empty" meta ?
  // eslint-disable-next-line security/detect-object-injection
  const meta = out[_meta] as OADAifiedJsonObject | undefined;
  if (meta) {
    // Fetch meta?
    const { data } = await conn.get({
      // eslint-disable-next-line security/detect-object-injection
      path: meta[_id] as string,
    });

    if (!data || Buffer.isBuffer(data)) {
      throw new TypeError(
        // eslint-disable-next-line security/detect-object-injection
        `Meta ${meta[_id]} is not a valid OADA meta resource`
      );
    }

    // Fill it in
    // eslint-disable-next-line security/detect-object-injection
    out[_meta] = oadaify(data);
  }

  return out;
}
