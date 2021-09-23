"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const influxDBHandlerAdapter_1 = __importDefault(require("../../adapters/influxDBHandlerAdapter"));
const objectStateInformations = 'objectStateInformations';
let _adapter;
let _allStateIDsWithConfig = {};
const _setObjectStateInformations = async () => {
    await _adapter.setStateChangedAsync(objectStateInformations, JSON.stringify(_allStateIDsWithConfig), true);
};
const _getLatestName = (key) => {
    return _allStateIDsWithConfig[key].names[_allStateIDsWithConfig[key].names.length - 1];
};
const _setNewName = async (key, value) => {
    if (!value) {
        // state deleted
        await influxDBHandlerAdapter_1.default.deleteAllMessurementsWithAliasNameOnDB(key, _getLatestName(key));
        delete _allStateIDsWithConfig[key];
        await _setObjectStateInformations();
        _adapter.log.silly(`object ${key} deleted`);
        return;
    }
    else if (value && !(key in _allStateIDsWithConfig)) {
        // new state
        _allStateIDsWithConfig[key] = { defaultName: value.common.name, names: [value.common.name] };
    }
    else if (value && JSON.stringify(_getLatestName(key)) !== JSON.stringify(value.common.name)) {
        // state name changed
        _allStateIDsWithConfig[key].names.push(value.common.name);
    }
    await _setObjectStateInformations();
    await influxDBHandlerAdapter_1.default.changeAllMessurementsToNewAliasNameOnDB(key, _getLatestName(key));
    _adapter.log.silly(`object ${key} changed: ${JSON.stringify(value)}`);
};
const _initConfigChangeListener = async () => {
    const allStateObjects = await _adapter.getForeignObjectsAsync('*', 'state');
    const allChannelObjects = await _adapter.getForeignObjectsAsync('*', 'channel');
    const allDeviceObjects = await _adapter.getForeignObjectsAsync('*', 'device');
    const allObjects = { ...allStateObjects, ...allChannelObjects, ...allDeviceObjects };
    for (const [key, value] of Object.entries(allObjects)) {
        await _setNewName(key, value);
    }
};
const resetStateNameToDefault = async (id) => {
    if (!(id in _allStateIDsWithConfig))
        return;
    const obj = await _adapter.getForeignObjectAsync(id);
    if (obj) {
        obj.common.name = _allStateIDsWithConfig[id].defaultName;
        delete obj.enums;
        await _adapter.setForeignObjectAsync(id, obj);
    }
};
const resetAllStateNamesToDefault = async () => {
    const promiseArray = [];
    for (const id of Object.keys(_allStateIDsWithConfig)) {
        promiseArray.push(resetStateNameToDefault(id));
    }
    await Promise.all(promiseArray);
};
const onReady = async () => {
    _adapter.log.silly('ConfigChangeListener::onReady');
    await _adapter.setObjectNotExistsAsync(objectStateInformations, {
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
    const rawState = await _adapter.getStateAsync(objectStateInformations);
    if (!!rawState && !!rawState.val) {
        _allStateIDsWithConfig = JSON.parse(rawState.val);
    }
    else {
        _allStateIDsWithConfig = {};
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
    console.debug('ConfigChangeListener::onObjectChange');
    await _setNewName(id, obj);
    _adapter.log.silly(`object ${id} changed: ${JSON.stringify(obj)}`);
};
const onUnload = async () => {
    _adapter.log.error('ConfigChangeListener::onUnload');
    console.log('ConfigChangeListener::onUnload');
    console.debug('ConfigChangeListener::onUnload');
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