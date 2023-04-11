/**
 * @license
 * Copyright (c) 2021 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/**
 * Manages the connection(s) to OADA API(s)
 *
 * @packageDocumentation
 */

import { URL } from 'node:url';

import {
  type GETRequest,
  type OADAClient,
  type PUTRequest,
  connect,
} from '@oada/client';

import type { IConfig } from './BaseCommand.js';

type Connections = {
  /**
   * Default OADA connection
   *
   * Used when no OADA host is specified (e.g., GET /bookmarks)
   */
  connection?: Promise<OADAClient>;
  domains: Map<string, Promise<OADAClient>>;
};

// Wrap OADAClient with magics
const methods = ['get', 'head', 'put', 'post', 'delete'] as const;
export function conn(config: IConfig): OADAClient {
  const connections: Connections = {
    // Init default connection
    // connection: connect({ domain, token, connection: ws ? 'ws' : 'http' }),
    domains: new Map(),
  };

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const client = {} as OADAClient;
  for (const method of methods) {
    // TODO: Make this less gross?
    // eslint-disable-next-line security/detect-object-injection
    client[method] = async ({ path: p, ...rest }: GETRequest | PUTRequest) => {
      let path = `${p}`;
      let host;
      try {
        ({ host, pathname: path } = new URL(p));
      } finally {
        const con = await getConnection(host);
        // eslint-disable-next-line no-unsafe-finally, security/detect-object-injection
        return con[method](
          // @ts-expect-error stuff
          {
            path,
            ...rest,
          }
        );
      }
    };
  }

  client.watch = async ({ path: p, ...rest }) => {
    let path = `${p}`;
    let host;
    try {
      ({ host, pathname: path } = new URL(p));
    } finally {
      const con = await getConnection(host);
      // eslint-disable-next-line no-unsafe-finally
      return con.watch(
        // @ts-expect-error the deprecated v2 API screws up the types
        {
          path,
          ...rest,
        }
      );
    }
  };

  return client;

  async function getConnection(name?: string): Promise<OADAClient> {
    if (!name) {
      // Use default OADA connection
      if (!connections.connection) {
        const { domain, token, ws } = config;
        connections.connection = connect({
          domain,
          token,
          connection: ws ? 'ws' : 'http',
        });
      }

      return connections.connection;
    }

    const { domains } = connections;
    if (domains.has(name)) {
      // Reuse connection for this domain
      return domains.get(name)!;
    }

    const {
      // TODO: config ws per file??
      ws,
      domains: {
        // eslint-disable-next-line unicorn/no-useless-undefined
        [name]: { domain = '', token = '', connection = undefined } = {},
      },
    } = config;

    // Allow passing connection through config?
    if (connection) {
      const con = Promise.resolve(connection);
      domains.set(name, con);
      return con;
    }

    // Create connection for this domain
    const con = connect({
      domain,
      token,
      connection: ws ? 'ws' : 'http',
    });
    domains.set(name, con);
    return con;
  }
}

export default conn;
