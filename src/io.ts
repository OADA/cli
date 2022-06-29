/**
 * @license
 * Copyright (c) 2021 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import type { Readable, Writable } from 'node:stream';
import { createReadStream, createWriteStream } from 'node:fs';
import { extname, isAbsolute, join } from 'node:path';
import { URL } from 'node:url';
import { pipeline } from 'node:stream/promises';

import { Minimatch } from 'minimatch';
// Concatenated JSON in, LJSON out
import highlight from 'cli-highlight';
import { parse } from 'concatjson';
import { request } from 'gaxios';
import { stringify } from 'ndjson';

import type { OADAClient } from './client.cjs';
import { oadaify } from '@oada/oadaify';

// Support input from TypeScript files
import 'ts-node/register/transpile-only';
// Support input from HJSON files
import 'hjson/lib/require-config';
// Support for input from JSON6 files
import 'json-6/lib/require';

import type { IConfig } from './BaseCommand';
// Make json-6 load JSON5 (because it can)
// eslint-disable-next-line unicorn/prefer-module
require.extensions['.json5'] = require.extensions['.json6'];

/**
 * Supported input/output types
 */
export const enum IOType {
  /**
   * A realave file path or a file URL
   */
  File,
  /**
   * An absolute path within OADA
   */
  Oada,
  /**
   * A URL (not a file URL)
   */
  Url,
  /**
   * Standard in stream
   */
  Stdin,
  /**
   * Standard out stream
   */
  Stdout,
  /**
   * Standard out TTY
   */
  Tty,
}

// TODO: Refactor these two functions
function inputType(inString: string, { domain, domains }: IConfig) {
  if (inString === '-') {
    return IOType.Stdin;
  }

  // Assume absolute path means OADA
  if (isAbsolute(inString)) {
    return IOType.Oada;
  }

  try {
    const { protocol, host } = new URL(inString);
    if (protocol === 'file:') {
      return IOType.File;
    }

    if ([domain, ...Object.keys(domains)].includes(host)) {
      // Use OADA connection for known OADA domains
      return IOType.Oada;
    }

    return IOType.Url;
  } catch {
    // Assume it's a file path?
    return IOType.File;
  }
}

async function outputType(outString: string, { tty }: IConfig) {
  if (outString === '-') {
    if (tty) {
      return IOType.Tty;
    }

    return IOType.Stdout;
  }

  /*
  // Assume absolute path means OADA
  if (isAbsolute(output)) {
    return IOType.Oada;
  }
   */

  // TODO: Support multiple OADA domains?
  try {
    const { protocol } = new URL(outString);
    return protocol === 'file:' ? IOType.File : IOType.Url;
  } catch {
    // Assume it's a file path?
    return IOType.File;
  }
}

/**
 * List of file extensions we can import
 *
 * Anything else, attempt to read in as Concatenated JSON
 *
 * @todo make this more extensible?
 * @todo support these extensions coming from remote??
 */
export const importable = ['.json6', '.json5', '.hjson', '.ts', '.js'] as const;

/**
 * Load a support file as JSON
 */
export async function loadFile(inString: string) {
  const path = join(process.cwd(), inString);
  const { default: data } = (await import(path)) as { default: unknown };
  return data;
}

function inputChain(
  conn: OADAClient,
  inString: string,
  config: IConfig
): [
  Readable | (() => AsyncIterable<unknown>),
  ...Array<
    Readable | ((source: AsyncIterable<unknown>) => AsyncIterable<unknown>)
  >
] {
  switch (inputType(inString, config)) {
    case IOType.Stdin:
      return [process.stdin, parse()];
    case IOType.File: {
      const extension = extname(inString);
      if ((importable as readonly string[]).includes(extension)) {
        return [
          async function* () {
            yield loadFile(inString);
          },
        ];
      }

      return [createReadStream(inString), parse()];
    }

    case IOType.Oada:
      return [
        // TODO: Use code from get subcommand?
        async function* () {
          const paths = expandPath(conn, inString);
          for await (const path of paths) {
            const { data } = await conn.get({ path });
            yield data;
          }
        },
      ];
    case IOType.Url:
      return [
        async function* () {
          const { data } = await request({
            // TODO: support stream response?
            responseType: 'json',
            url: inString,
          });
          yield data;
        },
      ];
    default:
      throw new Error(`Unsupported input type: ${inString}`);
  }
}

