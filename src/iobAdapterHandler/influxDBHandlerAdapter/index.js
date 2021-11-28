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
var influxdb_client_1 = require("@influxdata/influxdb-client");
var influxdb_client_apis_1 = require("@influxdata/influxdb-client-apis");
var adapterUtilsFunctions_1 = require("../../utils/adapterUtils/adapterUtilsFunctions");
var checkInitReadyUtil = require("../../utils/adapterUtils/checkInitReady");
var BatteryBucketHandler_1 = require("./helper/BatteryBucketHandler");
var LabelBucketHandler_1 = require("./helper/LabelBucketHandler");
var name = 'InfluxDBHandlerAdapter';
var adapterName = 'influxdb';
var _STATUS = {
    _isReady: 'nok',
    _name: 'InfluxDBHandlerAdapter'
};
var influxStatics = {};
var _getToken = function (adapter) {
    var token = adapter.config.InfluxDBHandlerAdapter_token;
    if (token === '') {
        adapter.log.silly('token not yet set');
        throw new Error('token not yet set');
    }
    return token;
};
var _getOrganization = function () {
    if (!influxStatics.organization)
        throw new Error('Organization not set');
    return influxStatics.organization;
};
var _getInfluxName = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!!influxStatics.influxName) return [3 /*break*/, 2];
                _a = influxStatics;
                return [4 /*yield*/, adapterUtilsFunctions_1["default"].getAdapterPath(adapter, 'influxdb')];
            case 1:
                _a.influxName = _b.sent();
                _b.label = 2;
            case 2: return [2 /*return*/, influxStatics.influxName];
        }
    });
}); };
var _createLabel = function (adapter, labelStruct) { return __awaiter(void 0, void 0, void 0, function () {
    var orgID, apiResponse;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                orgID = _getOrganization().id;
                return [4 /*yield*/, ((_a = influxStatics.labelsAPI) === null || _a === void 0 ? void 0 : _a.postLabels({
                        body: {
                            name: labelStruct.name,
                            orgID: orgID,
                            properties: {
                                color: labelStruct.color,
                                description: labelStruct.description
                            }
                        }
                    }))];
            case 1:
                apiResponse = _b.sent();
                if (apiResponse === null || apiResponse === void 0 ? void 0 : apiResponse.label)
                    return [2 /*return*/, apiResponse === null || apiResponse === void 0 ? void 0 : apiResponse.label];
                throw new Error('Something is wrong while creating the InfluxDB Label: ' + name);
        }
    });
}); };
var _getLabel = function (adapter, labelStruct) { return __awaiter(void 0, void 0, void 0, function () {
    var apiResponse, _i, _a, label;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, ((_b = influxStatics.labelsAPI) === null || _b === void 0 ? void 0 : _b.getLabels())];
            case 1:
                apiResponse = _c.sent();
                if (apiResponse && apiResponse.labels) {
                    for (_i = 0, _a = apiResponse.labels; _i < _a.length; _i++) {
                        label = _a[_i];
                        if (label && label.name && label.name === labelStruct.name) {
                            return [2 /*return*/, label];
                        }
                    }
                }
                return [2 /*return*/, _createLabel(adapter, labelStruct)];
        }
    });
}); };
var _addAllLabelsToTheBucket = function (adapter, bucketID) { return __awaiter(void 0, void 0, void 0, function () {
    var _i, _a, labelStruct, tmpLabel;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!(adapter.config.InfluxDBHandlerAdapter_labels && Array.isArray(adapter.config.InfluxDBHandlerAdapter_labels))) return [3 /*break*/, 5];
                _i = 0, _a = adapter.config.InfluxDBHandlerAdapter_labels;
                _c.label = 1;
            case 1:
                if (!(_i < _a.length)) return [3 /*break*/, 5];
                labelStruct = _a[_i];
                return [4 /*yield*/, _getLabel(adapter, labelStruct)];
            case 2:
                tmpLabel = _c.sent();
                if (!(tmpLabel && tmpLabel.id)) return [3 /*break*/, 4];
                return [4 /*yield*/, ((_b = influxStatics.bucketsAPI) === null || _b === void 0 ? void 0 : _b.postBucketsIDLabels({
                        bucketID: bucketID,
                        body: { labelID: tmpLabel.id }
                    }))];
            case 3:
                _c.sent();
                _c.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 1];
            case 5: return [2 /*return*/];
        }
    });
}); };
var _initInfluxDBTags = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, url, token, name_1, apiResponse, error_1, _influxName, error_2;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                // get InfluxDB Adapter Configuration
                _STATUS._isReady = 'processing';
                _a = influxStatics;
                return [4 /*yield*/, adapterUtilsFunctions_1["default"].getInstanceNative(adapter, adapterName)];
            case 1:
                _a.influxDBInstanceConfiguration = _c.sent();
                if (!influxStatics.influxDBInstanceConfiguration)
                    throw new Error('no influxdb instance configuration');
                url = influxStatics.influxDBInstanceConfiguration.protocol + "://" + influxStatics.influxDBInstanceConfiguration.host + ":" + influxStatics.influxDBInstanceConfiguration.port;
                token = _getToken(adapter);
                influxStatics.influxDB = new influxdb_client_1.InfluxDB({
                    url: url,
                    token: token
                });
                if (!influxStatics.influxDB)
                    throw new Error('no influxdb instance configuration');
                _c.label = 2;
            case 2:
                _c.trys.push([2, 4, , 5]);
                influxStatics.queryAPI = influxStatics.influxDB.getQueryApi('swissglider');
                influxStatics.orgsAPI = new influxdb_client_apis_1.OrgsAPI(influxStatics.influxDB);
                influxStatics.labelsAPI = new influxdb_client_apis_1.LabelsAPI(influxStatics.influxDB);
                influxStatics.bucketsAPI = new influxdb_client_apis_1.BucketsAPI(influxStatics.influxDB);
                influxStatics.writeApiLabel = influxStatics.influxDB.getWriteApi(influxStatics.influxDBInstanceConfiguration.organization, adapter.config.InfluxDBHandlerAdapter_bucketLabels);
                // get the organization
                if (!influxStatics.influxDBInstanceConfiguration)
                    throw new Error("No organization found!");
                name_1 = influxStatics.influxDBInstanceConfiguration.organization;
                return [4 /*yield*/, ((_b = influxStatics.orgsAPI) === null || _b === void 0 ? void 0 : _b.getOrgs({ org: name_1 }))];
            case 3:
                apiResponse = _c.sent();
                if (apiResponse) {
                    if (!apiResponse.orgs || apiResponse.orgs.length === 0) {
                        throw new Error("No organization named " + name_1 + " found!");
                    }
                    influxStatics.organization = apiResponse.orgs[0];
                }
                else {
                    throw new Error('Something is wrong while getting the InfluxDB Organization');
                }
                return [3 /*break*/, 5];
            case 4:
                error_1 = _c.sent();
                console.error(error_1);
                throw new Error("something went wrong while establish the influxDB connection: " + error_1);
            case 5:
                _c.trys.push([5, 9, , 10]);
                return [4 /*yield*/, _getInfluxName(adapter)];
            case 6:
                _influxName = _c.sent();
                _STATUS._isReady = 'ok';
                return [4 /*yield*/, LabelBucketHandler_1["default"].initInfluxDB(adapter, _influxName)];
            case 7:
                _c.sent();
                return [4 /*yield*/, BatteryBucketHandler_1["default"].initInfluxDB(adapter, _influxName)];
            case 8:
                _c.sent();
                return [3 /*break*/, 10];
            case 9:
                error_2 = _c.sent();
                throw new Error("something went wrong while establish the influxDB connection: " + error_2);
            case 10: return [2 /*return*/];
        }
    });
}); };
var _init = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    var error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!adapter.config.InfluxDBHandlerAdapter_active) {
                    _STATUS._isReady = 'ok';
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, _initInfluxDBTags(adapter)];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                _STATUS._isReady = 'nok';
                adapter.log.error("unknown error: " + error_3);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
