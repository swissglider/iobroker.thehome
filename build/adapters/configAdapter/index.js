"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = __importDefault(require("./functions"));
let _adapter;
const onReady = async () => {
    _adapter.log.silly('ConfigAdapter::onReady');
};
const onMessage = async (obj) => {
    _adapter.log.silly('ConfigAdapter::onMessage');
    // if (typeof obj === 'object' && obj.message) {
    if (typeof obj === 'object') {
        if (obj.command == 'ConfigAdapter:configDownload') {
            if (obj.callback) {
                const t1 = await functions_1.default.configDownload(_adapter);
                _adapter.sendTo(obj.from, obj.command, t1, obj.callback);
            }
        }
        if (obj.command == 'ConfigAdapter:configUpload') {
            if (obj.callback && typeof obj.message !== 'string' && 'config' in obj.message && 'type' in obj.message) {
                const config = obj.message.config;
                const result = await functions_1.default.configUpload(_adapter, config);
                _adapter.sendTo(obj.from, obj.command, result, obj.callback);
            }
        }
        if (obj.command == 'upload:object:configuration::send') {
            if (obj.callback) {
                _adapter.sendTo(obj.from, obj.command, 'Message from upload:object:configuration::send', obj.callback);
            }
        }
        if (obj.command == 'upload:object:configuration::test1') {
            if (obj.callback) {
                _adapter.log.warn('upload:object:configuration::test1');
                _adapter.log.info(JSON.stringify(obj.message));
                _adapter.sendTo(obj.from, obj.command, 'From sendTo test1', obj.callback);
            }
        }
    }
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const onStateChange = async (id, state) => {
    _adapter.log.silly('ConfigAdapter::onStateChange');
    if (state) {
        // The state was changed
        _adapter.log.silly(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
    }
    else {
        // The state was deleted
        _adapter.log.silly(`state ${id} deleted`);
    }
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const onObjectChange = async (id, obj) => {
    _adapter.log.silly('ConfigAdapter::onObjectChange');
    if (obj) {
        // The object was changed
        _adapter.log.silly(`object ${id} changed: ${JSON.stringify(obj)}`);
        // AdapterCreators.enumChanged(this, id, obj);
    }
    else {
        // The object was deleted
        _adapter.log.silly(`object ${id} deleted`);
    }
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const onUnload = async (callback) => {
    _adapter.log.silly('ConfigAdapter::unload');
    try {
        // Here you must clear all timeouts or intervals that may still be active
        // clearTimeout(timeout1);
        // clearTimeout(timeout2);
        // ...
        // clearInterval(interval1);
        callback();
    }
    catch (e) {
        callback();
    }
};
const init = (adapter) => {
    _adapter = adapter;
    _adapter.on('ready', onReady);
    _adapter.on('message', onMessage);
    // _adapter.on('stateChange', onStateChange);
    // _adapter.on('objectChange', onObjectChange);
    // _adapter.on('unload', onUnload);
};
const ConfigAdapter = {
    init: init,
};
exports.default = ConfigAdapter;
//# sourceMappingURL=index.js.map