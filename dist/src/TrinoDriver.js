"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrinoDriver = void 0;
const PrestoDriver_1 = require("./PrestoDriver");
const PrestodbQuery_1 = require("@cubejs-backend/schema-compiler/dist/src/adapter/PrestodbQuery");
class TrinoDriver extends PrestoDriver_1.PrestoDriver {
    constructor(options) {
        super({ ...options, engine: "trino" });
    }
    static dialectClass() {
        return PrestodbQuery_1.PrestodbQuery;
    }
}
exports.TrinoDriver = TrinoDriver;
//# sourceMappingURL=TrinoDriver.js.map