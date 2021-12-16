/**
 * @license
 * Copyright (c) 2021 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/**
 * @license
 * Copyright (c) 2021 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import type { Hook } from '@oclif/config';

/**
 * Close connections after command so cli doesn't hang
 *
 * @todo actually clean up things?
 */
// eslint-disable-next-line func-style
export const hook: Hook<'postrun'> = async function (this) {
  this.exit();
};

export default hook;
