import { PrestoDriver } from "./PrestoDriver";
import { PrestodbQuery } from "@cubejs-backend/schema-compiler/dist/src/adapter/PrestodbQuery";
export declare class TrinoDriver extends PrestoDriver {
    constructor(options: any);
    static dialectClass(): typeof PrestodbQuery;
}
//# sourceMappingURL=TrinoDriver.d.ts.map