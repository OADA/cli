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

/**
 * Promise based stream API in Node 15
 */
/*
declare module 'stream/promises' {
  export async function finished(stream: Readable): Promise<void>;

  export async function pipeline<T>(
    streams:
      | Stream[]
      | Array<Iterable<T>>
      | Array<AsyncIterable<T>>
      | Array<() => Iterable<T> | AsyncIterable<T>>
      | Array<AsyncGenerator<T>>
  );
  export async function pipeline<T>(
    ...parameters: [
      source:
        | Stream
        | Iterable<T>
        | AsyncIterable<T>
        | (() => Iterable<T> | AsyncIterable<T> | AsyncGenerator<T>),
      ...transforms: Array<
        | Stream
        | ((source: AsyncIterable<T>) => AsyncIterable<T> | AsyncGenerator<T>)
      >,
      destination:
        | Stream
        | ((
            source: AsyncIterable<T>
          ) => AsyncIterable<T> | AsyncGenerator<T> | Promise<T>)
    ]
  );
}
*/

declare module 'json-6/lib/require' {}
declare module 'ts-node/register/transpile-only';
declare module 'hjson/lib/require-config';
