/**
 * Base command class to handle global flags and config stuff
 *
 * @packageDocumentation
 */

import { join } from 'path';

import { Command, flags } from '@oclif/command';
import type { Input } from '@oclif/parser';
import type { SetRequired } from 'type-fest';
import objectAssignDeep from 'object-assign-deep';
import findUp from 'find-up';
// Load .env files?
import { config } from 'dotenv';

import type { OADAClient } from '@oada/client';

config();

/**
 * Type of flags from BaseCommand class
 */
type BaseFlags = typeof BaseCommand extends Input<infer F> ? F : never;

/**
 * Global config stuff
 */
export interface Config<D extends DomainConfig = DomainConfig>
  extends Partial<BaseFlags> {
  domains?: {
    [name: string]: D;
  };
}

/**
 * Internal Config type, with defaults filled out
 *
 * @see Config
 */
export interface IConfig
  extends Required<Config<SetRequired<DomainConfig, 'domain'>>> {}

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
const defaults = <const>{
  /**
   * dev token from oada-srvc-docker
   */
  token: 'god',
  /**
   * assume a local OADA
   */
  domain: 'localhost',
  domains: { localhost: { token: 'god' } },
};

/**
 * Fill out config defaults
 */
function handleDefaults({
  domains,
  ...rest
}: Config & BaseFlags & typeof defaults): IConfig {
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
        .reduce((o1, o2) => objectAssignDeep(o1, o2), {}),
    },
  };
}

/**
 * Try to load user config from file(s) and merge them
 */
async function loadUserConfig(
  paths: readonly string[]
): Promise<Partial<Config>> {
  const config = {};
  for (const path of paths) {
    try {
      const { default: userConfig } = await import(path);
      objectAssignDeep(config, userConfig);
    } catch {}
  }

  return config;
}

/**
 * Base command class for global flags and user config
 */
export default abstract class BaseCommand extends Command {
  /**
   * Global CLI flags
   */
  static flags = {
    /**
     * Default OADA API domain
     */
    domain: flags.string({
      description: 'default OADA API domain',
      default: process.env.OADA_DOMAIN,
    }),
    /**
     * Default OADA API token
     */
    token: flags.string({
      description: 'default OADA API token',
      default: process.env.OADA_TOKEN,
    }),
    tty: flags.boolean({
      description: 'format output for TTY',
      allowNo: true,
      default: process.stdout.isTTY,
    }),
    ws: flags.boolean({
      description: 'use WebSockets for OADA API',
      allowNo: true,
      default: true,
    }),
  };

  static strict = false;

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

  async init() {
    this.configFiles = [join(this.config.configDir, 'config')].concat(
      (await findUp('.clioada')) || []
    );
    const userConfig = await loadUserConfig(this.configFiles);
    const { flags } = this.parse(BaseCommand);

    // Merge config sources
    const config = objectAssignDeep(defaults, userConfig as Config, flags);

    this.iconfig = handleDefaults(config);
  }
}
