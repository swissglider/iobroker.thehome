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
exports.rearangeDeviceAndStates = void 0;
var influxDBHandlerAdapter_1 = require("../../iobAdapterHandler/influxDBHandlerAdapter");
var enumHandler_1 = require("./enumHandler");
var ioBrokerObjectHanlder_Name_Custom_1 = require("./ioBrokerObjectHanlder_Name_Custom");
var rearangeDeviceAndStates = function (adapter, isHealth, rootLevelElementsCreator) { return __awaiter(void 0, void 0, void 0, function () {
    var statiInfluxdb, adapterStati, rootLevelElemets, _i, rootLevelElemets_1, _a, deviceType, room, additionalNames, rootObj, funcID2NameMap, elementInfos, newName, objs, configMapping, _loop_1, _b, _c, obj, error_1;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 12, , 13]);
                return [4 /*yield*/, influxDBHandlerAdapter_1["default"].influxDBExportFunc.getHealthStati(adapter)];
            case 1:
                statiInfluxdb = _d.sent();
                if (Object.values(statiInfluxdb).some(function (e) { return !e; }))
                    return [2 /*return*/, { error: 'influxdb not fully running' }];
                return [4 /*yield*/, isHealth(adapter)];
            case 2:
                adapterStati = _d.sent();
                if (!adapterStati)
                    return [2 /*return*/, { error: 'adapter not fully running' }];
                return [4 /*yield*/, rootLevelElementsCreator(adapter)];
            case 3:
                rootLevelElemets = _d.sent();
                _i = 0, rootLevelElemets_1 = rootLevelElemets;
                _d.label = 4;
            case 4:
                if (!(_i < rootLevelElemets_1.length)) return [3 /*break*/, 11];
                _a = rootLevelElemets_1[_i], deviceType = _a.deviceType, room = _a.room, additionalNames = _a.additionalNames, rootObj = _a.rootObj, funcID2NameMap = _a.funcID2NameMap;
                elementInfos = { deviceType: deviceType, room: room, additionalNames: additionalNames !== null && additionalNames !== void 0 ? additionalNames : [] };
                newName = __spreadArray([elementInfos.deviceType, elementInfos.room], elementInfos.additionalNames, true).join(' ');
                rootObj.common.name = newName;
                if (!rootObj.native || typeof rootObj.native !== 'object') {
                    rootObj.native = {};
                }
                if (!rootObj.native.swissglider || typeof rootObj.native.swissglider !== 'object') {
                    rootObj.native.swissglider = {};
                }
                rootObj.native.swissglider.stateName = newName;
                rootObj.native.swissglider.deviceType = elementInfos.deviceType;
                rootObj.native.swissglider.room = elementInfos.room;
                delete rootObj.enums;
                return [4 /*yield*/, adapter.setForeignObjectAsync(rootObj._id, rootObj)];
            case 5:
                _d.sent();
                return [4 /*yield*/, adapter.getForeignObjectsAsync(rootObj._id + '*', 'state')];
            case 6:
                objs = _d.sent();
                configMapping = adapter.config.DeviceTypeFunctionMappings;
                _loop_1 = function (obj) {
                    var obj_id_name, tempStartWildCard, tempEndWildCard, deviceTypeObjecIdName, func, func_name, state_name, roomEnumID, toDB;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                obj_id_name = obj._id.substr(obj._id.lastIndexOf('.') + 1);
                                tempStartWildCard = configMapping[elementInfos.deviceType]
                                    ? Object.keys(configMapping[elementInfos.deviceType])
                                        .filter(function (e) { return e.startsWith('*'); })
                                        .map(function (e) { return e.slice(1); })
                                        .find(function (e) { return obj_id_name.endsWith(e); })
                                    : undefined;
                                tempEndWildCard = configMapping[elementInfos.deviceType]
                                    ? Object.keys(configMapping[elementInfos.deviceType])
                                        .filter(function (e) { return e.endsWith('*'); })
                                        .map(function (e) { return e.slice(0, -1); })
                                        .find(function (e) { return obj_id_name.startsWith(e); })
                                    : undefined;
                                if (configMapping[elementInfos.deviceType]) {
                                    Object.keys(configMapping[elementInfos.deviceType])
                                        .filter(function (e) { return e.endsWith('*'); })
                                        .map(function (e) { return e.slice(0, -1); })
                                        .find(function (e) { return obj_id_name.startsWith(e); });
                                }
                                deviceTypeObjecIdName = tempStartWildCard
                                    ? tempStartWildCard + '*'
                                    : tempEndWildCard
                                        ? tempEndWildCard + '*'
                                        : obj_id_name;
                                if (!(elementInfos.deviceType &&
                                    elementInfos.deviceType !== '' &&
                                    configMapping[elementInfos.deviceType] &&
                                    configMapping[elementInfos.deviceType][deviceTypeObjecIdName])) return [3 /*break*/, 9];
                                func = configMapping[elementInfos.deviceType][deviceTypeObjecIdName].functionID;
                                func_name = func.substr(func.lastIndexOf('.') + 1);
                                state_name = funcID2NameMap && funcID2NameMap[obj_id_name]
                                    ? funcID2NameMap[obj_id_name]
                                    : newName + ' ' + func_name;
                                obj.common.name = state_name;
                                if (!obj.native || typeof obj.native !== 'object') {
                                    obj.native = {};
                                }
                                if (!obj.native.swissglider || typeof obj.native.swissglider !== 'object') {
                                    obj.native.swissglider = {};
                                }
                                obj.native.swissglider.stateName = state_name;
                                obj.native.swissglider.deviceType = elementInfos.deviceType;
                                obj.native.swissglider.room = elementInfos.room;
                                obj.native.swissglider.funct = func_name;
                                delete obj.enums;
                                return [4 /*yield*/, adapter.setForeignObjectAsync(obj._id, obj)];
                            case 1:
                                _e.sent();
                                if (!func) return [3 /*break*/, 4];
                                return [4 /*yield*/, enumHandler_1["default"].chechAndCreateIfNeededNewEnum(adapter, func)];
                            case 2:
                                _e.sent();
                                return [4 /*yield*/, enumHandler_1["default"].addStateIDToEnum(adapter, func, obj._id)];
                            case 3:
                                _e.sent();
                                _e.label = 4;
                            case 4:
                                if (!(elementInfos.room && elementInfos.room !== '')) return [3 /*break*/, 7];
                                roomEnumID = 'enum.rooms.' + elementInfos.room;
                                return [4 /*yield*/, enumHandler_1["default"].chechAndCreateIfNeededNewEnum(adapter, roomEnumID, elementInfos.room)];
                            case 5:
                                _e.sent();
                                return [4 /*yield*/, enumHandler_1["default"].addStateIDToEnum(adapter, roomEnumID, obj._id)];
                            case 6:
                                _e.sent();
                                _e.label = 7;
                            case 7:
                                toDB = configMapping[elementInfos.deviceType][deviceTypeObjecIdName].toInfluxDB;
                                if (!toDB) return [3 /*break*/, 9];
                                return [4 /*yield*/, ioBrokerObjectHanlder_Name_Custom_1["default"].setInfluxCustom(adapter, obj._id, true)];
                            case 8:
                                _e.sent();
                                _e.label = 9;
                            case 9: return [2 /*return*/];
                        }
                    });
                };
                _b = 0, _c = Object.values(objs);
                _d.label = 7;
            case 7:
                if (!(_b < _c.length)) return [3 /*break*/, 10];
                obj = _c[_b];
                return [5 /*yield**/, _loop_1(obj)];
            case 8:
                _d.sent();
                _d.label = 9;
            case 9:
                _b++;
                return [3 /*break*/, 7];
            case 10:
                _i++;
                return [3 /*break*/, 4];
            case 11: return [2 /*return*/, 'ok'];
            case 12:
                error_1 = _d.sent();
                return [2 /*return*/, { error: "" + error_1 }];
            case 13: return [2 /*return*/];
        }
    });
}); };
exports.rearangeDeviceAndStates = rearangeDeviceAndStates;
