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
var checkerTimer_1 = require("../../utils/adapterUtils/checkerTimer");
var checkInitReadyUtil = require("../../utils/adapterUtils/checkInitReady");
var NAME = 'ConnectionChecker';
var _STATUS = {
    _adapter: undefined,
    _isReady: 'nok',
    _name: 'ConnectionChecker'
};
var _getAdapter = function () {
    if (_STATUS._adapter)
        return _STATUS._adapter;
    throw new Error('Adapter not set, probably not correct initialized');
};
var _initConnectionChecker = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        _getAdapter().log.silly('ConnectionChecker::onReady');
        _STATUS._isReady = 'processing';
        if (_getAdapter().config.ConnectionChecker_disabled)
            return [2 /*return*/];
        try {
            checkerTimer_1["default"].startTimer(NAME, _getAdapter().config.ConnectionChecker_timerMS, function () {
                return;
            });
            _STATUS._isReady = 'ok';
        }
        catch (error) {
            console.error("unknown error: " + error);
            _STATUS._isReady = 'nok';
            _getAdapter().log.error("unknown error: " + error);
        }
        return [2 /*return*/];
    });
}); };
var checkInitReady = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!adapter)
                    adapter = _getAdapter();
                return [4 /*yield*/, checkInitReadyUtil["default"](adapter, _STATUS, _initConnectionChecker)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var onReady = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _getAdapter().log.silly('ConnectionChecker::onReady');
                return [4 /*yield*/, checkInitReady()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var initConnectionChecker = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, checkInitReady()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var stopConnectionChecker = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, checkInitReady()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var onMessage = function (obj) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _getAdapter().log.silly('ConnectionChecker::onMessage');
                return [4 /*yield*/, checkInitReady()];
            case 1:
                _a.sent();
                if (typeof obj === 'object') {
                    if (obj.command == 'ConnectionChecker:getStatistics' && obj.callback) {
                        try {
                            if (!_getAdapter().config.ConnectionChecker_disabled)
                                console.log('do what is needed');
                            _getAdapter().sendTo(obj.from, obj.command, 'ok', obj.callback);
                        }
                        catch (error) {
                            _getAdapter().log.error("unknown error on " + obj.command + ": " + error);
                            _getAdapter().sendTo(obj.from, obj.command, "unknown error on " + obj.command + ": " + error, obj.callback);
                        }
                    }
                }
                return [2 /*return*/];
        }
    });
}); };
var onUnload = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        _getAdapter().log.silly('ConnectionChecker::onUnload');
        checkerTimer_1["default"].stopTimer(NAME);
        return [2 /*return*/];
    });
}); };
var init = function (adapter) {
    _STATUS._adapter = adapter;
    _getAdapter().on('ready', onReady);
    _getAdapter().on('message', onMessage);
    _getAdapter().on('unload', onUnload);
};
var ConnectionChecker = {
    name: NAME,
    init: init,
    exportFunc: { stopConnectionChecker: stopConnectionChecker, initConnectionChecker: initConnectionChecker }
};
exports["default"] = ConnectionChecker;