var checkInitReady = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, checkInitReadyUtil["default"](adapter, _STATUS, _init)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var init = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, checkInitReady(adapter)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var testInfluxDBConnectionWithToken = function (adapter, _a) {
    var token = _a.token;
    return __awaiter(void 0, void 0, void 0, function () {
        var isAdapterConnected, tmpConfig, usedParams, subset, influxName, testResult;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, checkInitReady(adapter)];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, adapterUtilsFunctions_1["default"].isAdapterConnected(adapter, 'influxdb')];
                case 2:
                    isAdapterConnected = _b.sent();
                    if (!isAdapterConnected)
                        throw new Error('Influxdb adapter is not running correct');
                    tmpConfig = __assign(__assign({}, influxStatics.influxDBInstanceConfiguration), {
                        token: token
                    });
                    usedParams = ['port', 'host', 'dbversion', 'protocol', 'organization', 'dbname', 'token'];
                    subset = Object.fromEntries(Object.entries(tmpConfig).filter(function (_a) {
                        var key = _a[0];
                        return usedParams.includes(key);
                    }));
                    return [4 /*yield*/, _getInfluxName(adapter)];
                case 3:
                    influxName = _b.sent();
                    return [4 /*yield*/, adapter
                            .sendToAsync(influxName, 'test', { config: subset })["catch"](function (reason) {
                            throw new Error(reason);
                        })];
                case 4:
                    testResult = _b.sent();
                    if (testResult.error) {
                        throw testResult.error;
                    }
                    return [2 /*return*/, 'ok'];
            }
        });
    });
};
var createBucketIfNeeded = function (adapter, name, description) { return __awaiter(void 0, void 0, void 0, function () {
    var orgID, temp, tmpRetentionRules, _i, _a, bucket, influxDBOrgBucketName, tmpBucket;
    var _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0: return [4 /*yield*/, checkInitReady(adapter)];
            case 1:
                _e.sent();
                orgID = _getOrganization().id;
                return [4 /*yield*/, ((_b = influxStatics.bucketsAPI) === null || _b === void 0 ? void 0 : _b.getBuckets({
                        orgID: orgID
                    }))];
            case 2:
                temp = _e.sent();
                if (!(temp && temp.buckets && influxStatics.influxDBInstanceConfiguration)) return [3 /*break*/, 5];
                tmpRetentionRules = void 0;
                for (_i = 0, _a = temp.buckets; _i < _a.length; _i++) {
                    bucket = _a[_i];
                    influxDBOrgBucketName = (_c = influxStatics.influxDBInstanceConfiguration.bucket) !== null && _c !== void 0 ? _c : influxStatics.influxDBInstanceConfiguration.dbname;
                    if (bucket.name === influxDBOrgBucketName) {
                        tmpRetentionRules = bucket.retentionRules;
                    }
                    if (bucket.name === name) {
                        return [2 /*return*/];
                    }
                }
                return [4 /*yield*/, ((_d = influxStatics.bucketsAPI) === null || _d === void 0 ? void 0 : _d.postBuckets({
                        body: {
                            name: name,
                            description: description,
                            retentionRules: tmpRetentionRules !== null && tmpRetentionRules !== void 0 ? tmpRetentionRules : [],
                            orgID: orgID
                        }
                    }))];
            case 3:
                tmpBucket = _e.sent();
                if (!(tmpBucket && tmpBucket.id)) return [3 /*break*/, 5];
                return [4 /*yield*/, _addAllLabelsToTheBucket(adapter, tmpBucket.id)];
            case 4:
                _e.sent();
                _e.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); };
var deleteBucket = function (adapter, bucketName) { return __awaiter(void 0, void 0, void 0, function () {
    var orgID, temp, _i, _a, bucket;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, checkInitReady(adapter)];
            case 1:
                _d.sent();
                orgID = _getOrganization().id;
                return [4 /*yield*/, ((_b = influxStatics.bucketsAPI) === null || _b === void 0 ? void 0 : _b.getBuckets({
                        orgID: orgID
                    }))];
            case 2:
                temp = _d.sent();
                if (!(temp && temp.buckets)) return [3 /*break*/, 6];
                _i = 0, _a = temp.buckets;
                _d.label = 3;
            case 3:
                if (!(_i < _a.length)) return [3 /*break*/, 6];
                bucket = _a[_i];
                if (!(bucket.name === bucketName && bucket.id)) return [3 /*break*/, 5];
                return [4 /*yield*/, ((_c = influxStatics.bucketsAPI) === null || _c === void 0 ? void 0 : _c.deleteBucketsID({ bucketID: bucket.id }))];
            case 4:
                _d.sent();
                _d.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 3];
            case 6: return [2 /*return*/];
        }
    });
}); };
var getBucketWriteApi = function (adapter, bucketName) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, checkInitReady(adapter)];
            case 1:
                _a.sent();
                if (!influxStatics.influxDBInstanceConfiguration || !influxStatics.influxDB)
                    return [2 /*return*/, undefined];
                return [2 /*return*/, influxStatics.influxDB.getWriteApi(influxStatics.influxDBInstanceConfiguration.organization, bucketName)];
        }
    });
}); };
var getHealthStati = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    var singleAStates, returnValue, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, checkInitReady(adapter)];
            case 1:
                _a.sent();
                return [4 /*yield*/, adapterUtilsFunctions_1["default"].getAdapterSingleStates(adapter, 'influxdb')];
            case 2:
                singleAStates = _a.sent();
                returnValue = __assign(__assign({}, singleAStates), { adapterFullReady: false });
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, testInfluxDBConnectionWithToken(adapter, { token: _getToken(adapter) })];
            case 4:
                _a.sent();
                returnValue.adapterFullReady = true;
                return [3 /*break*/, 6];
            case 5:
                error_4 = _a.sent();
                returnValue.adapterFullReady = false;
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/, returnValue];
        }
    });
}); };
var isHealth = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    var returnValue;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, checkInitReady(adapter)];
            case 1:
                _a.sent();
                return [4 /*yield*/, getHealthStati(adapter)];
            case 2:
                returnValue = _a.sent();
                return [2 /*return*/, Object.values(returnValue).every(function (e) { return e; })];
        }
    });
}); };
var rename = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    var returnValue;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, checkInitReady(adapter)];
            case 1:
                _a.sent();
                returnValue = { error: "Rename not available for " + name };
                return [2 /*return*/, returnValue];
        }
    });
}); };
var refreshAllTagsOnInfluxDB = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    var error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, checkInitReady(adapter)];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 5, , 6]);
                if (!adapter.config.InfluxDBHandlerAdapter_active) return [3 /*break*/, 4];
                return [4 /*yield*/, LabelBucketHandler_1["default"].updateAll(adapter)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [2 /*return*/, 'ok'];
            case 5:
                error_5 = _a.sent();
                return [2 /*return*/, { error: "" + error_5 }];
            case 6: return [2 /*return*/];
        }
    });
}); };
var InfluxDBHandlerAdapter = {
    name: name,
    init: init,
    isHealth: isHealth,
    onMessageFunc: {
        rename: rename,
        refreshAllTagsOnInfluxDB: refreshAllTagsOnInfluxDB,
        testInfluxDBConnectionWithToken: testInfluxDBConnectionWithToken,
        getHealthStati: getHealthStati
    },
    influxDBExportFunc: {
        deleteBucket: deleteBucket,
        createBucketIfNeeded: createBucketIfNeeded,
        getBucketWriteApi: getBucketWriteApi,
        writeBatteryPoints: BatteryBucketHandler_1["default"].writePoints,
        getHealthStati: getHealthStati,
        checkInitReady: checkInitReady
    }
};
exports["default"] = InfluxDBHandlerAdapter;
