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
exports.objectStateInformations = void 0;
const lodash_1 = __importDefault(require("lodash"));
const checkInitReadyUtil = __importStar(require("../../utils/adapterUtils/checkInitReady"));
exports.objectStateInformations = 'objectStateInformations';
const _STATUS = {
    _adapter: undefined,
    _isReady: 'nok',
    allStateIDsWithConfig: {},
    _name: 'ConfigChangeListener',
};
const _getAdapter = () => {
    if (_STATUS._adapter)
        return _STATUS._adapter;
    throw new Error('Adapter not set, probably not correct initialized');
};
const _setObjectStateInformations = async () => {
    await _getAdapter().setStateChangedAsync(exports.objectStateInformations, JSON.stringify(_STATUS.allStateIDsWithConfig), true);
};
const _getLatestName = (key) => {
    return _STATUS.allStateIDsWithConfig[key].names[_STATUS.allStateIDsWithConfig[key].names.length - 1];
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        delete _STATUS.allStateIDsWithConfig[key];
        _getAdapter().log.silly(`object ${key} deleted`);
        return;
    }
    else if (value && !(key in _STATUS.allStateIDsWithConfig)) {
        // new state
        _STATUS.allStateIDsWithConfig[key] = {
            defaultName: (_b = (_a = value.common) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '',
            names: [(_d = (_c = value.common) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : ''],
        };
    }
    else if (value && !lodash_1.default.isEqual(_getLatestName(key), (_f = (_e = value.common) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : '')) {
        // state name changed
        _STATUS.allStateIDsWithConfig[key].names.push((_h = (_g = value.common) === null || _g === void 0 ? void 0 : _g.name) !== null && _h !== void 0 ? _h : '');
    }
    _getAdapter().log.silly(`object ${key} changed: ${JSON.stringify(value)}`);
};
const _initConfigChangeListener = async () => {
    const allStateObjects = await _getAdapter().getForeignObjectsAsync('*', 'state');
    const allChannelObjects = await _getAdapter().getForeignObjectsAsync('*', 'channel');
    const allDeviceObjects = await _getAdapter().getForeignObjectsAsync('*', 'device');
    const allObjects = { ...allStateObjects, ...allChannelObjects, ...allDeviceObjects };
    for (const [key, value] of Object.entries(allObjects)) {
        await _setNewName(key, value, true);
    }
    await _setObjectStateInformations();
};
const resetStateNameToDefault = async (id) => {
    if (!_getAdapter().config.ConfigChangeListener_active)
        return;
    if (!(id in _STATUS.allStateIDsWithConfig))
        return;
    const obj = await _getAdapter().getForeignObjectAsync(id);
    if (obj) {
        obj.common.name = _STATUS.allStateIDsWithConfig[id].defaultName;
        delete obj.enums;
        await _getAdapter().setForeignObjectAsync(id, obj);
    }
};
const resetAllStateNamesToDefault = async () => {
    if (!_getAdapter().config.ConfigChangeListener_active)
        return;
    const promiseArray = [];
    for (const id of Object.keys(_STATUS.allStateIDsWithConfig)) {
        promiseArray.push(resetStateNameToDefault(id));
    }
    await Promise.all(promiseArray);
};
const _initConfigListener = async () => {
    _STATUS._isReady = 'processing';
    _getAdapter().log.silly('ConfigChangeListener::onReady');
    if (!_getAdapter().config.ConfigChangeListener_active)
        return;
    await _getAdapter().setObjectNotExistsAsync(exports.objectStateInformations, {
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
    const rawState = await _getAdapter().getStateAsync(exports.objectStateInformations);
    if (!!rawState && !!rawState.val) {
        _STATUS.allStateIDsWithConfig = JSON.parse(rawState.val);
    }
    else {
        _STATUS.allStateIDsWithConfig = {};
    }
    await _initConfigChangeListener();
    _STATUS._isReady = 'ok';
};
const checkInitReady = async (adapter) => {
    if (!adapter)
        adapter = _getAdapter();
    await checkInitReadyUtil.default(adapter, _STATUS, _initConfigListener);
};
const onReady = async () => {
    _getAdapter().log.silly('ConnectionChecker::onReady');
    await checkInitReady();
};
const onMessage = async (obj) => {
    _getAdapter().log.silly('ConfigChangeListener::onMessage');
    if (!_getAdapter().config.ConfigChangeListener_active)
        _getAdapter().sendTo(obj.from, obj.command, `ok`, obj.callback);
    await checkInitReady();
    if (typeof obj === 'object') {
        if (obj.command == 'ConfigChangeListener:resetStateNameToDefault' &&
            obj.message &&
            typeof obj.message === 'object' &&
            'id' in obj.message &&
            obj.callback) {
            try {
                if (_getAdapter().config.ConfigChangeListener_active)
                    await resetStateNameToDefault(obj.message.id);
                _getAdapter().sendTo(obj.from, obj.command, 'ok', obj.callback);
            }
            catch (error) {
                _getAdapter().sendTo(obj.from, obj.command, `unknown error on ${obj.command}: ${error}`, obj.callback);
            }
        }
        else if (obj.command == 'ConfigChangeListener:resetAllStateNamesToDefault' && obj.callback) {
            try {
                if (_getAdapter().config.ConfigChangeListener_active)
                    await resetAllStateNamesToDefault();
                _getAdapter().sendTo(obj.from, obj.command, 'ok', obj.callback);
            }
            catch (error) {
                _getAdapter().sendTo(obj.from, obj.command, `unknown error on ${obj.command}: ${error}`, obj.callback);
            }
        }
    }
};
const getObjectIDsWithChangedNames = async () => {
    await checkInitReady();
    const returnArray = [];
    for (const [key, value] of Object.entries(_STATUS.allStateIDsWithConfig)) {
        const _value = value;
        if (!lodash_1.default.isEqual(_value.defaultName, _value.names[_value.names.length - 1])) {
            returnArray.push(key);
        }
    }
    return returnArray;
};
const onObjectChange = async (id, obj) => {
    _getAdapter().log.silly('ConfigChangeListener::onObjectChange');
    await checkInitReady();
    if (_getAdapter().config.ConfigChangeListener_active) {
        await _setNewName(id, obj);
        _getAdapter().log.silly(`object ${id} changed: ${JSON.stringify(obj)}`);
    }
};
const onUnload = async () => {
    _getAdapter().log.error('ConfigChangeListener::onUnload');
    if (_getAdapter().config.ConfigChangeListener_active)
        await _setObjectStateInformations();
};
const init = (adapter) => {
    _STATUS._adapter = adapter;
    _getAdapter().on('ready', onReady);
    _getAdapter().on('message', onMessage);
    _getAdapter().on('objectChange', onObjectChange);
    _getAdapter().on('unload', onUnload);
};
const ConfigChangeListener = {
    name: 'ConfigChangeListener',
    init: init,
    exportFunc: { getObjectIDsWithChangedNames: getObjectIDsWithChangedNames },
};
exports.default = ConfigChangeListener;
//# sourceMappingURL=index.js.map