"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adapterUtils_1 = __importDefault(require("../../utils/adapterUtils"));
const influxDBHandlerAdapter_1 = __importDefault(require("../influxDBHandlerAdapter"));
const handleInfluxDBReset = async (adapter, stateObject) => {
    // reset Influx TimeSeries to org Statename on InfluxDB
    await influxDBHandlerAdapter_1.default.resetInfluxTimeSeries(adapter, stateObject);
    // delete custom InfluxDBAdapter entry
    await influxDBHandlerAdapter_1.default.deletCustomInfluxDBAdapterEntries(adapter, stateObject);
    return;
};
const removeAllRoomFunctionEnums = async (adapter, stateObject) => {
    if (stateObject.enums) {
        for (const enumID of Object.keys(stateObject.enums)) {
            // await adapter.deleteStateFromEnumAsync(enumID, '', '', stateObject._id);
            if (enumID.startsWith('enum.rooms.') || enumID.startsWith('enum.functions.')) {
                const en = await adapter.getForeignObjectAsync(enumID, 'enum');
                if (en && en.common.members) {
                    const members = en.common.members.filter((e) => e !== stateObject._id);
                    en.common.members = members;
                    await adapter.setForeignObjectAsync(enumID, en);
                }
            }
        }
    }
    return;
};
const addStateToEnums = async (adapter, stateConfig) => {
    const addStateIDToEnum = async (_adapter, enumID, stateID) => {
        const en = await _adapter.getForeignObjectAsync(enumID, 'enum');
        if (en && en.common.members && !en.common.members.includes(stateID)) {
            en.common.members.push(stateID);
            await _adapter.setForeignObjectAsync(enumID, en);
        }
    };
    if (stateConfig.stateID && stateConfig.functions) {
        // check and create if needed new enum
        await adapterUtils_1.default.chechAndCreateIfNeededNewEnum(adapter, stateConfig.functions);
        // add state to function enum from config
        await addStateIDToEnum(adapter, stateConfig.functions, stateConfig.stateID);
    }
    if (stateConfig.stateID && stateConfig.rooms) {
        // check and create if needed new enum
        await adapterUtils_1.default.chechAndCreateIfNeededNewEnum(adapter, stateConfig.rooms);
        // add state to room enum from config
        await addStateIDToEnum(adapter, stateConfig.rooms, stateConfig.stateID);
    }
};
const changeStateName = async (adapter, stateConfig) => {
    if (stateConfig.stateID && stateConfig.stateName) {
        // change state name
        const en = await adapter.getForeignObjectAsync(stateConfig.stateID, 'state');
        if (en) {
            en.common.name = stateConfig.stateName;
            await adapter.setForeignObjectAsync(stateConfig.stateID, en);
        }
    }
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
    removeAllRoomFunctionEnums: removeAllRoomFunctionEnums,
    handleInfluxDBReset: handleInfluxDBReset,
    addStateToEnums: addStateToEnums,
    changeStateName: changeStateName,
    handleInfluxDBNewConfiguration: handleInfluxDBNewConfiguration,
};
exports.default = removeAllRoomFunctionEnums_SubFunctions;
//# sourceMappingURL=removeAllRoomFunctionEnums_SubFunctions.js.map