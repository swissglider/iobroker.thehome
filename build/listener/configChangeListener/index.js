"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectStateInformations = void 0;
const lodash_1 = __importDefault(require("lodash"));
const adapterUtilsFunctions_1 = __importDefault(require("../../utils/adapterUtils/adapterUtilsFunctions"));
exports.objectStateInformations = 'objectStateInformations';
let _adapter;
let _allStateIDsWithConfig = {};
const _setObjectStateInformations = async () => {
    await _adapter.setStateChangedAsync(exports.objectStateInformations, JSON.stringify(_allStateIDsWithConfig), true);
};
const _getLatestName = (key) => {
    return _allStateIDsWithConfig[key].names[_allStateIDsWithConfig[key].names.length - 1];
};
const _setNewName = async (key, value, init = false) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (key.startsWith('system.') ||
        key.startsWith('0_userdata.') ||
        key.startsWith('admin.') ||
        key.startsWith('alias.') ||
        key.startsWith('enum.') ||
        key.startsWith('_design.')) {
        return;
    }
    if (!value) {
        // state deleted
        delete _allStateIDsWithConfig[key];
        _adapter.log.silly(`object ${key} deleted`);
        return;
    }
    else if (value && !(key in _allStateIDsWithConfig)) {
        // new state
        _allStateIDsWithConfig[key] = { defaultName: (_b = (_a = value.common) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '', names: [(_d = (_c = value.common) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : ''] };
    }
    else if (value && !lodash_1.default.isEqual(_getLatestName(key), (_f = (_e = value.common) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : '')) {
        // state name changed
        _allStateIDsWithConfig[key].names.push((_h = (_g = value.common) === null || _g === void 0 ? void 0 : _g.name) !== null && _h !== void 0 ? _h : '');
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
    await _setObjectStateInformations();
};
const resetStateNameToDefault = async (id) => {
    if (!_adapter.config.ConfigChangeListener_active)
        return;
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
    if (!_adapter.config.ConfigChangeListener_active)
        return;
    const promiseArray = [];
    for (const id of Object.keys(_allStateIDsWithConfig)) {
        promiseArray.push(resetStateNameToDefault(id));
    }
    await Promise.all(promiseArray);
};
const getObjectIDsWithChangedNames = () => {
    const returnArray = [];
    for (const [key, value] of Object.entries(_allStateIDsWithConfig)) {
        if (!lodash_1.default.isEqual(value.defaultName, value.names[value.names.length - 1])) {
            returnArray.push(key);
        }
    }
    return returnArray;
};
const onReady = async () => {
    if (!_adapter.config.ConfigChangeListener_active)
        return;
    _adapter.log.silly('ConfigChangeListener::onReady');
    await adapterUtilsFunctions_1.default.checkIFStartable(_adapter);
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
                if (_adapter.config.ConfigChangeListener_active)
                    await resetStateNameToDefault(obj.message.id);
                _adapter.sendTo(obj.from, obj.command, 'ok', obj.callback);
            }
            catch (error) {
                _adapter.sendTo(obj.from, obj.command, `unknown error on ${obj.command}: ${error}`, obj.callback);
            }
        }
        else if (obj.command == 'ConfigChangeListener:resetAllStateNamesToDefault' && obj.callback) {
            try {
                if (_adapter.config.ConfigChangeListener_active)
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
    if (_adapter.config.ConfigChangeListener_active) {
        await _setNewName(id, obj);
        _adapter.log.silly(`object ${id} changed: ${JSON.stringify(obj)}`);
    }
};
const onUnload = async () => {
    _adapter.log.error('ConfigChangeListener::onUnload');
    if (_adapter.config.ConfigChangeListener_active)
        await _setObjectStateInformations();
};
const init = (adapter) => {
    _adapter = adapter;
    _adapter.on('ready', onReady);
    _adapter.on('message', onMessage);
    _adapter.on('objectChange', onObjectChange);
    _adapter.on('unload', onUnload);
};
const ConfigChangeListener = {
    init: init,
    getObjectIDsWithChangedNames: getObjectIDsWithChangedNames,
};
exports.default = ConfigChangeListener;
//# sourceMappingURL=index.js.map