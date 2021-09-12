"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const influxDBHandlerAdapter_1 = __importDefault(require("../influxDBHandlerAdapter"));
const handleInfluxDBReset = async (adapter, stateObject) => {
    // reset Influx TimeSeries to org Statename on InfluxDB
    await influxDBHandlerAdapter_1.default.resetInfluxTimeSeries(adapter, stateObject);
    // delete custom InfluxDBAdapter entry
    await influxDBHandlerAdapter_1.default.deletCustomInfluxDBAdapterEntries(adapter, stateObject);
    return;
};
const handleInfluxDBNewConfiguration = async (adapter, stateConfig) => {
    adapter;
    stateConfig;
    // change alias on InfluxDBAdapter custom
    await influxDBHandlerAdapter_1.default.changeInfluxDBAdapterCustomAliasEntry(adapter, stateConfig);
    // change TimeSeries State Name on InfluxDB
    await influxDBHandlerAdapter_1.default.changeInfluxTimeSeries(adapter, stateConfig);
    // set enable on InfluxDBAdapter custom
    await influxDBHandlerAdapter_1.default.setInfluxDBAdapterCustomEnableEntry(adapter, stateConfig);
    return;
};
const removeAllRoomFunctionEnums_SubFunctions = {
    handleInfluxDBReset: handleInfluxDBReset,
    handleInfluxDBNewConfiguration: handleInfluxDBNewConfiguration,
};
exports.default = removeAllRoomFunctionEnums_SubFunctions;
//# sourceMappingURL=removeAllRoomFunctionEnums_SubFunctions.js.map