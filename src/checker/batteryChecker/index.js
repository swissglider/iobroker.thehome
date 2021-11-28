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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var influxDBHandlerAdapter_1 = require("../../iobAdapterHandler/influxDBHandlerAdapter");
var checkerTimer_1 = require("../../utils/adapterUtils/checkerTimer");
var checkInitReadyUtil = require("../../utils/adapterUtils/checkInitReady");
var InfluxDBPointsHelper_1 = require("../../utils/adapterUtils/InfluxDBPointsHelper");
var NAME = 'BatteryChecker';
var batteryStatiObjectName = 'batteryStati';
var _STATUS = {
    _adapter: undefined,
    _isReady: 'nok',
    _name: 'BatteryChecker'
};
var _getAdapter = function () {
    if (_STATUS._adapter)
        return _STATUS._adapter;
    throw new Error('Adapter not set, probably not correct initialized');
};
var _calculateStati = function () { return __awaiter(void 0, void 0, void 0, function () {
    var allObj, filteredBattObjBoolean, filteredBattObjNumber, mergedBattObj, batteryStati, tagsValue, _i, _a, obj, tmpState, tags, state, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!_getAdapter().config.BatteryChecker_active)
                    return [2 /*return*/];
                return [4 /*yield*/, _getAdapter().getForeignObjectsAsync('*', 'state')];
            case 1:
                allObj = _b.sent();
                filteredBattObjBoolean = Object.values(allObj).filter(function (obj) {
                    var _a;
                    return ((_a = obj === null || obj === void 0 ? void 0 : obj.common) === null || _a === void 0 ? void 0 : _a.role) &&
                        _getAdapter().config.BatteryChecker_roles.includes(obj.common.role) &&
                        (obj === null || obj === void 0 ? void 0 : obj.common.type) === 'boolean';
                });
                filteredBattObjNumber = Object.values(allObj).filter(function (obj) {
                    var _a;
                    return ((_a = obj === null || obj === void 0 ? void 0 : obj.common) === null || _a === void 0 ? void 0 : _a.role) &&
                        _getAdapter().config.BatteryChecker_roles.includes(obj.common.role) &&
                        (obj === null || obj === void 0 ? void 0 : obj.common.type) === 'number';
                });
                mergedBattObj = __spreadArray(__spreadArray([], filteredBattObjBoolean, true), filteredBattObjNumber, true);
                batteryStati = [];
                tagsValue = [];
                _i = 0, _a = Object.values(mergedBattObj);
                _b.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 8];
                obj = _a[_i];
                if (!obj) return [3 /*break*/, 7];
                return [4 /*yield*/, _getAdapter().getForeignStateAsync(obj._id)];
            case 3:
                tmpState = _b.sent();
                _b.label = 4;
            case 4:
                _b.trys.push([4, 6, , 7]);
                return [4 /*yield*/, InfluxDBPointsHelper_1["default"].createTagType(_getAdapter(), obj)];
            case 5:
                tags = _b.sent();
                state = tmpState && tmpState.val && (typeof tmpState.val === 'number' || typeof tmpState.val === 'boolean')
                    ? tmpState.val
                    : 0;
                batteryStati.push(__assign(__assign({}, tags), { value: state }));
                tagsValue.push({ tags: tags, value: state });
                return [3 /*break*/, 7];
            case 6:
                error_1 = _b.sent();
                return [3 /*break*/, 7];
            case 7:
                _i++;
                return [3 /*break*/, 2];
            case 8: return [4 /*yield*/, influxDBHandlerAdapter_1["default"].influxDBExportFunc.writeBatteryPoints(_getAdapter(), tagsValue)];
            case 9:
                _b.sent();
                return [4 /*yield*/, _getAdapter().setStateChangedAsync(batteryStatiObjectName, JSON.stringify(batteryStati), true)];
            case 10:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); };
var _initBatteryChecker = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _getAdapter().log.silly('BatteryChecker::onReady');
                _STATUS._isReady = 'processing';
                if (!_getAdapter().config.BatteryChecker_active)
                    return [2 /*return*/];
                return [4 /*yield*/, _getAdapter().setObjectNotExistsAsync(batteryStatiObjectName, {
                        type: 'config',
                        common: {
                            name: batteryStatiObjectName,
                            type: 'string',
                            role: 'meta.config',
                            desc: 'this meta datas are used for the adapter to handle all the battery stati',
                            read: true,
                            write: false
                        },
                        native: {}
                    })];
            case 1:
                _a.sent();
                try {
                    _STATUS._isReady = 'ok';
                    checkerTimer_1["default"].startTimer(NAME, _getAdapter().config.BatteryChecker_timerMS, _calculateStati);
                }
                catch (error) {
                    console.error("unknown error: " + error);
                    _STATUS._isReady = 'nok';
                    _getAdapter().log.error("unknown error: " + error);
                }
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
                return [4 /*yield*/, checkInitReadyUtil["default"](adapter, _STATUS, _initBatteryChecker)];
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
                _getAdapter().log.silly('BatteryChecker::onReady');
                return [4 /*yield*/, checkInitReady()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var initBatteryChecker = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, checkInitReady()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var stopBatteryChecker = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, checkInitReady()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var onMessage = function (obj) { return __awaiter(void 0, void 0, void 0, function () {
    var error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _getAdapter().log.silly('BatteryChecker::onMessage');
                return [4 /*yield*/, checkInitReady()];
            case 1:
                _a.sent();
                if (!(typeof obj === 'object')) return [3 /*break*/, 6];
                if (!(obj.command == 'BatteryChecker:refreshStatistics' && obj.callback)) return [3 /*break*/, 6];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 5, , 6]);
                if (!_getAdapter().config.BatteryChecker_active) return [3 /*break*/, 4];
                return [4 /*yield*/, _calculateStati()];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                _getAdapter().sendTo(obj.from, obj.command, 'ok', obj.callback);
                return [3 /*break*/, 6];
            case 5:
                error_2 = _a.sent();
                _getAdapter().log.error("unknown error on " + obj.command + ": " + error_2);
                _getAdapter().sendTo(obj.from, obj.command, "unknown error on " + obj.command + ": " + error_2, obj.callback);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
var onUnload = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        _getAdapter().log.silly('BatteryChecker::onUnload');
        checkerTimer_1["default"].stopTimer(NAME);
        return [2 /*return*/];
    });
}); };
var init = function (adapter) {
    _STATUS._adapter = adapter;
    _getAdapter().on('ready', onReady);
    _getAdapter().on('message', onMessage);
    _getAdapter().on('unload', onUnload);
};
var BatteryChecker = {
    name: NAME,
    init: init,
    exportFunc: { stopBatteryChecker: stopBatteryChecker, initBatteryChecker: initBatteryChecker }
};
exports["default"] = BatteryChecker;
