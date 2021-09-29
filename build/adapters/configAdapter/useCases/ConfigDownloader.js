"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statesConfigDownload = void 0;
const enumHandler_1 = __importDefault(require("../../../utils/adapterUtils/enumHandler"));
const influxDBHelper_1 = __importDefault(require("../../../utils/adapterUtils/influxDBHelper"));
const nameHelper_1 = __importDefault(require("../../../utils/adapterUtils/nameHelper"));
/**
 * Creates and returns an array of StateInformations with all states that contains function and/or room enums
 * @param adapter adapter Object
 * @param mandatoryEnums 0 = functions + rooms mandatory / 1 = function mandatory / 2 = rooms mandatory / 3 = rooms or functions
 * @returns
 */
const getAllStatesWithFunctionAndOrRoomEnumsAsStateInformation = async (adapter, mandatoryEnums = 3) => {
    const filteredStates = await enumHandler_1.default.getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject(adapter, mandatoryEnums);
    const influxName = await influxDBHelper_1.default.getInfluxInstanceName(adapter);
    const stateInfos = filteredStates.map((state) => {
        var _a, _b, _c, _d;
        return ({
            stateID: state._id,
            stateName: nameHelper_1.default.getName(state.common.name, (_b = (_a = adapter.systemConfig) === null || _a === void 0 ? void 0 : _a.language) !== null && _b !== void 0 ? _b : 'de'),
            functions: state.enums
                ? Object.keys(state.enums).find((e) => e.startsWith('enum.functions.'))
                : undefined,
            rooms: state.enums
                ? Object.keys(state.enums).find((e) => e.startsWith('enum.rooms.'))
                : undefined,
            store2DB: (_d = (state.common.custom && ((_c = state.common.custom[influxName]) === null || _c === void 0 ? void 0 : _c.enabled) === true)) !== null && _d !== void 0 ? _d : false,
        });
    });
    return stateInfos;
};
const statesConfigDownload = async (adapter) => {
    const states = await getAllStatesWithFunctionAndOrRoomEnumsAsStateInformation(adapter);
    return JSON.stringify(states, null, 2);
};
exports.statesConfigDownload = statesConfigDownload;
//# sourceMappingURL=ConfigDownloader.js.map