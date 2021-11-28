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
var adapterUtilsFunctions_1 = require("../../utils/adapterUtils/adapterUtilsFunctions");
var RearangeDeviceAndStates_1 = require("../../utils/adapterUtils/RearangeDeviceAndStates");
// eslint-disable-next-line @typescript-eslint/no-var-requires
var _a = require('miio-token-extractor'), AuthMiIO = _a.AuthMiIO, ApiMiIO = _a.ApiMiIO;
var deviceLists = {};
var name = 'MiNameAdapter';
var miNameAdapterProps = {
    miHomeInstanceName: ''
};
var _getDeviceList = function (login, password, country) { return __awaiter(void 0, void 0, void 0, function () {
    var stringTmp, authMiIO, apiMiIO, _a, userId, token, ssecurity, devices, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                stringTmp = login + "-" + password + "-" + country;
                if (stringTmp in deviceLists) {
                    return [2 /*return*/, deviceLists[stringTmp]];
                }
                authMiIO = new AuthMiIO();
                apiMiIO = new ApiMiIO();
                return [4 /*yield*/, authMiIO.login(login, password)];
            case 1:
                _a = _b.sent(), userId = _a.userId, token = _a.token, ssecurity = _a.ssecurity;
                return [4 /*yield*/, apiMiIO.getDeviceList(userId, ssecurity, token, country)];
            case 2:
                devices = _b.sent();
                deviceLists[login + "-" + password + "-" + country] = devices;
                return [2 /*return*/, devices];
            case 3:
                error_1 = _b.sent();
                throw new Error("" + error_1);
            case 4: return [2 /*return*/];
        }
    });
}); };
var getGatewayToken = function (adapter, _a) {
    var login = _a.login, password = _a.password, country = _a.country;
    return __awaiter(void 0, void 0, void 0, function () {
        var devices, gateway;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, _getDeviceList(login, password, country)];
                case 1:
                    devices = _b.sent();
                    gateway = devices.find(function (e) { return e.parent_id === '' && e.token; });
                    return [2 /*return*/, gateway ? gateway.token : ''];
            }
        });
    });
};
var testConnectionWithNewParameter = function (adapter, _a) {
    var login = _a.login, password = _a.password, country = _a.country;
    return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, _getDeviceList(login, password, country)];
                case 1:
                    _b.sent();
                    return [2 /*return*/, 'ok'];
                case 2:
                    error_2 = _b.sent();
                    return [2 /*return*/, { error: "" + error_2 }];
                case 3: return [2 /*return*/];
            }
        });
    });
};
var getMiTokenList = function (adapter, _contry) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, miChannels, login, password, country, devices, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!(miNameAdapterProps.miHomeInstanceName === '')) return [3 /*break*/, 2];
                _a = miNameAdapterProps;
                return [4 /*yield*/, adapterUtilsFunctions_1["default"].getAdapterPath(adapter, 'mihome')];
            case 1:
                _a.miHomeInstanceName = _b.sent();
                _b.label = 2;
            case 2: return [4 /*yield*/, adapter.getForeignObjectsAsync(miNameAdapterProps.miHomeInstanceName + '*', 'channel')];
            case 3:
                miChannels = _b.sent();
                login = adapter.config.MiNameAdapter_login;
                password = adapter.config.MiNameAdapter_password;
                country = _contry !== null && _contry !== void 0 ? _contry : adapter.config.MiNameAdapter_defaultCountry;
                _b.label = 4;
            case 4:
                _b.trys.push([4, 6, , 7]);
                return [4 /*yield*/, _getDeviceList(login, password, country)];
            case 5:
                devices = _b.sent();
                devices = devices.map(function (device) {
                    var did = device.did, token = device.token, name = device.name, localip = device.localip, model = device.model, mac = device.mac;
                    var stateID;
                    if (model.includes('gateway')) {
                        stateID = Object.keys(miChannels).find(function (e) { return e.includes('gateway'); });
                    }
                    else {
                        stateID = Object.keys(miChannels).find(function (e) { return e.includes(did.split('.').pop()); });
                    }
                    var stateName = stateID ? miChannels[stateID].common.name : undefined;
                    return { did: did, token: token, name: name, localip: localip, model: model, mac: mac, stateID: stateID, stateName: stateName };
                    // return { did, token, name, localip, model, mac };
                });
                return [2 /*return*/, devices];
            case 6:
                error_3 = _b.sent();
                throw error_3;
            case 7: return [2 /*return*/];
        }
    });
}); };
var getHealthStati = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    var singleAStates, returnValue, values, result, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, adapterUtilsFunctions_1["default"].getAdapterSingleStates(adapter, 'mihome')];
            case 1:
                singleAStates = _a.sent();
                returnValue = __assign(__assign({}, singleAStates), { adapterFullReady: false });
                values = {
                    login: adapter.config.MiNameAdapter_login,
                    password: adapter.config.MiNameAdapter_password,
                    country: adapter.config.MiNameAdapter_defaultCountry
                };
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, testConnectionWithNewParameter(adapter, values)];
            case 3:
                result = _a.sent();
                if (typeof result === 'object' && result.error) {
                    returnValue.adapterFullReady = false;
                }
                else {
                    returnValue.adapterFullReady = true;
                }
                return [3 /*break*/, 5];
            case 4:
                error_4 = _a.sent();
                returnValue.adapterFullReady = false;
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/, returnValue];
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
    var returnStruct, tokenList, _i, tokenList_1, comp, rootID, rootObj, _a, deviceType, room, additionalNames;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                returnStruct = [];
                return [4 /*yield*/, getMiTokenList(adapter)];
            case 1:
                tokenList = _b.sent();
                _i = 0, tokenList_1 = tokenList;
                _b.label = 2;
            case 2:
                if (!(_i < tokenList_1.length)) return [3 /*break*/, 5];
                comp = tokenList_1[_i];
                rootID = comp.stateID;
                if (!(rootID && comp.name)) return [3 /*break*/, 4];
                return [4 /*yield*/, adapter.getForeignObjectAsync(rootID)];
            case 3:
                rootObj = _b.sent();
                if (rootObj) {
                    _a = comp.name.split(' '), deviceType = _a[0], room = _a[1], additionalNames = _a.slice(2);
                    returnStruct.push({ deviceType: deviceType, room: room, additionalNames: additionalNames, rootObj: rootObj });
                }
                _b.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/, returnStruct];
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
var MiNameAdapter = {
    name: name,
    isHealth: isHealth,
    onMessageFunc: {
        getHealthStati: getHealthStati,
        rename: rename,
        getGatewayToken: getGatewayToken,
        testConnectionWithNewParameter: testConnectionWithNewParameter,
        getMiTokenList: getMiTokenList
    }
};
exports["default"] = MiNameAdapter;
