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
var adapterUtilsFunctions_1 = require("../../utils/adapterUtils/adapterUtilsFunctions");
var RearangeDeviceAndStates_1 = require("../../utils/adapterUtils/RearangeDeviceAndStates");
var name = 'ShellyAdapter';
var adapterName = 'shelly';
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
var _proceedRelay = function (adapter, device, returnStruct) { return __awaiter(void 0, void 0, void 0, function () {
    var channels, _i, _a, channel, channelNameState, _b, channelDeviceType, channelRoom, channnelAdditionalNames;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, adapter.getForeignObjectsAsync(device._id + '*', 'channel')];
            case 1:
                channels = _c.sent();
                _i = 0, _a = Object.values(channels);
                _c.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 5];
                channel = _a[_i];
                if (!channel._id.includes('Relay')) return [3 /*break*/, 4];
                return [4 /*yield*/, adapter.getForeignStateAsync(channel._id + '.ChannelName')];
            case 3:
                channelNameState = _c.sent();
                if (channelNameState && channelNameState.val && typeof channelNameState.val === 'string') {
                    _b = channelNameState.val.split(' '), channelDeviceType = _b[0], channelRoom = _b[1], channnelAdditionalNames = _b.slice(2);
                    returnStruct.push({
                        deviceType: channelDeviceType,
                        room: channelRoom,
                        additionalNames: channnelAdditionalNames,
                        rootObj: channel
                    });
                }
                _c.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/];
        }
    });
}); };
var rootLevelElementsCreator = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    var rootLevelPath, devices, returnStruct, _i, _a, device, typeObject, nameObject, _b, deviceType, room, additionalNames, _c, rootObj;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, adapterUtilsFunctions_1["default"].getAdapterPath(adapter, adapterName)];
            case 1:
                rootLevelPath = _d.sent();
                return [4 /*yield*/, adapter.getForeignObjectsAsync(rootLevelPath + '*', 'device')];
            case 2:
                devices = _d.sent();
                returnStruct = [];
                if (!devices) return [3 /*break*/, 12];
                _i = 0, _a = Object.values(devices);
                _d.label = 3;
            case 3:
                if (!(_i < _a.length)) return [3 /*break*/, 12];
                device = _a[_i];
                return [4 /*yield*/, adapter.getForeignStateAsync(device._id + '.mode')];
            case 4:
                typeObject = _d.sent();
                return [4 /*yield*/, adapter.getForeignStateAsync(device._id + '.name')];
            case 5:
                nameObject = _d.sent();
                if (!(nameObject && nameObject.val && typeof nameObject.val === 'string')) return [3 /*break*/, 11];
                _b = nameObject.val.split(' '), deviceType = _b[0], room = _b[1], additionalNames = _b.slice(2);
                returnStruct.push({
                    deviceType: 'Shelly',
                    room: room,
                    additionalNames: __spreadArray(__spreadArray([], [deviceType], false), additionalNames, true),
                    rootObj: device
                });
                if (!typeObject) return [3 /*break*/, 10];
                _c = typeObject.val;
                switch (_c) {
                    case 'roller': return [3 /*break*/, 6];
                    case 'relay': return [3 /*break*/, 8];
                }
                return [3 /*break*/, 9];
            case 6: return [4 /*yield*/, adapter.getForeignObjectAsync(device._id + '.Shutter')];
            case 7:
                rootObj = _d.sent();
                if (rootObj) {
                    returnStruct.push({ deviceType: deviceType, room: room, additionalNames: additionalNames, rootObj: rootObj });
                }
                return [3 /*break*/, 9];
            case 8:
                _proceedRelay(adapter, device, returnStruct);
                _d.label = 9;
            case 9: return [3 /*break*/, 11];
            case 10:
                _proceedRelay(adapter, device, returnStruct);
                _d.label = 11;
            case 11:
                _i++;
                return [3 /*break*/, 3];
            case 12: return [2 /*return*/, returnStruct];
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
var ShellyAdapter = {
    name: name,
    isHealth: isHealth,
    onMessageFunc: { getHealthStati: getHealthStati, rename: rename }
};
exports["default"] = ShellyAdapter;
