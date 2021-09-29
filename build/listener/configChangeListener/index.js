"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._allStateIDsWithConfig = exports.objectStateInformations = void 0;
const influxDBHandlerAdapter_1 = __importDefault(require("../../adapters/influxDBHandlerAdapter"));
exports.objectStateInformations = 'objectStateInformations';
let _adapter;
exports._allStateIDsWithConfig = {};
const _setObjectStateInformations = async () => {
    await _adapter.setStateChangedAsync(exports.objectStateInformations, JSON.stringify(exports._allStateIDsWithConfig), true);
};
const _getLatestName = (key) => {
    return exports._allStateIDsWithConfig[key].names[exports._allStateIDsWithConfig[key].names.length - 1];
};
const _setNewName = async (key, value, init = false) => {
    var _a;
    if (!value) {
        // state deleted
        delete exports._allStateIDsWithConfig[key];
        await _setObjectStateInformations();
        _adapter.log.silly(`object ${key} deleted`);
        return;
    }
    else if (value && !(key in exports._allStateIDsWithConfig)) {
        // new state
        exports._allStateIDsWithConfig[key] = { defaultName: value.common.name, names: [value.common.name] };
    }
    else if (value && JSON.stringify(_getLatestName(key)) !== JSON.stringify(value.common.name)) {
        // state name changed
        exports._allStateIDsWithConfig[key].names.push(value.common.name);
    }
    await _setObjectStateInformations();
    if (!init) {
        if (value.common.custom && ((_a = value.common.custom['influxdb.0']) === null || _a === void 0 ? void 0 : _a.enabled) === true) {
            await influxDBHandlerAdapter_1.default.changeNameOnDBBucket(key);
        }
    }
    _adapter.log.silly(`object ${key} changed: ${JSON.stringify(value)}`);
};
const _initConfigChangeListener = async () => {
    const allStateObjects = await _adapter.getForeignObjectsAsync('*', 'state');
    const allChannelObjects = await _adapter.getForeignObjectsAsync('*', 'channel');
    const allDeviceObjects = await _adapter.getForeignObjectsAsync('*', 'device');
    const allObjects = { ...allStateObjects, ...allChannelObjects, ...allDeviceObjects };
    for (const [key, value] of Object.entries(allObjects)) {
        await _setNewName(key, value, true);
    }
};
const resetStateNameToDefault = async (id) => {
    if (!(id in exports._allStateIDsWithConfig))
        return;
    const obj = await _adapter.getForeignObjectAsync(id);
    if (obj) {
        obj.common.name = exports._allStateIDsWithConfig[id].defaultName;
        delete obj.enums;
        await _adapter.setForeignObjectAsync(id, obj);
    }
};
const resetAllStateNamesToDefault = async () => {
    const promiseArray = [];
    for (const id of Object.keys(exports._allStateIDsWithConfig)) {
        promiseArray.push(resetStateNameToDefault(id));
    }
    await Promise.all(promiseArray);
};
const onReady = async () => {
    _adapter.log.silly('ConfigChangeListener::onReady');
    await _adapter.setObjectNotExistsAsync(exports.objectStateInformations, {
        type: 'config',
        common: {
            name: 'ObjectStateInformations',
            type: 'string',
            role: 'meta.config',
            desc: 'this meta datas are used for the adapter to handle all the objcet state datas faster',
            read: true,
            write: false,
        },
        native: {},
    });
    const rawState = await _adapter.getStateAsync(exports.objectStateInformations);
    if (!!rawState && !!rawState.val) {
        exports._allStateIDsWithConfig = JSON.parse(rawState.val);
    }
    else {
        exports._allStateIDsWithConfig = {};
    }
    await _initConfigChangeListener();
};
const onMessage = async (obj) => {
    _adapter.log.silly('ConfigChangeListener::onMessage');
    if (typeof obj === 'object') {
        if (obj.command == 'ConfigChangeListener:resetStateNameToDefault' &&
            obj.message &&
            typeof obj.message === 'object' &&
            'id' in obj.message &&
            obj.callback) {
            try {
                await resetStateNameToDefault(obj.message.id);
                _adapter.sendTo(obj.from, obj.command, 'ok', obj.callback);
            }
            catch (error) {
                _adapter.sendTo(obj.from, obj.command, `unknown error on ${obj.command}: ${error}`, obj.callback);
            }
        }
        else if (obj.command == 'ConfigChangeListener:resetAllStateNamesToDefault' && obj.callback) {
            try {
                await resetAllStateNamesToDefault();
                _adapter.sendTo(obj.from, obj.command, 'ok', obj.callback);
            }
            catch (error) {
                _adapter.sendTo(obj.from, obj.command, `unknown error on ${obj.command}: ${error}`, obj.callback);
            }
        }
    }
};
const onObjectChange = async (id, obj) => {
    _adapter.log.silly('ConfigChangeListener::onObjectChange');
    await _setNewName(id, obj);
    _adapter.log.silly(`object ${id} changed: ${JSON.stringify(obj)}`);
};
const onUnload = async () => {
    _adapter.log.error('ConfigChangeListener::onUnload');
    await _setObjectStateInformations();
};
const init = (adapter) => {
    _adapter = adapter;
    _adapter.on('ready', onReady);
    _adapter.on('message', onMessage);
    // _adapter.on('stateChange', onStateChange);
    _adapter.on('objectChange', onObjectChange);
    _adapter.on('unload', onUnload);
};
const ConfigChangeListener = {
    init: init,
    resetStateNameToDefault: resetStateNameToDefault,
    resetAllStateNamesToDefault: resetAllStateNamesToDefault,
};
exports.default = ConfigChangeListener;
//# sourceMappingURL=index.js.map