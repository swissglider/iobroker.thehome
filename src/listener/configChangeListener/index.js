"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.objectStateInformations = void 0;
var lodash_1 = require("lodash");
var checkInitReadyUtil = require("../../utils/adapterUtils/checkInitReady");
exports.objectStateInformations = 'objectStateInformations';
var _STATUS = {
    _adapter: undefined,
    _isReady: 'nok',
    allStateIDsWithConfig: {},
    _name: 'ConfigChangeListener'
};
var _getAdapter = function () {
    if (_STATUS._adapter)
        return _STATUS._adapter;
    throw new Error('Adapter not set, probably not correct initialized');
};
var _setObjectStateInformations = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, _getAdapter().setStateChangedAsync(exports.objectStateInformations, JSON.stringify(_STATUS.allStateIDsWithConfig), true)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var _getLatestName = function (key) {
    return _STATUS.allStateIDsWithConfig[key].names[_STATUS.allStateIDsWithConfig[key].names.length - 1];
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var _setNewName = function (key, value, init) {
    if (init === void 0) { init = false; }
    return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __generator(this, function (_j) {
            if (key.startsWith('system.') ||
                key.startsWith('0_userdata.') ||
                key.startsWith('admin.') ||
                key.startsWith('alias.') ||
                key.startsWith('enum.') ||
                key.startsWith('_design.')) {
                return [2 /*return*/];
            }
            if (!value) {
                // state deleted
                delete _STATUS.allStateIDsWithConfig[key];
                _getAdapter().log.silly("object " + key + " deleted");
                return [2 /*return*/];
            }
            else if (value && !(key in _STATUS.allStateIDsWithConfig)) {
                // new state
                _STATUS.allStateIDsWithConfig[key] = {
                    defaultName: (_b = (_a = value.common) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '',
                    names: [(_d = (_c = value.common) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : '']
                };
            }
            else if (value && !lodash_1["default"].isEqual(_getLatestName(key), (_f = (_e = value.common) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : '')) {
                // state name changed
                _STATUS.allStateIDsWithConfig[key].names.push((_h = (_g = value.common) === null || _g === void 0 ? void 0 : _g.name) !== null && _h !== void 0 ? _h : '');
            }
            _getAdapter().log.silly("object " + key + " changed: " + JSON.stringify(value));
            return [2 /*return*/];
        });
    });
};
var _initConfigChangeListener = function () { return __awaiter(void 0, void 0, void 0, function () {
    var allStateObjects, allChannelObjects, allDeviceObjects, allObjects, _i, _a, _b, key, value;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, _getAdapter().getForeignObjectsAsync('*', 'state')];
            case 1:
                allStateObjects = _c.sent();
                return [4 /*yield*/, _getAdapter().getForeignObjectsAsync('*', 'channel')];
            case 2:
                allChannelObjects = _c.sent();
                return [4 /*yield*/, _getAdapter().getForeignObjectsAsync('*', 'device')];
            case 3:
                allDeviceObjects = _c.sent();
                allObjects = __assign(__assign(__assign({}, allStateObjects), allChannelObjects), allDeviceObjects);
                _i = 0, _a = Object.entries(allObjects);
                _c.label = 4;
            case 4:
                if (!(_i < _a.length)) return [3 /*break*/, 7];
                _b = _a[_i], key = _b[0], value = _b[1];
                return [4 /*yield*/, _setNewName(key, value, true)];
            case 5:
                _c.sent();
                _c.label = 6;
            case 6:
                _i++;
                return [3 /*break*/, 4];
            case 7: return [4 /*yield*/, _setObjectStateInformations()];
            case 8:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); };
var resetStateNameToDefault = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var obj;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!_getAdapter().config.ConfigChangeListener_active)
                    return [2 /*return*/];
                if (!(id in _STATUS.allStateIDsWithConfig))
                    return [2 /*return*/];
                return [4 /*yield*/, _getAdapter().getForeignObjectAsync(id)];
            case 1:
                obj = _a.sent();
                if (!obj) return [3 /*break*/, 3];
                obj.common.name = _STATUS.allStateIDsWithConfig[id].defaultName;
                delete obj.enums;
                return [4 /*yield*/, _getAdapter().setForeignObjectAsync(id, obj)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); };
var resetAllStateNamesToDefault = function () { return __awaiter(void 0, void 0, void 0, function () {
    var promiseArray, _i, _a, id;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!_getAdapter().config.ConfigChangeListener_active)
                    return [2 /*return*/];
                promiseArray = [];
                for (_i = 0, _a = Object.keys(_STATUS.allStateIDsWithConfig); _i < _a.length; _i++) {
                    id = _a[_i];
                    promiseArray.push(resetStateNameToDefault(id));
                }
                return [4 /*yield*/, Promise.all(promiseArray)];
            case 1:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); };
