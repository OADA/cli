/**
 * @license
 * Copyright (c) 2021 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/**
 * Base command class to handle global flags and config stuff
 *
 * @packageDocumentation
 */

import { join } from 'node:path';

import 'dotenv/config';
import { Command, Flags } from '@oclif/core';
import { findUp } from 'find-up';
import objectAssignDeep from 'object-assign-deep';
import type { SetRequired } from 'type-fest';

import type { OADAClient } from '@oada/client';

import { importable } from './io.js';

/**
 * Global config stuff
 */
export interface Config<D extends DomainConfig = DomainConfig> {
  domains?: Record<string, D>;
  domain?: string;
  token?: string;
  tty?: boolean;
  ws?: boolean;
}

/**
 * Internal Config type, with defaults filled out
 *
 * @see Config
 */
export type IConfig = Record<string, unknown> &
  Required<Config<SetRequired<DomainConfig, 'domain'>>>;

/**
 * Config per OADA domain
 */
interface DomainConfig {
  /**
   * OADA API token
   */
  token: string;
  /**
   * OADA domain
   */
  domain?: string;
  /**
   * Allow passing in an OADAClient?
   */
  connection?: Promise<OADAClient>;
}

/**
 * Defaults for settings
 */
const defaults = {
  /**
   * Dev token from oada/server
   */
  token: 'god',
  /**
   * Assume a local OADA
   */
  domain: 'localhost',
  domains: { localhost: { token: 'god', domain: undefined } },
};

/**
 * Fill out config defaults
 */
function handleDefaults({
  domains,
  ...rest
}: Config & typeof defaults): IConfig {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    ...rest,
    domains: {
      ...Object.entries(domains)
        .map(([name, { token, domain = name }]) => {
          const config = { token, domain };
          return {
            [name]: config,
            [domain]: config,
          };
        })
        // eslint-disable-next-line unicorn/no-array-reduce
        .reduce((o1, o2) => objectAssignDeep(o1, o2), {}),
    },
  } as IConfig;
}

/**
 * Try to load user config from file(s) and merge them
 */
async function loadUserConfig(
  paths: readonly string[]
): Promise<Partial<Config>> {
  const config = {};
  for await (const path of paths) {
    try {
      const { default: userConfig } = (await import(path)) as {
        default: unknown;
      };
      objectAssignDeep(config, userConfig);
    } catch {}
  }

  return config;
}

/**
 * List of supported filetypes for config files
 */
export const configTypes = ['.json', ...importable] as const;

/**
 * Base command class for global flags and user config
 */
export default abstract class BaseCommand extends Command {
  static override description: string;
  /**
   * Global CLI flags
   */
  static override baseFlags = {
    /**
     * Default OADA API domain
     */
    domain: Flags.string({
      description: 'default OADA API domain',
      char: 'd',
      default: process.env.OADA_DOMAIN,
    }),
    /**
     * Default OADA API token
     */
    token: Flags.string({
      description: 'default OADA API token',
      char: 't',
      default: process.env.OADA_TOKEN,
    }),
    tty: Flags.boolean({
      description: 'format output for TTY',
      allowNo: true,
      default: process.stdout.isTTY,
    }),
    ws: Flags.boolean({
      description: 'use WebSockets for OADA API',
      allowNo: true,
      default: false,
    }),
  };

  static override flags = {};

  static override strict = false;

  /**
   * Somewhere to store config?
   *
   * @todo this is gross, refactor
   */
  iconfig!: IConfig;
  /**
   * Loaded config files
   */
  configFiles!: readonly string[];

  override async init() {
    this.configFiles = [join(this.config.configDir, 'config')].concat(
      (await findUp(configTypes.map((extension) => `.oadacli${extension}`))) ??
        []
    );
    const userConfig = await loadUserConfig(this.configFiles);
    const { flags: fFlags } = await this.parse(BaseCommand);

    // Merge config sources
    // TODO: clean up this mess
    const config = objectAssignDeep(defaults, userConfig, fFlags);
    if (fFlags.domain) {
      const { domain = config.domain, token = config.token } =
        config.domains[fFlags.domain] ?? {};
      config.domain = domain;
      if (!fFlags.token) {
        config.token = token;
      }
    }

    this.iconfig = handleDefaults(config);
  }
}
