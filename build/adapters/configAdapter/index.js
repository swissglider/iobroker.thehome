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
const checkInitReadyUtil = __importStar(require("../../utils/adapterUtils/checkInitReady"));
const useCases_1 = __importDefault(require("./useCases"));
const _STATUS = {
    _adapter: undefined,
    _isReady: 'nok',
    _name: 'ConfigAdapter',
};
const _getAdapter = () => {
    if (_STATUS._adapter)
        return _STATUS._adapter;
    throw new Error('Adapter not set, probably not correct initialized');
};
const _initConfigAdapter = async () => {
    _STATUS._isReady = 'ok';
};
const checkInitReady = async (adapter) => {
    if (!adapter)
        adapter = _getAdapter();
    await checkInitReadyUtil.default(adapter, _STATUS, _initConfigAdapter);
};
const onReady = async () => {
    _getAdapter().log.silly('ConfigAdapter::onReady');
    await checkInitReady();
};
const onMessage = async (obj) => {
    _getAdapter().log.silly('ConfigAdapter::onMessage');
    await checkInitReady();
    // if (typeof obj === 'object' && obj.message) {
    try {
        if (typeof obj === 'object') {
            if (obj.command == 'ConfigAdapter:statesConfigDownload') {
                if (obj.callback) {
                    const t1 = await useCases_1.default.statesConfigDownload(_getAdapter());
                    _getAdapter().sendTo(obj.from, obj.command, t1, obj.callback);
                }
            }
        }
        if (obj.command == 'ConfigAdapter:statesConfigUpload') {
            if (obj.callback && typeof obj.message !== 'string' && 'config' in obj.message) {
                const config = obj.message.config;
                const result = await useCases_1.default.statesConfigUpload(_getAdapter(), config);
                _getAdapter().sendTo(obj.from, obj.command, result, obj.callback);
            }
        }
        if (obj.command == 'ConfigAdapter:singleStateConfigUpload') {
            if (obj.callback && typeof obj.message !== 'string' && 'config' in obj.message) {
                const config = obj.message.config;
                const result = await useCases_1.default.singleStateConfigUpload(_getAdapter(), config);
                _getAdapter().sendTo(obj.from, obj.command, result, obj.callback);
            }
        }
    }
    catch (error) {
        _getAdapter().log.error(`unknown error on ${obj.command}: ${error}`);
        _getAdapter().sendTo(obj.from, obj.command, `unknown error on ${obj.command}: ${error}`, obj.callback);
    }
};
const init = (adapter) => {
    _STATUS._adapter = adapter;
    _getAdapter().on('ready', onReady);
    _getAdapter().on('message', onMessage);
};
const ConfigAdapter = {
    name: 'ConfigAdapter',
    init: init,
    exportFunc: {},
};
exports.default = ConfigAdapter;
//# sourceMappingURL=index.js.map