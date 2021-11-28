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
var utils = require("@iobroker/adapter-core");
var _getInstances = function (adapter, adapterName) { return __awaiter(void 0, void 0, void 0, function () {
    var instances;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, adapter.getObjectViewAsync('system', 'instance', {
                    startkey: "system.adapter." + (adapterName ? adapterName + '.' : ''),
                    endkey: "system.adapter." + (adapterName ? adapterName + '.' : '') + "\u9999"
                })];
            case 1:
                instances = _a.sent();
                if (!(instances && instances.rows && instances.rows[0])) {
                    throw new Error("There is no " + adapterName + " Adapter");
                }
                return [2 /*return*/, instances.rows];
        }
    });
}); };
var getInstanceNative = function (adapter, adapterName, instanceNumber) { return __awaiter(void 0, void 0, void 0, function () {
    var iNumber;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                iNumber = instanceNumber !== null && instanceNumber !== void 0 ? instanceNumber : 0;
                return [4 /*yield*/, _getInstances(adapter, adapterName)];
            case 1: return [2 /*return*/, (_a = (_b.sent())[iNumber].value) === null || _a === void 0 ? void 0 : _a.native];
        }
    });
}); };
var getAdapterPath = function (adapter, adapterName) { return __awaiter(void 0, void 0, void 0, function () {
    var instance;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, _getInstances(adapter, adapterName)];
            case 1: return [4 /*yield*/, (_a.sent())[0]];
            case 2:
                instance = _a.sent();
                if (!instance)
                    return [2 /*return*/, ''];
                return [2 /*return*/, instance.id.replace(/system.adapter./g, '')];
        }
    });
}); };
var getAdapterPathes = function (adapter, adapterName) { return __awaiter(void 0, void 0, void 0, function () {
    var instances, returnArray, _i, instances_1, instance;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, _getInstances(adapter, adapterName)];
            case 1:
                instances = _a.sent();
                if (!instances)
                    return [2 /*return*/, []];
                returnArray = [];
                for (_i = 0, instances_1 = instances; _i < instances_1.length; _i++) {
                    instance = instances_1[_i];
                    returnArray.push(instance.id.replace(/system.adapter./g, ''));
                }
                return [2 /*return*/, returnArray];
        }
    });
}); };
var isAdapterInstalled = function (adapter, adapterName) { return __awaiter(void 0, void 0, void 0, function () {
    var instances, _i, instances_2, instance, results, isAlive, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, _getInstances(adapter, adapterName)];
            case 1:
                instances = _a.sent();
                if (!instances)
                    return [2 /*return*/, false];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 7, , 8]);
                _i = 0, instances_2 = instances;
                _a.label = 3;
            case 3:
                if (!(_i < instances_2.length)) return [3 /*break*/, 6];
                instance = instances_2[_i];
                return [4 /*yield*/, Promise.all([adapter.getForeignStatesAsync(instance.id + ".alive")])];
            case 4:
                results = _a.sent();
                isAlive = results && results[0] && instance.id + ".alive" in results[0];
                if (!isAlive)
                    return [2 /*return*/, false];
                _a.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 3];
            case 6: return [2 /*return*/, true];
            case 7:
                error_1 = _a.sent();
                return [2 /*return*/, false];
            case 8: return [2 /*return*/];
        }
    });
}); };
var isAdapterRunning = function (adapter, adapterName) { return __awaiter(void 0, void 0, void 0, function () {
    var instances, _i, instances_3, instance, results, isAlive, isConnected;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, _getInstances(adapter, adapterName)];
            case 1:
                instances = _a.sent();
                if (!instances)
                    return [2 /*return*/, false];
                _i = 0, instances_3 = instances;
                _a.label = 2;
            case 2:
                if (!(_i < instances_3.length)) return [3 /*break*/, 5];
                instance = instances_3[_i];
                return [4 /*yield*/, Promise.all([
                        adapter.getForeignStatesAsync(instance.id + ".alive"),
                        adapter.getForeignStatesAsync(instance.id + ".connected"),
                    ])];
            case 3:
                results = _a.sent();
                isAlive = instance.id + ".alive" in results[0] && results[0][instance.id + ".alive"].val === true;
                isConnected = instance.id + ".connected" in results[1] && results[1][instance.id + ".connected"].val === true;
                if (!(isAlive && isConnected))
                    return [2 /*return*/, false];
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/, true];
        }
    });
}); };
var isAdapterConnected = function (adapter, adapterName) { return __awaiter(void 0, void 0, void 0, function () {
    var instances, _i, instances_4, instance, instancePath, results, isAlive, isConnected, isConnection;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, _getInstances(adapter, adapterName)];
            case 1:
                instances = _a.sent();
                if (!instances)
                    return [2 /*return*/, false];
                _i = 0, instances_4 = instances;
                _a.label = 2;
            case 2:
                if (!(_i < instances_4.length)) return [3 /*break*/, 5];
                instance = instances_4[_i];
                instancePath = instance.id.replace(/system.adapter./g, '');
                return [4 /*yield*/, Promise.all([
                        adapter.getForeignStatesAsync(instance.id + ".alive"),
                        adapter.getForeignStatesAsync(instance.id + ".connected"),
                        adapter.getForeignStatesAsync(instancePath + ".info.connection"),
                    ])];
            case 3:
                results = _a.sent();
                isAlive = instance.id + ".alive" in results[0] && results[0][instance.id + ".alive"].val === true;
                isConnected = instance.id + ".connected" in results[1] && results[1][instance.id + ".connected"].val === true;
                isConnection = (instancePath + ".info.connection" in results[2] &&
                    results[2][instancePath + ".info.connection"].val === true) ||
                    Object.keys(results[2]).length === 0;
                if (!(isAlive && isConnected && isConnection))
                    return [2 /*return*/, false];
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/, true];
        }
    });
}); };
var getAdapterSingleStates = function (adapter, adapterName) { return __awaiter(void 0, void 0, void 0, function () {
    var returnResult, instances, _i, instances_5, instance, instancePath, results;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                returnResult = {
                    isAdapterInstalled: true,
                    isAdapterRunning: true,
                    isAdapterConnected: true
                };
                return [4 /*yield*/, _getInstances(adapter, adapterName)];
            case 1:
                instances = _a.sent();
                if (!instances)
                    return [2 /*return*/, {
                            isAdapterInstalled: false,
                            isAdapterRunning: false,
                            isAdapterConnected: false
                        }];
                _i = 0, instances_5 = instances;
                _a.label = 2;
            case 2:
                if (!(_i < instances_5.length)) return [3 /*break*/, 5];
                instance = instances_5[_i];
                instancePath = instance.id.replace(/system.adapter./g, '');
                return [4 /*yield*/, Promise.all([
                        adapter.getForeignStatesAsync(instance.id + ".alive"),
                        adapter.getForeignStatesAsync(instance.id + ".connected"),
                        adapter.getForeignStatesAsync(instancePath + ".info.connection"),
                    ])];
            case 3:
                results = _a.sent();
                returnResult.isAdapterInstalled = instance.id + ".alive" in results[0] && returnResult.isAdapterInstalled;
                returnResult.isAdapterRunning =
                    instance.id + ".connected" in results[1] &&
                        results[1][instance.id + ".connected"].val === true &&
                        instance.id + ".alive" in results[0] &&
                        results[0][instance.id + ".alive"].val === true &&
                        returnResult.isAdapterRunning;
                returnResult.isAdapterConnected =
                    ((returnResult.isAdapterRunning &&
                        instancePath + ".info.connection" in results[2] &&
                        (results[2][instancePath + ".info.connection"].val === true ||
                            (typeof results[2][instancePath + ".info.connection"].val === 'string' &&
                                results[2][instancePath + ".info.connection"].val !== ''))) ||
                        (returnResult.isAdapterRunning && Object.keys(results[2]).length === 0)) &&
                        returnResult.isAdapterConnected;
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/, returnResult];
        }
    });
}); };
var checkIFStartable = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    var error;
    return __generator(this, function (_a) {
        error = 'Influxdb adapter needs to be installed on ioBroker';
        isAdapterInstalled(adapter, 'influxdb')
            .then(function (e) {
            if (!e) {
                adapter.log.error(error);
                console.error(error);
                adapter.terminate(error, utils.EXIT_CODES.ADAPTER_REQUESTED_TERMINATION);
            }
        })["catch"](function (reason) {
            var _error = error + " - " + reason;
            adapter.log.error(_error);
            console.error(_error);
            adapter.terminate(_error, utils.EXIT_CODES.ADAPTER_REQUESTED_TERMINATION);
        });
        return [2 /*return*/];
    });
}); };
var AdapterUtilsFunctions = {
    isAdapterInstalled: isAdapterInstalled,
    isAdapterRunning: isAdapterRunning,
    isAdapterConnected: isAdapterConnected,
    checkIFStartable: checkIFStartable,
    getAdapterSingleStates: getAdapterSingleStates,
    getAdapterPath: getAdapterPath,
    getInstanceNative: getInstanceNative,
    getAdapterPathes: getAdapterPathes
};
exports["default"] = AdapterUtilsFunctions;