var _initConfigListener = function () { return __awaiter(void 0, void 0, void 0, function () {
    var rawState;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _STATUS._isReady = 'processing';
                _getAdapter().log.silly('ConfigChangeListener::onReady');
                if (!_getAdapter().config.ConfigChangeListener_active)
                    return [2 /*return*/];
                return [4 /*yield*/, _getAdapter().setObjectNotExistsAsync(exports.objectStateInformations, {
                        type: 'config',
                        common: {
                            name: 'ObjectStateInformations',
                            type: 'string',
                            role: 'meta.config',
                            desc: 'this meta datas are used for the adapter to handle all the objcet state datas faster',
                            read: true,
                            write: false
                        },
                        native: {}
                    })];
            case 1:
                _a.sent();
                return [4 /*yield*/, _getAdapter().getStateAsync(exports.objectStateInformations)];
            case 2:
                rawState = _a.sent();
                if (!!rawState && !!rawState.val) {
                    _STATUS.allStateIDsWithConfig = JSON.parse(rawState.val);
                }
                else {
                    _STATUS.allStateIDsWithConfig = {};
                }
                return [4 /*yield*/, _initConfigChangeListener()];
            case 3:
                _a.sent();
                _STATUS._isReady = 'ok';
                return [2 /*return*/];
        }
    });
}); };
var checkInitReady = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!adapter)
                    adapter = _getAdapter();
                return [4 /*yield*/, checkInitReadyUtil["default"](adapter, _STATUS, _initConfigListener)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var onReady = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _getAdapter().log.silly('ConnectionChecker::onReady');
                return [4 /*yield*/, checkInitReady()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var onMessage = function (obj) { return __awaiter(void 0, void 0, void 0, function () {
    var error_1, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _getAdapter().log.silly('ConfigChangeListener::onMessage');
                if (!_getAdapter().config.ConfigChangeListener_active)
                    _getAdapter().sendTo(obj.from, obj.command, "ok", obj.callback);
                return [4 /*yield*/, checkInitReady()];
            case 1:
                _a.sent();
                if (!(typeof obj === 'object')) return [3 /*break*/, 12];
                if (!(obj.command == 'ConfigChangeListener:resetStateNameToDefault' &&
                    obj.message &&
                    typeof obj.message === 'object' &&
                    'id' in obj.message &&
                    obj.callback)) return [3 /*break*/, 7];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 5, , 6]);
                if (!_getAdapter().config.ConfigChangeListener_active) return [3 /*break*/, 4];
                return [4 /*yield*/, resetStateNameToDefault(obj.message.id)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                _getAdapter().sendTo(obj.from, obj.command, 'ok', obj.callback);
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                _getAdapter().sendTo(obj.from, obj.command, "unknown error on " + obj.command + ": " + error_1, obj.callback);
                return [3 /*break*/, 6];
            case 6: return [3 /*break*/, 12];
            case 7:
                if (!(obj.command == 'ConfigChangeListener:resetAllStateNamesToDefault' && obj.callback)) return [3 /*break*/, 12];
                _a.label = 8;
            case 8:
                _a.trys.push([8, 11, , 12]);
                if (!_getAdapter().config.ConfigChangeListener_active) return [3 /*break*/, 10];
                return [4 /*yield*/, resetAllStateNamesToDefault()];
            case 9:
                _a.sent();
                _a.label = 10;
            case 10:
                _getAdapter().sendTo(obj.from, obj.command, 'ok', obj.callback);
                return [3 /*break*/, 12];
            case 11:
                error_2 = _a.sent();
                _getAdapter().sendTo(obj.from, obj.command, "unknown error on " + obj.command + ": " + error_2, obj.callback);
                return [3 /*break*/, 12];
            case 12: return [2 /*return*/];
        }
    });
}); };
var getObjectIDsWithChangedNames = function () { return __awaiter(void 0, void 0, void 0, function () {
    var returnArray, _i, _a, _b, key, value, _value;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, checkInitReady()];
            case 1:
                _c.sent();
                returnArray = [];
                for (_i = 0, _a = Object.entries(_STATUS.allStateIDsWithConfig); _i < _a.length; _i++) {
                    _b = _a[_i], key = _b[0], value = _b[1];
                    _value = value;
                    if (!lodash_1["default"].isEqual(_value.defaultName, _value.names[_value.names.length - 1])) {
                        returnArray.push(key);
                    }
                }
                return [2 /*return*/, returnArray];
        }
    });
}); };
var onObjectChange = function (id, obj) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _getAdapter().log.silly('ConfigChangeListener::onObjectChange');
                return [4 /*yield*/, checkInitReady()];
            case 1:
                _a.sent();
                if (!_getAdapter().config.ConfigChangeListener_active) return [3 /*break*/, 3];
                return [4 /*yield*/, _setNewName(id, obj)];
            case 2:
                _a.sent();
                _getAdapter().log.silly("object " + id + " changed: " + JSON.stringify(obj));
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); };
var onUnload = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _getAdapter().log.error('ConfigChangeListener::onUnload');
                if (!_getAdapter().config.ConfigChangeListener_active) return [3 /*break*/, 2];
                return [4 /*yield*/, _setObjectStateInformations()];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); };
var init = function (adapter) {
    _STATUS._adapter = adapter;
    _getAdapter().on('ready', onReady);
    _getAdapter().on('message', onMessage);
    _getAdapter().on('objectChange', onObjectChange);
    _getAdapter().on('unload', onUnload);
};
var ConfigChangeListener = {
    name: 'ConfigChangeListener',
    init: init,
    exportFunc: { getObjectIDsWithChangedNames: getObjectIDsWithChangedNames }
};
exports["default"] = ConfigChangeListener;
