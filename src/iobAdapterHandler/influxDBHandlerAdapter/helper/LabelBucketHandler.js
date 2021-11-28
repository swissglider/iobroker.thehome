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
var __1 = require("..");
var InfluxDBPointsHelper_1 = require("../../../utils/adapterUtils/InfluxDBPointsHelper");
var _STATUS = {
    writeApi: undefined,
    influxName: '',
    _isReady: 'nok',
    _name: 'LabelBucketHandler'
};
var deleteBucket = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, __1["default"].influxDBExportFunc.deleteBucket(adapter, adapter.config.InfluxDBHandlerAdapter_bucketLabels)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var _updateAllLabels = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    var tmpoAllObjects, points, _i, _a, obj, tags, error_1;
    var _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 9, , 10]);
                return [4 /*yield*/, deleteBucket(adapter)];
            case 1:
                _e.sent();
                return [4 /*yield*/, __1["default"].influxDBExportFunc.createBucketIfNeeded(adapter, adapter.config.InfluxDBHandlerAdapter_bucketLabels, 'Created by Swissglider:TheHome Adapter for taged based Measurements')];
            case 2:
                _e.sent();
                return [4 /*yield*/, adapter.getForeignObjectsAsync('*')];
            case 3:
                tmpoAllObjects = _e.sent();
                points = [];
                _i = 0, _a = Object.values(tmpoAllObjects);
                _e.label = 4;
            case 4:
                if (!(_i < _a.length)) return [3 /*break*/, 7];
                obj = _a[_i];
                if (!(obj.common.custom && ((_b = obj.common.custom[_STATUS.influxName]) === null || _b === void 0 ? void 0 : _b.enabled) === true)) return [3 /*break*/, 6];
                return [4 /*yield*/, InfluxDBPointsHelper_1["default"].createTagType(adapter, obj)];
            case 5:
                tags = _e.sent();
                points.push(InfluxDBPointsHelper_1["default"].createPointFromTags(tags, 'tags'));
                _e.label = 6;
            case 6:
                _i++;
                return [3 /*break*/, 4];
            case 7:
                (_c = _STATUS.writeApi) === null || _c === void 0 ? void 0 : _c.writePoints(points);
                return [4 /*yield*/, ((_d = _STATUS.writeApi) === null || _d === void 0 ? void 0 : _d.flush())];
            case 8:
                _e.sent();
                return [3 /*break*/, 10];
            case 9:
                error_1 = _e.sent();
                console.error(error_1);
                throw error_1;
            case 10: return [2 /*return*/];
        }
    });
}); };
var initInfluxDB = function (adapter, influxName) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _STATUS._isReady = 'processing';
                _STATUS.influxName = influxName;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                _a = _STATUS;
                return [4 /*yield*/, __1["default"].influxDBExportFunc.getBucketWriteApi(adapter, adapter.config.InfluxDBHandlerAdapter_bucketLabels)];
            case 2:
                _a.writeApi = _b.sent();
                return [4 /*yield*/, _updateAllLabels(adapter)];
            case 3:
                _b.sent();
                _STATUS._isReady = 'ok';
                return [3 /*break*/, 5];
            case 4:
                error_2 = _b.sent();
                throw error_2;
            case 5: return [2 /*return*/];
        }
    });
}); };
var updateAll = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, __1["default"].influxDBExportFunc.checkInitReady(adapter)];
            case 1:
                _a.sent();
                return [4 /*yield*/, __1["default"].isHealth(adapter)];
            case 2:
                if (!_a.sent()) return [3 /*break*/, 4];
                return [4 /*yield*/, _updateAllLabels(adapter)];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4: throw new Error('InfluxDB Adapter not correct initialized: do you have set the Toker and saved ?');
            case 5: return [2 /*return*/];
        }
    });
}); };
var LabelBucketHandler = {
    initInfluxDB: initInfluxDB,
    deleteBucket: deleteBucket,
    updateAll: updateAll
};
exports["default"] = LabelBucketHandler;