/**
 * Function for expanding * etc. in paths akin to shell expansion
 *
 * Only works with OADA paths
 *
 * @todo inefficient and gross
 */
export async function* expandPath(
  conn: OADAClient,
  path: string
): AsyncIterable<string> {
  let parts: string[];
  let origin: string;
  try {
    // Try parsing path as URL
    let pathname;
    ({ pathname, origin } = new URL(path));
    parts = pathname.split('/');
  } catch {
    // Treat as absolute path in OADA
    parts = path.split('/');
    origin = '';
  }

  // Preserve trailing slash
  const trailing = path.endsWith('/');

  yield* expand('/', { conn, parts, trailing, origin });
}

async function* expand(
  r: string,
  {
    conn,
    parts,
    trailing,
    origin,
  }: {
    conn: OADAClient;
    parts: readonly string[];
    trailing: boolean;
    origin: string;
  }
): AsyncIterable<string> {
  const p = Array.from(parts);
  let root = r;
  let expanded = false;
  for (const part of parts) {
    p.shift();

    // Use minimatch for star etc.
    const mm = new Minimatch(part);

    // TODO: Better way to test for non-minimatch key??
    if (
      mm.set.length <= 1 &&
      // @ts-expect-error The ? handles it but ts is still mad
      mm.set[0]?.length <= 1 &&
      ['string', 'undefined'].includes(typeof mm.set[0]?.[0])
    ) {
      // Just move on to next part
      root = join(root, part);
      continue;
    }

    // "Shell expand"
    try {
      // Get all children
      // eslint-disable-next-line no-await-in-loop
      const { data: children } = await conn.get({ path: join('/', root) });
      if (!children || typeof children !== 'object') {
        // Don't expand strings and such
        throw new TypeError('No children');
      }

      if (Buffer.isBuffer(children)) {
        throw new TypeError('Cannot traverse non-JSON');
      }

      // Test children against pattern
      for (const child in oadaify(children) as Record<string, unknown>) {
        // eslint-disable-next-line unicorn/prefer-regexp-test
        if (mm.match(child)) {
          // Yield any matching children
          yield* expand(join(root, child), {
            conn,
            parts: p,
            trailing,
            origin,
          });
          expanded = true;
        }
      }
    } catch {
      // If we fail to expand, don't error just yield nothing
    }
  }

  if (!expanded) {
    yield origin + join('/', root + (trailing ? '/' : ''));
  }
}

/**
 * Handles reading in input.
 *
 * @param file File to which to output (or `-` for stdout)
 * @todo Support "file" in OADA instead of local fs
 */
export async function input<T>(
  conn: OADAClient,
  paths: string | string[],
  config: IConfig,
  handler: (source: AsyncIterable<T>) => AsyncGenerator<T>
): Promise<void> {
  for (const path of Array.isArray(paths) ? paths : [paths]) {
    const [source, ...chain] = inputChain(conn, path, config);
    // eslint-disable-next-line no-await-in-loop
    await pipeline(
      // @ts-expect-error The ... confuses the type check
      source as Readable,
      ...chain,
      handler
    );
  }
}

async function outputChain(
  outString: string,
  config: IConfig
): Promise<
  [
    ...Array<
      Writable | ((source: AsyncIterable<unknown>) => AsyncIterable<unknown>)
    >
  ]
> {
  switch (await outputType(outString, config)) {
    case IOType.Tty:
      return [
        async function* (source) {
          for await (const data of source) {
            yield highlight(`${JSON.stringify(data, undefined, 2)}\n`, {
              language: 'json',
            });
          }
        },
        process.stdout,
      ];
    case IOType.Stdout:
      return [stringify(), process.stdout];
    case IOType.File:
      return [stringify(), createWriteStream(outString)];
    case IOType.Url:
      return [
        async function* (source) {
          for await (const data of source) {
            yield request({ url: outString, data });
          }
        },
      ];
    default:
      throw new Error(`Unsupported output type: ${outString}`);
  }
}

/**
 * Handles sending data to output.
 *
 * @param file File to which to output (or `-` for stdout)
 * @todo check for non-JSON
 */
export async function output<T>(
  file: string,
  handler: () => AsyncIterable<T>,
  config: IConfig
) {
  const chain = await outputChain(file, config);

  // @ts-expect-error The ... confuses the type check
  return pipeline(handler, ...chain);
}
