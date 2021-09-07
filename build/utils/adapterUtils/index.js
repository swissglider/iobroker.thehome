"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Creates and returns an array of ioBroker.Objects with all states that contains function and/or room enums
 * @param adapter adapter Object
 * @param mandatoryEnums 0 = functions + rooms mandatory / 1 = function mandatory / 2 = rooms mandatory / 3 = rooms or functions
 * @returns
 */
const getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject = async (adapter, mandatoryEnums = 3) => {
    const allStates = await adapter.getForeignObjectsAsync('*', 'state', ['rooms', 'functions']);
    const filteredStates = Object.values(allStates).filter((state) => {
        const mainFilter = state.enums && Object.keys(state.enums).length > 0;
        const mandatoryEnumFilter = mandatoryEnums == 0
            ? state.enums &&
                Object.keys(state.enums).some((e) => e.startsWith('enum.rooms.')) &&
                Object.keys(state.enums).some((e) => e.startsWith('enum.functions.'))
            : mandatoryEnums == 1
                ? state.enums && Object.keys(state.enums).some((e) => e.startsWith('enum.functions.'))
                : mandatoryEnums == 2
                    ? state.enums && Object.keys(state.enums).some((e) => e.startsWith('enum.rooms.'))
                    : mandatoryEnums == 3
                        ? state.enums &&
                            (Object.keys(state.enums).some((e) => e.startsWith('enum.rooms.')) ||
                                Object.keys(state.enums).some((e) => e.startsWith('enum.functions.')))
                        : false;
        return mainFilter && mandatoryEnumFilter;
    });
    return filteredStates;
};
/**
 * Creates and returns an array of StateInformations with all states that contains function and/or room enums
 * @param adapter adapter Object
 * @param mandatoryEnums 0 = functions + rooms mandatory / 1 = function mandatory / 2 = rooms mandatory / 3 = rooms or functions
 * @returns
 */
const getAllStatesWithFunctionAndOrRoomEnumsAsStateInformation = async (adapter, mandatoryEnums = 3) => {
    const filteredStates = await getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject(adapter, mandatoryEnums);
    const stateInfos = filteredStates.map((state) => ({
        stateID: state._id,
        stateName: state.common.name,
        functions: state.enums
            ? Object.keys(state.enums).find((e) => e.startsWith('enum.functions.'))
            : undefined,
        rooms: state.enums ? Object.keys(state.enums).find((e) => e.startsWith('enum.rooms.')) : undefined,
    }));
    return stateInfos;
};
const stopAllServices = async (adapter) => {
    // TODO
    adapter;
    return;
};
const startAllServices = async (adapter) => {
    // TODO
    adapter;
    return;
};
const restartAllServices = async (adapter) => {
    // TODO
    adapter;
    return;
};
const removeStateFromAllServices = async (adapter, stateConfig) => {
    // TODO
    adapter;
    stateConfig;
    return;
};
const addStateToAllServices = async (adapter, stateConfig) => {
    // TODO
    adapter;
    stateConfig;
    return;
};
const chechAndCreateIfNeededNewEnum = async (adapter, enumID, enumName, enumIcon, enumDescription, enumColor) => {
    if (adapter && enumID) {
        const enumObject = {};
        enumObject.type = 'enum';
        enumObject.common = {};
        enumObject.common.name = enumName ? enumName : enumID.substr(enumID.lastIndexOf('.') + 1);
        enumObject.common.enabled = true;
        if (enumColor)
            enumObject.common.color = enumColor;
        if (enumDescription)
            enumObject.common.desc = enumDescription;
        if (enumIcon)
            enumObject.common.icon = enumIcon;
        enumObject.common.members = [];
        enumObject.natice = {};
        enumObject._id = enumID;
        enumObject.from = 'system.adapter.admin.0';
        enumObject.user = 'system.user.admin';
        await adapter.setForeignObjectNotExistsAsync(enumID, enumObject);
    }
    return;
};
const AdapterUtils = {
    getAllStatesWithFunctionAndOrRoomEnumsAsStateInformation: getAllStatesWithFunctionAndOrRoomEnumsAsStateInformation,
    getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject: getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject,
    stopAllServices: stopAllServices,
    startAllServices: startAllServices,
    restartAllServices: restartAllServices,
    removeStateFromAllServices: removeStateFromAllServices,
    addStateToAllServices: addStateToAllServices,
    chechAndCreateIfNeededNewEnum: chechAndCreateIfNeededNewEnum,
};
exports.default = AdapterUtils;
//# sourceMappingURL=index.js.map