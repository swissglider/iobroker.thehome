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
var axios_1 = require("axios");
var adapterUtilsFunctions_1 = require("../../utils/adapterUtils/adapterUtilsFunctions");
var RearangeDeviceAndStates_1 = require("../../utils/adapterUtils/RearangeDeviceAndStates");
var name = 'SonoffAdapter';
var adapterName = 'sonoff';
var getHealthStati = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    var singleAStates, returnValue;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, adapterUtilsFunctions_1["default"].getAdapterSingleStates(adapter, adapterName)];
            case 1:
                singleAStates = _a.sent();
                returnValue = __assign(__assign({}, singleAStates), { adapterFullReady: false });
                returnValue.adapterFullReady = returnValue.isAdapterInstalled && returnValue.isAdapterConnected;
                return [2 /*return*/, returnValue];
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
    var rootLevel, rootLevelPath, rootLevelElements, returnStruct, _loop_1, _i, _a, rootObj;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                rootLevel = 'channel';
                return [4 /*yield*/, adapterUtilsFunctions_1["default"].getAdapterPath(adapter, adapterName)];
            case 1:
                rootLevelPath = _b.sent();
                return [4 /*yield*/, adapter.getForeignObjectsAsync(rootLevelPath + '*', rootLevel)];
            case 2:
                rootLevelElements = _b.sent();
                returnStruct = [];
                if (!rootLevelElements) return [3 /*break*/, 6];
                _loop_1 = function (rootObj) {
                    var ipAddress, DeviceName, _c, deviceType, room, additionalNames, friendlyName, funcID2NameMap_1, error_1;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                if (!!rootObj._id.endsWith('.info')) return [3 /*break*/, 7];
                                _d.label = 1;
                            case 1:
                                _d.trys.push([1, 6, , 7]);
                                return [4 /*yield*/, adapter.getForeignStateAsync(rootObj._id + ".INFO.Info2_IPAddress")];
                            case 2:
                                ipAddress = _d.sent();
                                if (!(ipAddress && ipAddress.val)) return [3 /*break*/, 5];
                                return [4 /*yield*/, axios_1["default"].get("http://" + ipAddress.val + "/cm?cmnd=DeviceName")];
                            case 3:
                                DeviceName = (_d.sent()).data.DeviceName;
                                _c = DeviceName.split(' '), deviceType = _c[0], room = _c[1], additionalNames = _c.slice(2);
                                return [4 /*yield*/, axios_1["default"].get("http://" + ipAddress.val + "/cm?cmnd=FriendlyName")];
                            case 4:
                                friendlyName = (_d.sent()).data;
                                funcID2NameMap_1 = {};
                                if (deviceType === '4CH') {
                                    Object.values(friendlyName).forEach(function (value, index) {
                                        funcID2NameMap_1["POWER" + (index + 1)] = value;
                                    });
                                }
                                else if (deviceType === 'Switch') {
                                    funcID2NameMap_1['POWER'] = friendlyName['FriendlyName1'];
                                }
                                returnStruct.push({ deviceType: deviceType, room: room, additionalNames: additionalNames, rootObj: rootObj, funcID2NameMap: funcID2NameMap_1 });
                                _d.label = 5;
                            case 5: return [3 /*break*/, 7];
                            case 6:
                                error_1 = _d.sent();
                                return [3 /*break*/, 7];
                            case 7: return [2 /*return*/];
                        }
                    });
                };
                _i = 0, _a = Object.values(rootLevelElements);
                _b.label = 3;
            case 3:
                if (!(_i < _a.length)) return [3 /*break*/, 6];
                rootObj = _a[_i];
                return [5 /*yield**/, _loop_1(rootObj)];
            case 4:
                _b.sent();
                _b.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 3];
            case 6: return [2 /*return*/, returnStruct];
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
var SonoffAdapter = {
    name: name,
    isHealth: isHealth,
    onMessageFunc: { getHealthStati: getHealthStati, rename: rename }
};
exports["default"] = SonoffAdapter;
