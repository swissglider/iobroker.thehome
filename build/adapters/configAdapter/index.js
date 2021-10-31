"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adapterUtilsFunctions_1 = __importDefault(require("../../utils/adapterUtils/adapterUtilsFunctions"));
const useCases_1 = __importDefault(require("./useCases"));
let _adapter;
const onReady = async () => {
    _adapter.log.silly('ConfigAdapter::onReady');
    await adapterUtilsFunctions_1.default.checkIFStartable(_adapter);
};
const onMessage = async (obj) => {
    _adapter.log.silly('ConfigAdapter::onMessage');
    // if (typeof obj === 'object' && obj.message) {
    try {
        if (typeof obj === 'object') {
            if (obj.command == 'ConfigAdapter:statesConfigDownload') {
                if (obj.callback) {
                    const t1 = await useCases_1.default.statesConfigDownload(_adapter);
                    _adapter.sendTo(obj.from, obj.command, t1, obj.callback);
                }
            }
        }
        if (obj.command == 'ConfigAdapter:statesConfigUpload') {
            if (obj.callback && typeof obj.message !== 'string' && 'config' in obj.message) {
                const config = obj.message.config;
                const result = await useCases_1.default.statesConfigUpload(_adapter, config);
                _adapter.sendTo(obj.from, obj.command, result, obj.callback);
            }
        }
        if (obj.command == 'ConfigAdapter:singleStateConfigUpload') {
            if (obj.callback && typeof obj.message !== 'string' && 'config' in obj.message) {
                const config = obj.message.config;
                const result = await useCases_1.default.singleStateConfigUpload(_adapter, config);
                _adapter.sendTo(obj.from, obj.command, result, obj.callback);
            }
        }
    }
    catch (error) {
        _adapter.log.error(`unknown error on ${obj.command}: ${error}`);
        _adapter.sendTo(obj.from, obj.command, `unknown error on ${obj.command}: ${error}`, obj.callback);
    }
};
const init = (adapter) => {
    _adapter = adapter;
    _adapter.on('ready', onReady);
    _adapter.on('message', onMessage);
};
const ConfigAdapter = {
    init: init,
};
exports.default = ConfigAdapter;
//# sourceMappingURL=index.js.map