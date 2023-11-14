"use strict";
/**
 * @copyright Cube Dev, Inc.
 * @license Apache-2.0
 * @fileoverview The `PrestoDriver` and related types declaration.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrestoDriver = void 0;
const base_driver_1 = require("@cubejs-backend/base-driver");
const shared_1 = require("@cubejs-backend/shared");
const stream_1 = require("stream");
const ramda_1 = require("ramda");
const sqlstring_1 = __importDefault(require("sqlstring"));
const presto = require('presto-client');
/**
 * Presto driver class.
 */
class PrestoDriver extends base_driver_1.BaseDriver {
    /**
     * Returns default concurrency value.
     */
    static getDefaultConcurrency() {
        return 2;
    }
    /**
     * Class constructor.
     */
    constructor(config = {}) {
        super();
        const dataSource = config.dataSource ||
            (0, shared_1.assertDataSource)('default');
        this.config = {
            host: (0, shared_1.getEnv)('dbHost', { dataSource }),
            port: (0, shared_1.getEnv)('dbPort', { dataSource }),
            catalog: (0, shared_1.getEnv)('prestoCatalog', { dataSource }) ||
                (0, shared_1.getEnv)('dbCatalog', { dataSource }),
            schema: (0, shared_1.getEnv)('dbName', { dataSource }) ||
                (0, shared_1.getEnv)('dbSchema', { dataSource }),
            user: (0, shared_1.getEnv)('dbUser', { dataSource }),
            basic_auth: (0, shared_1.getEnv)('dbPass', { dataSource })
                ? {
                    user: (0, shared_1.getEnv)('dbUser', { dataSource }),
                    password: (0, shared_1.getEnv)('dbPass', { dataSource }),
                }
                : undefined,
            ssl: this.getSslOptions(dataSource),
            ...config
        };
        this.catalog = this.config.catalog;
        this.client = new presto.Client(this.config);
    }
    testConnection() {
        const query = sqlstring_1.default.format('show catalogs like ?', [`%${this.catalog}%`]);
        return this.queryPromised(query, false)
            .then(catalogs => {
            if (catalogs.length === 0) {
                throw new Error(`Catalog not found '${this.catalog}'`);
            }
        });
    }
    query(query, values) {
        return this.queryPromised(this.prepareQueryWithParams(query, values), false);
    }
    prepareQueryWithParams(query, values) {
        return sqlstring_1.default.format(query, (values || []).map(value => (typeof value === 'string' ? {
            toSqlString: () => sqlstring_1.default.escape(value).replace(/\\\\([_%])/g, '\\$1'),
        } : value)));
    }
    queryPromised(query, streaming) {
        const toError = (error) => new Error(error.error ? `${error.message}\n${error.error}` : error.message);
        if (streaming) {
            const rowStream = new stream_1.Transform({
                writableObjectMode: true,
                readableObjectMode: true,
                transform(obj, encoding, callback) {
                    callback(null, obj);
                }
            });
            return new Promise((resolve, reject) => {
                this.client.execute({
                    query,
                    schema: this.config.schema || 'default',
                    session: this.config.queryTimeout ? `query_max_run_time=${this.config.queryTimeout}s` : undefined,
                    columns: (error, columns) => {
                        resolve({
                            rowStream,
                            types: columns
                        });
                    },
                    data: (error, data, columns) => {
                        const normalData = this.normalizeResultOverColumns(data, columns);
                        for (const obj of normalData) {
                            rowStream.write(obj);
                        }
                    },
                    success: () => {
                        rowStream.end();
                    },
                    error: (error) => {
                        reject(toError(error));
                    }
                });
            });
        }
        else {
            return new Promise((resolve, reject) => {
                let fullData = [];
                this.client.execute({
                    query,
                    schema: this.config.schema || 'default',
                    data: (error, data, columns) => {
                        const normalData = this.normalizeResultOverColumns(data, columns);
                        fullData = (0, ramda_1.concat)(normalData, fullData);
                    },
                    success: () => {
                        resolve(fullData);
                    },
                    error: (error) => {
                        reject(toError(error));
                    }
                });
            });
        }
    }
    downloadQueryResults(query, values, options) {
        if (options.streamImport) {
            return this.stream(query, values, options);
        }
        return super.downloadQueryResults(query, values, options);
    }
    informationSchemaQuery() {
        if (this.config.schema) {
            return `${super.informationSchemaQuery()} AND columns.table_schema = '${this.config.schema}'`;
        }
        return super.informationSchemaQuery();
    }
    normalizeResultOverColumns(data, columns) {
        const columnNames = (0, ramda_1.map)((0, ramda_1.prop)('name'), columns || []);
        const arrayToObject = (0, ramda_1.zipObj)(columnNames);
        return (0, ramda_1.map)(arrayToObject, data || []);
    }
    stream(query, values, _options) {
        const queryWithParams = this.prepareQueryWithParams(query, values);
        return this.queryPromised(queryWithParams, true);
    }
    capabilities() {
        return {
            unloadWithoutTempTable: true
        };
    }
}
exports.PrestoDriver = PrestoDriver;
//# sourceMappingURL=PrestoDriver.js.map