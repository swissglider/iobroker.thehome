"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statesConfigDownload = void 0;
const enumHandler_1 = __importDefault(require("../../../utils/adapterUtils/enumHandler"));
const helper_1 = __importDefault(require("../utils/helper"));
/**
 * Creates and returns an array of StateInformations with all states that contains function and/or room enums
 * @param adapter adapter Object
 * @param mandatoryEnums 0 = functions + rooms mandatory / 1 = function mandatory / 2 = rooms mandatory / 3 = rooms or functions
 * @returns
 */
const getAllStatesWithFunctionAndOrRoomEnumsAsStateInformation = async (adapter, mandatoryEnums = 3) => {
    const filteredStates = await enumHandler_1.default.getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject(adapter, mandatoryEnums);
    const stateInfos = filteredStates.map((state) => ({
        stateID: state._id,
        stateName: helper_1.default.getName(state.common.name),
        functions: state.enums
            ? Object.keys(state.enums).find((e) => e.startsWith('enum.functions.'))
            : undefined,
        rooms: state.enums
            ? Object.keys(state.enums).find((e) => e.startsWith('enum.rooms.'))
            : undefined,
        store2DB: state.native &&
            state.native.swissglider &&
            state.native.swissglider.theHome &&
            state.native.swissglider.theHome.store2DB &&
            typeof state.native.swissglider.theHome.store2DB === 'boolean'
            ? state.native.swissglider.theHome.store2DB
            : false,
    }));
    return stateInfos;
};
const statesConfigDownload = async (adapter) => {
    const states = await getAllStatesWithFunctionAndOrRoomEnumsAsStateInformation(adapter);
    const objectWIthStore2DB = await helper_1.default.getAllObjectsTheHomeParameter(adapter, 'StateInformationArray');
    console.log(objectWIthStore2DB);
    for (const obj of objectWIthStore2DB) {
        const tObj = obj;
        if (states.find((e) => e.stateID === tObj.stateID) === undefined) {
            states.push(tObj);
        }
    }
    return JSON.stringify(states, null, 2);
};
exports.statesConfigDownload = statesConfigDownload;
//# sourceMappingURL=ConfigDownloader.js.map