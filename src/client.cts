/**
 * @license
 * Copyright (c) 2022 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/* eslint-disable import/export */

// @ts-expect-error
// eslint-disable-next-line import/no-namespace
import type * as client from '@oada/client';

export const connect: typeof client.connect = async (...parameters) => {
  const oada = await import('@oada/client');
  return oada.connect(...parameters);
};

// @ts-expect-error
export type * from '@oada/client';
