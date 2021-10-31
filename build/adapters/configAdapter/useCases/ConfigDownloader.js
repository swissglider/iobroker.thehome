"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statesConfigDownload = void 0;
const configChangeListener_1 = __importDefault(require("../../../listener/configChangeListener"));
const adapterUtilsFunctions_1 = __importDefault(require("../../../utils/adapterUtils/adapterUtilsFunctions"));
const enumHandler_1 = __importDefault(require("../../../utils/adapterUtils/enumHandler"));
const nameHelper_1 = __importDefault(require("../../../utils/adapterUtils/nameHelper"));
const getStateInfo = (adapter, obj, influxName) => {
    var _a, _b, _c, _d, _e, _f;
    return {
        stateID: obj._id,
        stateName: nameHelper_1.default.getName((_b = (_a = obj.common) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '', (_d = (_c = adapter.systemConfig) === null || _c === void 0 ? void 0 : _c.language) !== null && _d !== void 0 ? _d : 'de'),
        functions: obj.enums ? Object.keys(obj.enums).find((e) => e.startsWith('enum.functions.')) : undefined,
        rooms: obj.enums ? Object.keys(obj.enums).find((e) => e.startsWith('enum.rooms.')) : undefined,
        store2DB: (_f = (obj.common.custom && ((_e = obj.common.custom[influxName]) === null || _e === void 0 ? void 0 : _e.enabled) === true)) !== null && _f !== void 0 ? _f : false,
    };
};
/**
 * Creates and returns an array of StateInformations with all states that contains function and/or room enums
 * @param adapter adapter Object
 * @param mandatoryEnums 0 = functions + rooms mandatory / 1 = function mandatory / 2 = rooms mandatory / 3 = rooms or functions
 * @returns
 */
const getAllStatesWithFunctionAndOrRoomEnumsAsStateInformation = async (adapter, mandatoryEnums = 3) => {
    try {
        const filteredObj = await enumHandler_1.default.getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject(adapter, mandatoryEnums);
        const influxName = await adapterUtilsFunctions_1.default.getAdapterPath(adapter, 'influxdb');
        const stateInfos = filteredObj.map((obj) => getStateInfo(adapter, obj, influxName));
        const changedNameObjIDs = configChangeListener_1.default.getObjectIDsWithChangedNames();
        const tmpAlreadyAddedStateIDs = stateInfos.map((e) => e.stateID);
        for (const objID of changedNameObjIDs) {
            if (!tmpAlreadyAddedStateIDs.includes(objID)) {
                const tmpObj = await adapter.getForeignObjectAsync(objID);
                if (tmpObj) {
                    stateInfos.push(getStateInfo(adapter, tmpObj, influxName));
                }
            }
        }
        return stateInfos;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
};
const statesConfigDownload = async (adapter) => {
    const states = await getAllStatesWithFunctionAndOrRoomEnumsAsStateInformation(adapter);
    return JSON.stringify(states, null, 2);
};
exports.statesConfigDownload = statesConfigDownload;
//# sourceMappingURL=ConfigDownloader.js.map