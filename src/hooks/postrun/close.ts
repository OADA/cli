import type { Hook } from '@oclif/config';

/**
 * Close connections after command so cli doesn't hang
 *
 * @todo actually clean up things?
 */
export const hook: Hook<'postrun'> = async function close() {
  this.exit();
};
export default hook;
