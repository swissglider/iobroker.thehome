"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getName = (name) => {
    if (typeof name === 'string') {
        return name;
    }
    else if (typeof name === 'object' && 'de' in name && name.de) {
        return name.de;
    }
    else if (typeof name === 'object' && 'en' in name && name.en) {
        return name.en;
    }
    else {
        return name.toString();
    }
};
const changeStateNameAndStore2DB = async (adapter, stateConfig) => {
    if (stateConfig.stateID && stateConfig.stateName) {
        const ob = await adapter.getForeignObjectAsync(stateConfig.stateID, 'state');
        if (ob) {
            // change state name
            ob.common.name = stateConfig.stateName;
            // change Store2DB param
            if (!ob.native)
                ob.native = {};
            if (!('swissglider' in ob.native))
                ob.native.swissglider = {};
            if (!('theHome' in ob.native.swissglider))
                ob.native.swissglider.theHome = {};
            // if (!(typeof ob.native.swissglider.theHome === 'object')) {
            // 	ob.native.swissglider.theHome = {};
            // }
            ob.native.swissglider.theHome.store2DB = stateConfig.store2DB;
            delete ob.enums;
            // save object
            await adapter.setForeignObjectAsync(stateConfig.stateID, ob);
        }
    }
};
const changeAllStateNameAndStore2DBs = async (adapter, config) => {
    for (const stateConfig of config) {
        await changeStateNameAndStore2DB(adapter, stateConfig);
    }
};
const getAllObjectsTheHomeParameter = async (adapter, format) => {
    const allObjects = await adapter.getForeignObjectsAsync('*', 'state');
    const filteredObjects = Object.values(allObjects).filter((obj) => obj.native && obj.native.swissglider && obj.native.swissglider.theHome);
    if (format === 'StateInformationArray')
        return filteredObjects.map((obj) => ({
            stateID: obj._id,
            stateName: getName(obj.common.name),
            store2DB: obj.native.swissglider.theHome.store2DB,
        }));
    return filteredObjects;
};
const removeAllTheHomeParametersFromAllObjects = async (adapter) => {
    const objecstWithStore2DB = await getAllObjectsTheHomeParameter(adapter, 'IoBrokerObjectArray');
    for (const obj of objecstWithStore2DB) {
        const tObj = obj;
        delete tObj.native.swissglider.theHome;
        if (Object.keys(tObj.native.swissglider).length === 0)
            delete tObj.native.swissglider;
        delete tObj.enums;
        await adapter.setForeignObjectAsync(tObj._id, tObj);
    }
    return;
};
const Helper = {
    changeStateNameAndStore2DB: changeStateNameAndStore2DB,
    changeAllStateNameAndStore2DBs: changeAllStateNameAndStore2DBs,
    getAllObjectsTheHomeParameter: getAllObjectsTheHomeParameter,
    removeAllTheHomeParametersFromAllObjects: removeAllTheHomeParametersFromAllObjects,
    getName: getName,
};
exports.default = Helper;
//# sourceMappingURL=helper.js.map