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
exports.statesConfigDownload = void 0;
var configChangeListener_1 = require("../../../listener/configChangeListener");
var adapterUtilsFunctions_1 = require("../../../utils/adapterUtils/adapterUtilsFunctions");
var enumHandler_1 = require("../../../utils/adapterUtils/enumHandler");
var nameHelper_1 = require("../../../utils/adapterUtils/nameHelper");
var getStateInfo = function (adapter, obj, influxName) {
    var _a, _b, _c, _d, _e, _f;
    return {
        stateID: obj._id,
        stateName: nameHelper_1["default"].getName((_b = (_a = obj.common) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '', (_d = (_c = adapter.systemConfig) === null || _c === void 0 ? void 0 : _c.language) !== null && _d !== void 0 ? _d : 'de'),
        functions: obj.enums ? Object.keys(obj.enums).find(function (e) { return e.startsWith('enum.functions.'); }) : undefined,
        rooms: obj.enums ? Object.keys(obj.enums).find(function (e) { return e.startsWith('enum.rooms.'); }) : undefined,
        store2DB: (_f = (obj.common.custom && ((_e = obj.common.custom[influxName]) === null || _e === void 0 ? void 0 : _e.enabled) === true)) !== null && _f !== void 0 ? _f : false
    };
};
/**
 * Creates and returns an array of StateInformations with all states that contains function and/or room enums
 * @param adapter adapter Object
 * @param mandatoryEnums 0 = functions + rooms mandatory / 1 = function mandatory / 2 = rooms mandatory / 3 = rooms or functions
 * @returns
 */
var getAllStatesWithFunctionAndOrRoomEnumsAsStateInformation = function (adapter, mandatoryEnums) {
    if (mandatoryEnums === void 0) { mandatoryEnums = 3; }
    return __awaiter(void 0, void 0, void 0, function () {
        var filteredObj, influxName_1, stateInfos, changedNameObjIDs, tmpAlreadyAddedStateIDs, _i, changedNameObjIDs_1, objID, tmpObj, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, enumHandler_1["default"].getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject(adapter, mandatoryEnums)];
                case 1:
                    filteredObj = _a.sent();
                    return [4 /*yield*/, adapterUtilsFunctions_1["default"].getAdapterPath(adapter, 'influxdb')];
                case 2:
                    influxName_1 = _a.sent();
                    stateInfos = filteredObj.map(function (obj) { return getStateInfo(adapter, obj, influxName_1); });
                    changedNameObjIDs = configChangeListener_1["default"].exportFunc.getObjectIDsWithChangedNames();
                    tmpAlreadyAddedStateIDs = stateInfos.map(function (e) { return e.stateID; });
                    _i = 0, changedNameObjIDs_1 = changedNameObjIDs;
                    _a.label = 3;
                case 3:
                    if (!(_i < changedNameObjIDs_1.length)) return [3 /*break*/, 6];
                    objID = changedNameObjIDs_1[_i];
                    if (!!tmpAlreadyAddedStateIDs.includes(objID)) return [3 /*break*/, 5];
                    return [4 /*yield*/, adapter.getForeignObjectAsync(objID)];
                case 4:
                    tmpObj = _a.sent();
                    if (tmpObj) {
                        stateInfos.push(getStateInfo(adapter, tmpObj, influxName_1));
                    }
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/, stateInfos];
                case 7:
                    error_1 = _a.sent();
                    console.error(error_1);
                    throw error_1;
                case 8: return [2 /*return*/];
            }
        });
    });
};
var statesConfigDownload = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    var states;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getAllStatesWithFunctionAndOrRoomEnumsAsStateInformation(adapter)];
            case 1:
                states = _a.sent();
                return [2 /*return*/, JSON.stringify(states, null, 2)];
        }
    });
}); };
exports.statesConfigDownload = statesConfigDownload;
