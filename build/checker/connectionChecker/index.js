"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const checkerTimer_1 = __importDefault(require("../../utils/adapterUtils/checkerTimer"));
const checkInitReadyUtil = __importStar(require("../../utils/adapterUtils/checkInitReady"));
const NAME = 'ConnectionChecker';
const _STATUS = {
    _adapter: undefined,
    _isReady: 'nok',
    _name: 'ConnectionChecker',
};
const _getAdapter = () => {
    if (_STATUS._adapter)
        return _STATUS._adapter;
    throw new Error('Adapter not set, probably not correct initialized');
};
const _initConnectionChecker = async () => {
    _getAdapter().log.silly('ConnectionChecker::onReady');
    _STATUS._isReady = 'processing';
    if (_getAdapter().config.ConnectionChecker_disabled)
        return;
    try {
        checkerTimer_1.default.startTimer(NAME, _getAdapter().config.ConnectionChecker_timerMS, () => {
            return;
        });
        _STATUS._isReady = 'ok';
    }
    catch (error) {
        console.error(`unknown error: ${error}`);
        _STATUS._isReady = 'nok';
        _getAdapter().log.error(`unknown error: ${error}`);
    }
};
const checkInitReady = async (adapter) => {
    if (!adapter)
        adapter = _getAdapter();
    await checkInitReadyUtil.default(adapter, _STATUS, _initConnectionChecker);
};
const onReady = async () => {
    _getAdapter().log.silly('ConnectionChecker::onReady');
    await checkInitReady();
};
const initConnectionChecker = async () => {
    await checkInitReady();
};
const stopConnectionChecker = async () => {
    await checkInitReady();
};
const onMessage = async (obj) => {
    _getAdapter().log.silly('ConnectionChecker::onMessage');
    await checkInitReady();
    if (typeof obj === 'object') {
        if (obj.command == 'ConnectionChecker:getStatistics' && obj.callback) {
            try {
                if (!_getAdapter().config.ConnectionChecker_disabled)
                    console.log('do what is needed');
                _getAdapter().sendTo(obj.from, obj.command, 'ok', obj.callback);
            }
            catch (error) {
                _getAdapter().log.error(`unknown error on ${obj.command}: ${error}`);
                _getAdapter().sendTo(obj.from, obj.command, `unknown error on ${obj.command}: ${error}`, obj.callback);
            }
        }
    }
};
const onUnload = async () => {
    _getAdapter().log.silly('ConnectionChecker::onUnload');
    checkerTimer_1.default.stopTimer(NAME);
};
const init = (adapter) => {
    _STATUS._adapter = adapter;
    _getAdapter().on('ready', onReady);
    _getAdapter().on('message', onMessage);
    _getAdapter().on('unload', onUnload);
};
const ConnectionChecker = {
    name: NAME,
    init: init,
    exportFunc: { stopConnectionChecker: stopConnectionChecker, initConnectionChecker: initConnectionChecker },
};
exports.default = ConnectionChecker;
//# sourceMappingURL=index.js.map