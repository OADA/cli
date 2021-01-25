declare module 'concatjson' {
  import { Transform } from 'stream';

  export function parse(): Transform;
  export function serialize(): Transform;
}

/**
 * Promise based stream API in Node 15
 */
declare module 'stream/promises' {
  import { Stream, Readable, Writable } from 'stream';

  export async function finished(stream: Readable): Promise<void>;

  export async function pipeline<T>(
    streams:
      | Stream[]
      | Iterable<T>[]
      | AsyncIterable<T>[]
      | (() => Iterable<T> | AsyncIterable<T>)[]
      | AsyncGenerator<T>[]
  );
  export async function pipeline<T>(
    ...args: [
      source:
        | Stream
        | Iterable<T>
        | AsyncIterable<T>
        | (() => Iterable<T> | AsyncIterable<T> | AsyncGenerator<T>),
      ...transforms: (
        | Stream
        | ((source: AsyncIterable<T>) => AsyncIterable<T> | AsyncGenerator<T>)
      )[],
      destination:
        | Stream
        | ((
            source: AsyncIterable<T>
          ) => AsyncIterable<T> | AsyncGenerator<T> | Promise<T>)
    ]
  );
}

declare module 'json-6/lib/require' {}
declare module 'ts-node/register/transpile-only';
declare module 'hjson/lib/require-config';
