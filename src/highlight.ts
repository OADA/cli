/**
 * Functions for highlighting stuff for TTY output
 *
 * @packageDocumentation
 */

import highlight from 'cli-highlight';

export default highlight;

/**
 * Languages we support highlighting
 */
export const languages = <const>['json', 'shell'];

/**
 * @todo better way to achieve this??
 */
const [json, shell] = languages.map(
  (language) =>
    function (strings: readonly string[]): string {
      return strings.map((s) => highlight(s, { language })).join();
    }
);

export { json, shell };
