/**
 * Manages the connection(s) to OADA API(s)
 *
 * @packageDocumentation
 */

import { URL } from 'url';

import { OADAClient, connect } from '@oada/client';

import type { IConfig } from './BaseCommand';

interface Connections {
  /**
   * Default OADA connection
   *
   * Used when no OADA host is specified (e.g., GET /bookmarks)
   */
  connection?: Promise<OADAClient>;
  domains: {
    [name: string]: Promise<OADAClient>;
  };
}

// Wrap OADAClient with magics
const methods = <const>['get', 'head', 'put', 'post', 'delete'];
export function conn(config: IConfig): OADAClient {
  const connections: Connections = {
    // Init default connection
    //connection: connect({ domain, token, connection: ws ? 'ws' : 'http' }),
    domains: {},
  };

  const conn = {} as OADAClient;
  for (const method of methods) {
    // TODO: Make this less gross?
    conn[method] = async ({ path: p, ...rest }: any) => {
      let path = p;
      let host;
      try {
        ({ host, pathname: path } = new URL(p));
      } finally {
        return (await getConnection(host))[method]({ path, ...rest });
      }
    };
  }
  conn.watch = async ({ path: p, ...rest }: any) => {
    let path = p;
    let host;
    try {
      ({ host, pathname: path } = new URL(p));
    } finally {
      return (await getConnection(host)).watch({ path, ...rest });
    }
  };
  return conn;

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
    if (name in domains) {
      // Reuse connection for this domain
      return domains[name]!;
    }

    const {
      // TODO: config ws per file??
      ws,
      domains: {
        [name]: { domain = '', token = '', connection = undefined } = {},
      },
    } = config;

    // Allow passing connection through config?
    if (connection) {
      return (domains[name] = Promise.resolve(connection));
    }

    // Create connection for this domain
    return (domains[name] = connect({
      domain,
      token,
      connection: ws ? 'ws' : 'http',
    }));
  }
}

export default conn;
