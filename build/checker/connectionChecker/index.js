"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adapterUtilsFunctions_1 = __importDefault(require("../../utils/adapterUtils/adapterUtilsFunctions"));
let _adapter;
let _TIMER;
const initConnectionChecker = async () => {
    return;
};
const stopConnectionChecker = async () => {
    return;
};
/**
 * start timer accodring to the time in ms configured in admin
 */
const _timerToStart = async () => {
    try {
        _TIMER = setTimeout(() => _timerToStart(), _adapter.config.ConnectionChecker_timerMS);
    }
    catch (error) {
        console.error(`unknown error: ${error}`);
        throw error;
    }
};
const onReady = async () => {
    _adapter.log.silly('ConnectionChecker::onReady');
    await adapterUtilsFunctions_1.default.checkIFStartable(_adapter);
    if (_adapter.config.ConnectionChecker_disabled)
        return;
    try {
        _timerToStart();
    }
    catch (error) {
        console.error(`unknown error: ${error}`);
        _adapter.log.error(`unknown error: ${error}`);
    }
};
const onMessage = async (obj) => {
    _adapter.log.silly('ConnectionChecker::onMessage');
    if (typeof obj === 'object') {
        if (obj.command == 'ConnectionChecker:getStatistics' && obj.callback) {
            try {
                if (!_adapter.config.ConnectionChecker_disabled)
                    console.log('do what is needed');
                _adapter.sendTo(obj.from, obj.command, 'ok', obj.callback);
            }
            catch (error) {
                _adapter.log.error(`unknown error on ${obj.command}: ${error}`);
                _adapter.sendTo(obj.from, obj.command, `unknown error on ${obj.command}: ${error}`, obj.callback);
            }
        }
    }
};
const onUnload = async () => {
    _adapter.log.silly('ConnectionChecker::onUnload');
    if (_TIMER) {
        clearTimeout(_TIMER);
    }
};
const init = (adapter) => {
    _adapter = adapter;
    _adapter.on('ready', onReady);
    _adapter.on('message', onMessage);
    _adapter.on('unload', onUnload);
};
const ConnectionChecker = {
    init: init,
    stopConnectionChecker: stopConnectionChecker,
    initConnectionChecker: initConnectionChecker,
};
exports.default = ConnectionChecker;
//# sourceMappingURL=index.js.map