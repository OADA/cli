/**
 * @license
 * Copyright (c) 2021 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

declare module 'concatjson' {
  import { Readable, Stream, Transform, Writable } from 'node:stream';

  export function parse(): Transform;
  export function serialize(): Transform;
}

declare module 'json-6/lib/require' {}
declare module 'ts-node/register/transpile-only';
declare module 'hjson/lib/require-config';
