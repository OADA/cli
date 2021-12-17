#!/usr/bin/env node
/**
 * @license
 * Copyright (c) 2021 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/* eslint-disable import/no-commonjs */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable github/no-then */

require('@oclif/command')
  .run()
  .then(require('@oclif/command/flush'))
  .catch(require('@oclif/errors/handle'));
