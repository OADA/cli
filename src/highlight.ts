/**
 * @license
 * Copyright (c) 2021 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/**
 * Functions for highlighting stuff for TTY output
 *
 * @packageDocumentation
 */

import { highlight } from 'cli-highlight';

/**
 * Languages we support highlighting
 */
export const languages = ['json', 'shell'] as const;

/**
 * @todo better way to achieve this??
 */
function hi(language: string) {
  return function (strings: readonly string[]): string {
    return strings.map((s) => highlight(s, { language })).join(',');
  };
}

export const json = hi('json');

export const shell = hi('shell');

export { default } from 'cli-highlight';
