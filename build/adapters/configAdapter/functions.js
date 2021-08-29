"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adapterUtils_1 = __importDefault(require("../../utils/adapterUtils"));
const removeAllRoomFunctionEnums_SubFunctions_1 = __importDefault(require("./removeAllRoomFunctionEnums_SubFunctions"));
const configDownload = async (adapter) => {
    const states = await adapterUtils_1.default.getAllStatesWithFunctionAndOrRoomEnumsAsStateInformation(adapter);
    return JSON.stringify(states, null, 2);
};
const configUpload = async (adapter, config) => {
    // stop all services
    try {
        await adapterUtils_1.default.stopAllServices();
    }
    catch (error) {
        return `unknown error while stopping all services: ${error}`;
    }
    // get all States with Room or/and Function enums
    let stateObjects;
    try {
        stateObjects = await adapterUtils_1.default.getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject(adapter);
    }
    catch (error) {
        return `unknown error while getting all the states: ${error}`;
    }
    // reseting all states
    try {
        //read next config state
        for (const stateObject of stateObjects) {
            await Promise.all([
                removeAllRoomFunctionEnums_SubFunctions_1.default.handleInfluxDBReset(adapter, stateObject),
                removeAllRoomFunctionEnums_SubFunctions_1.default.removeAllRoomFunctionEnums(adapter, stateObject),
            ]);
        }
    }
    catch (error) {
        return `unknown error while removing or reset states: ${error}`;
    }
    // set new Config
    try {
        for (const stateConfig of config) {
            await Promise.all([
                removeAllRoomFunctionEnums_SubFunctions_1.default.addStateToEnums(adapter, stateConfig),
                removeAllRoomFunctionEnums_SubFunctions_1.default.changeStateName(adapter, stateConfig),
                removeAllRoomFunctionEnums_SubFunctions_1.default.handleInfluxDBNewConfiguration(adapter, stateConfig),
            ]);
        }
    }
    catch (error) {
        return `unknown error while setting new config: ${error}`;
    }
    // restart all services
    try {
        await adapterUtils_1.default.restartAllServices();
    }
    catch (error) {
        return `unknown error while stopping all services: ${error}`;
    }
    return 'ok';
};
const ConfigAdapterFunctions = {
    configDownload: configDownload,
    configUpload: configUpload,
};
exports.default = ConfigAdapterFunctions;
//# sourceMappingURL=functions.js.map