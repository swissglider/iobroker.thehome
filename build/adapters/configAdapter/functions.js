"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const E = __importStar(require("fp-ts/Either"));
const adapterUtils_1 = __importDefault(require("../../utils/adapterUtils"));
const I_StateInformation_1 = require("../../utils/adapterUtils/I_StateInformation");
const removeAllRoomFunctionEnums_SubFunctions_1 = __importDefault(require("./removeAllRoomFunctionEnums_SubFunctions"));
const statesConfigDownload = async (adapter) => {
    const states = await adapterUtils_1.default.getAllStatesWithFunctionAndOrRoomEnumsAsStateInformation(adapter);
    return JSON.stringify(states, null, 2);
};
const statesConfigUpload = async (adapter, config) => {
    // check config
    const decodedConfig = I_StateInformation_1.stateInformations.decode(config);
    if (E.isLeft(decodedConfig))
        return 'Wrong configuration, please check the file !';
    // stop all services
    try {
        await adapterUtils_1.default.stopAllServices(adapter);
    }
    catch (error) {
        return `unknown error while stopping all services: ${error}`;
    }
    // get all State Objects with Room or/and Function enums
    let stateObjects;
    try {
        stateObjects = await adapterUtils_1.default.getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject(adapter);
    }
    catch (error) {
        return `unknown error while getting all the states: ${error}`;
    }
    // resetting all states
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
        await adapterUtils_1.default.restartAllServices(adapter);
    }
    catch (error) {
        return `unknown error while starting all services: ${error}`;
    }
    return 'ok';
};
const singleStateConfigUpload = async (adapter, stateConfig) => {
    // remove State from all Services
    try {
        await adapterUtils_1.default.removeStateFromAllServices(adapter, stateConfig);
    }
    catch (error) {
        return `unknown error while removing state from all services: ${error}`;
    }
    // get all State Object with  enums
    try {
        const stateObjects = await adapter.getForeignObjectsAsync(stateConfig.stateID, 'state', ['rooms', 'functions']);
        const stateObject = Object.values(stateObjects)[0];
        if (stateObject) {
            // resetting state
            try {
                await Promise.all([
                    removeAllRoomFunctionEnums_SubFunctions_1.default.handleInfluxDBReset(adapter, stateObject),
                    removeAllRoomFunctionEnums_SubFunctions_1.default.removeAllRoomFunctionEnums(adapter, stateObject),
                ]);
            }
            catch (error) {
                return `unknown error while removing or reset state: ${error}`;
            }
        }
    }
    catch (error) {
        return `unknown error while getting all the states: ${error}`;
    }
    //set new Config
    try {
        await Promise.all([
            removeAllRoomFunctionEnums_SubFunctions_1.default.addStateToEnums(adapter, stateConfig),
            removeAllRoomFunctionEnums_SubFunctions_1.default.changeStateName(adapter, stateConfig),
            removeAllRoomFunctionEnums_SubFunctions_1.default.handleInfluxDBNewConfiguration(adapter, stateConfig),
        ]);
    }
    catch (error) {
        return `unknown error while setting new config: ${error}`;
    }
    // add state to all services
    try {
        await adapterUtils_1.default.addStateToAllServices(adapter, stateConfig);
    }
    catch (error) {
        return `unknown error while adding state to all services: ${error}`;
    }
    return 'ok';
};
const ConfigAdapterFunctions = {
    statesConfigDownload: statesConfigDownload,
    statesConfigUpload: statesConfigUpload,
    singleStateConfigUpload: singleStateConfigUpload,
};
exports.default = ConfigAdapterFunctions;
//# sourceMappingURL=functions.js.map