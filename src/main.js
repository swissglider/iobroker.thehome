"use strict";
/*
 * Created with @iobroker/create-adapter v1.34.1
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var _a, _b;
exports.__esModule = true;
// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
var utils = require("@iobroker/adapter-core");
var configAdapter_1 = require("./adapters/configAdapter");
var batteryChecker_1 = require("./checker/batteryChecker");
var connectionChecker_1 = require("./checker/connectionChecker");
var dasWetterAdapter_1 = require("./iobAdapterHandler/dasWetterAdapter");
var hmipAdapter_1 = require("./iobAdapterHandler/hmipAdapter");
var hueAdapter_1 = require("./iobAdapterHandler/hueAdapter");
var influxDBHandlerAdapter_1 = require("./iobAdapterHandler/influxDBHandlerAdapter");
var jeelinkAdapter_1 = require("./iobAdapterHandler/jeelinkAdapter");
var miNameAdapter_1 = require("./iobAdapterHandler/miNameAdapter");
var netatmoAdapter_1 = require("./iobAdapterHandler/netatmoAdapter");
var shellyAdapter_1 = require("./iobAdapterHandler/shellyAdapter");
var sonoffAdapter_1 = require("./iobAdapterHandler/sonoffAdapter");
var swissWeahterApiAdapter_1 = require("./iobAdapterHandler/swissWeahterApiAdapter");
var weatherUndergroundAdapter_1 = require("./iobAdapterHandler/weatherUndergroundAdapter");
var configChangeListener_1 = require("./listener/configChangeListener");
var adapterUtilsFunctions_1 = require("./utils/adapterUtils/adapterUtilsFunctions");
var errMsgNoAdaptName = { error: 'no adapter mentioned' };
var errMsgAdaptNotInit = { error: 'adapter not correct initialized' };
var errMsgStringAndID = { error: 'config must be a id on the object' };
var iobAdapterHandler = (_a = {},
    _a[influxDBHandlerAdapter_1["default"].name] = influxDBHandlerAdapter_1["default"],
    _a[miNameAdapter_1["default"].name] = miNameAdapter_1["default"],
    _a[netatmoAdapter_1["default"].name] = netatmoAdapter_1["default"],
    _a[hmipAdapter_1["default"].name] = hmipAdapter_1["default"],
    _a[shellyAdapter_1["default"].name] = shellyAdapter_1["default"],
    _a[sonoffAdapter_1["default"].name] = sonoffAdapter_1["default"],
    _a[weatherUndergroundAdapter_1["default"].name] = weatherUndergroundAdapter_1["default"],
    _a[swissWeahterApiAdapter_1["default"].name] = swissWeahterApiAdapter_1["default"],
    _a[dasWetterAdapter_1["default"].name] = dasWetterAdapter_1["default"],
    _a[jeelinkAdapter_1["default"].name] = jeelinkAdapter_1["default"],
    _a[hueAdapter_1["default"].name] = hueAdapter_1["default"],
    _a);
var subAdapters = (_b = {},
    _b[configChangeListener_1["default"].name] = configChangeListener_1["default"],
    _b[configAdapter_1["default"].name] = configAdapter_1["default"],
    _b[batteryChecker_1["default"].name] = batteryChecker_1["default"],
    _b[connectionChecker_1["default"].name] = connectionChecker_1["default"],
    _b);
var Thehome = /** @class */ (function (_super) {
    __extends(Thehome, _super);
    function Thehome(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, __assign(__assign({}, options), { name: 'thehome' })) || this;
        _this.on('message', _this.onMessage.bind(_this));
        _this.on('ready', _this.onReady.bind(_this));
        _this.on('unload', _this.onUnload.bind(_this));
        // init all the subAdapters
        for (var _i = 0, _a = Object.values(subAdapters); _i < _a.length; _i++) {
            var subAdapter = _a[_i];
            if (subAdapter.init) {
                subAdapter.init(_this);
            }
        }
        return _this;
    }
    /**
     * Is called when databases are connected and adapter received configuration.
     */
    Thehome.prototype.onReady = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, adapt;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, adapterUtilsFunctions_1["default"].checkIFStartable(this)];
                    case 1:
                        _b.sent();
                        _i = 0, _a = Object.values(iobAdapterHandler);
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        adapt = _a[_i];
                        if (!adapt.init) return [3 /*break*/, 4];
                        return [4 /*yield*/, adapt.init(this)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        this.subscribeForeignObjects('*', 'state');
                        this.subscribeForeignObjects('*', 'channel');
                        this.subscribeForeignObjects('*', 'device');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    Thehome.prototype.onUnload = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, adapt;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.unsubscribeForeignObjects('*', 'state');
                        this.unsubscribeForeignObjects('*', 'channel');
                        this.unsubscribeForeignObjects('*', 'device');
                        _i = 0, _a = Object.values(iobAdapterHandler);
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        adapt = _a[_i];
                        if (!adapt.destroy) return [3 /*break*/, 3];
                        return [4 /*yield*/, adapt.destroy(this)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
    // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
    // /**
    //  * Is called if a subscribed object changes
    //  */
    Thehome.prototype.onObjectChange = function (id, obj) {
        this.log.silly('Main::onObjectChange');
        if (obj) {
            // The object was changed
            this.log.info("object " + id + " changed: " + JSON.stringify(obj));
        }
        else {
            // The object was deleted
            this.log.info("object " + id + " deleted");
        }
    };
    /**
     * Is called if a subscribed state changes
     */
    Thehome.prototype.onStateChange = function (id, state) {
        if (state) {
            // The state was changed
            this.log.info("state " + id + " changed: " + state.val + " (ack = " + state.ack + ")");
        }
        else {
            // The state was deleted
            this.log.info("state " + id + " deleted");
        }
    };
    // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
    /**
     * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
     * Using this method requires "common.messagebox" property to be set to true in io-package.json
     */
    Thehome.prototype.onMessage = function (obj) {
        return __awaiter(this, void 0, void 0, function () {
            var checkStringAndMsgID, proceedStandardBooleanAndEndAdapterFunction, handleError, msg, _a, en, en1, adaptName, adpater, returnResult, error_1, error_2;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        checkStringAndMsgID = function () {
                            if (!(typeof obj.message !== 'string' && 'id' in obj.message)) {
                                _this.sendTo(obj.from, obj.command, errMsgStringAndID, obj.callback);
                            }
                        };
                        proceedStandardBooleanAndEndAdapterFunction = function (func) { return __awaiter(_this, void 0, void 0, function () {
                            var result;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(typeof obj.message !== 'string' && 'adapterName' in obj.message)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, func(this, obj.message.adapterName, obj.message)];
                                    case 1:
                                        result = _a.sent();
                                        this.sendTo(obj.from, obj.command, result ? 'ok' : 'nok', obj.callback);
                                        return [3 /*break*/, 3];
                                    case 2:
                                        this.sendTo(obj.from, obj.command, errMsgNoAdaptName, obj.callback);
                                        _a.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); };
                        handleError = function (error) {
                            var errorMsg = '';
                            if (error.message) {
                                errorMsg = error.message;
                            }
                            else {
                                errorMsg = "" + error;
                            }
                            _this.sendTo(obj.from, obj.command, { error: errorMsg }, obj.callback);
                        };
                        msg = obj.message;
                        if (!(typeof obj === 'object')) return [3 /*break*/, 23];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 22, , 23]);
                        _a = obj.command;
                        switch (_a) {
                            case 'init': return [3 /*break*/, 2];
                            case 'getObjectWithEnums': return [3 /*break*/, 3];
                            case 'getObjectWithoutEnums': return [3 /*break*/, 5];
                            case 'isAdapterInstalled': return [3 /*break*/, 7];
                            case 'isAdapterRunning': return [3 /*break*/, 9];
                            case 'isAdapterConnected': return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 13];
                    case 2:
                        this.sendTo(obj.from, obj.command, { error: 'init not allowed' }, obj.callback);
                        return [3 /*break*/, 21];
                    case 3:
                        checkStringAndMsgID();
                        return [4 /*yield*/, this.getForeignObjectsAsync(msg.id, 'state', ['rooms', 'functions'])];
                    case 4:
                        en = _b.sent();
                        this.sendTo(obj.from, obj.command, Object.values(en)[0], obj.callback);
                        return [3 /*break*/, 21];
                    case 5:
                        checkStringAndMsgID();
                        return [4 /*yield*/, this.getForeignObjectsAsync(msg.id, 'state')];
                    case 6:
                        en1 = _b.sent();
                        this.sendTo(obj.from, obj.command, Object.values(en1)[0], obj.callback);
                        return [3 /*break*/, 21];
                    case 7: return [4 /*yield*/, proceedStandardBooleanAndEndAdapterFunction(adapterUtilsFunctions_1["default"].isAdapterInstalled)];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 21];
                    case 9: return [4 /*yield*/, proceedStandardBooleanAndEndAdapterFunction(adapterUtilsFunctions_1["default"].isAdapterRunning)];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 21];
                    case 11: return [4 /*yield*/, proceedStandardBooleanAndEndAdapterFunction(adapterUtilsFunctions_1["default"].isAdapterConnected)];
                    case 12:
                        _b.sent();
                        return [3 /*break*/, 21];
                    case 13:
                        if (!(typeof obj.message !== 'string' && 'adapterName' in obj.message)) return [3 /*break*/, 20];
                        adaptName = msg.adapterName;
                        adpater = iobAdapterHandler[adaptName];
                        if (!(adpater && adpater.onMessageFunc && obj.command in adpater.onMessageFunc)) return [3 /*break*/, 18];
                        _b.label = 14;
                    case 14:
                        _b.trys.push([14, 16, , 17]);
                        return [4 /*yield*/, adpater.onMessageFunc[obj.command](this, msg)];
                    case 15:
                        returnResult = _b.sent();
                        this.sendTo(obj.from, obj.command, returnResult, obj.callback);
                        return [3 /*break*/, 17];
                    case 16:
                        error_1 = _b.sent();
                        handleError(error_1);
                        return [3 /*break*/, 17];
                    case 17: return [3 /*break*/, 19];
                    case 18:
                        this.sendTo(obj.from, obj.command, errMsgAdaptNotInit, obj.callback);
                        _b.label = 19;
                    case 19: return [3 /*break*/, 21];
                    case 20:
                        this.sendTo(obj.from, obj.command, errMsgNoAdaptName, obj.callback);
                        _b.label = 21;
                    case 21: return [3 /*break*/, 23];
                    case 22:
                        error_2 = _b.sent();
                        this.log.error("" + error_2);
                        this.sendTo(obj.from, obj.command, { error: "" + error_2 }, obj.callback);
                        return [3 /*break*/, 23];
                    case 23: return [2 /*return*/];
                }
            });
        });
    };
    return Thehome;
}(utils.Adapter));
if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = function (options) { return new Thehome(options); };
}
else {
    // otherwise start the instance directly
    (function () { return new Thehome(); })();
}
