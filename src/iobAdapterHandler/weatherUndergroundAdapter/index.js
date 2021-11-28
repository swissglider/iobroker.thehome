"use strict";
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
var adapterUtilsFunctions_1 = require("../../utils/adapterUtils/adapterUtilsFunctions");
var nameHelper_1 = require("../../utils/adapterUtils/nameHelper");
var RearangeDeviceAndStates_1 = require("../../utils/adapterUtils/RearangeDeviceAndStates");
var name = 'WeatherundergroundAdapter';
var adapterName = 'weatherunderground';
var getHealthStati = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    var instancePath, observeTimeState, observeTime, now, div;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, adapterUtilsFunctions_1["default"].getAdapterPath(adapter, adapterName)];
            case 1:
                instancePath = _a.sent();
                return [4 /*yield*/, adapter.getForeignStateAsync(instancePath + ".forecast.current.observationTimeRFC822")];
            case 2:
                observeTimeState = _a.sent();
                if (observeTimeState && typeof observeTimeState.val === 'string') {
                    observeTime = new Date(observeTimeState.val);
                    now = Date.now();
                    div = (now - observeTime.getTime()) / 1000 / 60;
                    if (div < adapter.config.WeatherundergroundAdapter_lastObeserveTimeSinceMinutes) {
                        return [2 /*return*/, {
                                isAdapterInstalled: true,
                                isAdapterRunning: true,
                                isAdapterConnected: true,
                                adapterFullReady: true
                            }];
                    }
                }
                throw new Error("Last Update to long ago (more than " + adapter.config.WeatherundergroundAdapter_lastObeserveTimeSinceMinutes + " min), is the adapter still running and is it installed ?");
        }
    });
}); };
var isHealth = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    var returnValue;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getHealthStati(adapter)];
            case 1:
                returnValue = _a.sent();
                return [2 /*return*/, Object.values(returnValue).every(function (e) { return e; })];
        }
    });
}); };
var rootLevelElementsCreator = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    var rootLevelPath, returnStruct, results, room;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0: return [4 /*yield*/, adapterUtilsFunctions_1["default"].getAdapterPath(adapter, adapterName)];
            case 1:
                rootLevelPath = _e.sent();
                returnStruct = [];
                return [4 /*yield*/, Promise.all([
                        adapter.getForeignObjectAsync(rootLevelPath + ".forecast.current"),
                        adapter.getForeignObjectAsync(rootLevelPath + ".forecastHourly.0h"),
                    ])];
            case 2:
                results = _e.sent();
                room = 'draussen';
                if (results[0]) {
                    returnStruct.push({
                        deviceType: 'Aktualles_Wetter',
                        room: room,
                        additionalNames: [nameHelper_1["default"].getName((_b = (_a = results[0]) === null || _a === void 0 ? void 0 : _a.common.name) !== null && _b !== void 0 ? _b : '')],
                        rootObj: results[0]
                    });
                }
                if (results[1]) {
                    returnStruct.push({
                        deviceType: 'ForecastNächsteStunde_Wetter',
                        room: room,
                        additionalNames: [nameHelper_1["default"].getName((_d = (_c = results[1]) === null || _c === void 0 ? void 0 : _c.common.name) !== null && _d !== void 0 ? _d : '')],
                        rootObj: results[1]
                    });
                }
                return [2 /*return*/, returnStruct];
        }
    });
}); };
var rename = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, RearangeDeviceAndStates_1.rearangeDeviceAndStates)(adapter, isHealth, rootLevelElementsCreator)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var WeatherundergroundAdapter = {
    name: name,
    isHealth: isHealth,
    onMessageFunc: { getHealthStati: getHealthStati, rename: rename }
};
exports["default"] = WeatherundergroundAdapter;
