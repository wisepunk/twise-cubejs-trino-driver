/**
 * @copyright Cube Dev, Inc.
 * @license Apache-2.0
 * @fileoverview The `PrestoDriver` and related types declaration.
 */
/// <reference types="node" />
import { DownloadQueryResultsOptions, DownloadQueryResultsResult, DriverCapabilities, DriverInterface, StreamOptions, StreamTableData, TableStructure, BaseDriver } from '@cubejs-backend/base-driver';
import type { ConnectionOptions as TLSConnectionOptions } from 'tls';
export type PrestoDriverConfiguration = {
    host?: string;
    port?: string;
    catalog?: string;
    schema?: string;
    user?: string;
    basic_auth?: {
        user: string;
        password: string;
    };
    ssl?: string | TLSConnectionOptions;
    dataSource?: string;
    queryTimeout?: number;
};
/**
 * Presto driver class.
 */
export declare class PrestoDriver extends BaseDriver implements DriverInterface {
    /**
     * Returns default concurrency value.
     */
    static getDefaultConcurrency(): number;
    private config;
    private catalog;
    private client;
    /**
     * Class constructor.
     */
    constructor(config?: PrestoDriverConfiguration);
    testConnection(): Promise<void>;
    query(query: string, values: unknown[]): Promise<any[]>;
    prepareQueryWithParams(query: string, values: unknown[]): string;
    queryPromised(query: string, streaming: boolean): Promise<any[] | StreamTableData>;
    downloadQueryResults(query: string, values: unknown[], options: DownloadQueryResultsOptions): Promise<DownloadQueryResultsResult>;
    informationSchemaQuery(): string;
    normalizeResultOverColumns(data: any[], columns: TableStructure): {
        [x: string]: unknown;
    }[];
    stream(query: string, values: unknown[], _options: StreamOptions): Promise<StreamTableData>;
    capabilities(): DriverCapabilities;
}
//# sourceMappingURL=PrestoDriver.d.ts.map