"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BatteryBucketHandler_1 = __importDefault(require("../../adapters/influxDBHandlerAdapter/BatteryBucketHandler"));
const adapterUtilsFunctions_1 = __importDefault(require("../../utils/adapterUtils/adapterUtilsFunctions"));
const InfluxDBPointsHelper_1 = __importDefault(require("../../utils/adapterUtils/InfluxDBPointsHelper"));
let _adapter;
let _TIMER;
const batteryStatiObjectName = 'batteryStati';
let _BATTERYSTATI = [];
const initBatteryChecker = async () => {
    return;
};
const stopBatteryChecker = async () => {
    return;
};
const _calculateStati = async () => {
    if (!_adapter.config.BatteryChecker_active)
        return;
    const allObj = await _adapter.getForeignObjectsAsync('*', 'state');
    const filteredBattObjBoolean = Object.values(allObj).filter((obj) => {
        var _a;
        return ((_a = obj === null || obj === void 0 ? void 0 : obj.common) === null || _a === void 0 ? void 0 : _a.role) &&
            _adapter.config.BatteryChecker_roles.includes(obj.common.role) &&
            (obj === null || obj === void 0 ? void 0 : obj.common.type) === 'boolean';
    });
    const filteredBattObjNumber = Object.values(allObj).filter((obj) => {
        var _a;
        return ((_a = obj === null || obj === void 0 ? void 0 : obj.common) === null || _a === void 0 ? void 0 : _a.role) &&
            _adapter.config.BatteryChecker_roles.includes(obj.common.role) &&
            (obj === null || obj === void 0 ? void 0 : obj.common.type) === 'number';
    });
    const mergedBattObj = [...filteredBattObjBoolean, ...filteredBattObjNumber];
    _BATTERYSTATI = [];
    const tagsValue = [];
    for (const obj of Object.values(mergedBattObj)) {
        if (obj) {
            const tmpState = await _adapter.getForeignStateAsync(obj._id);
            try {
                const tags = await InfluxDBPointsHelper_1.default.createTagType(_adapter, obj);
                const state = tmpState && tmpState.val && (typeof tmpState.val === 'number' || typeof tmpState.val === 'boolean')
                    ? tmpState.val
                    : 0;
                _BATTERYSTATI.push({ ...tags, ...{ value: state } });
                tagsValue.push({ tags: tags, value: state });
            }
            catch (error) { }
        }
    }
    await BatteryBucketHandler_1.default.writePoints(_adapter, tagsValue);
    await _adapter.setStateChangedAsync(batteryStatiObjectName, JSON.stringify(_BATTERYSTATI), true);
};
/**
 * start timer accodring to the time in ms configured in admin
 */
const _timerToStart = async () => {
    try {
        _TIMER = setTimeout(() => _timerToStart(), _adapter.config.BatteryChecker_timerMS);
        await _calculateStati();
    }
    catch (error) {
        console.error(`unknown error: ${error}`);
        throw error;
    }
};
const onReady = async () => {
    _adapter.log.silly('BatteryChecker::onReady');
    await adapterUtilsFunctions_1.default.checkIFStartable(_adapter);
    if (!_adapter.config.BatteryChecker_active)
        return;
    await _adapter.setObjectNotExistsAsync(batteryStatiObjectName, {
        type: 'config',
        common: {
            name: 'BatteryStatiObjectName',
            type: 'string',
            role: 'meta.config',
            desc: 'this meta datas are used for the adapter to handle all the battery stati',
            read: true,
            write: false,
        },
        native: {},
    });
    try {
        _timerToStart();
    }
    catch (error) {
        console.error(`unknown error: ${error}`);
        _adapter.log.error(`unknown error: ${error}`);
    }
};
const onMessage = async (obj) => {
    _adapter.log.silly('BatteryChecker::onMessage');
    if (typeof obj === 'object') {
        if (obj.command == 'BatteryChecker:refreshStatistics' && obj.callback) {
            try {
                if (_adapter.config.BatteryChecker_active) {
                    await _calculateStati();
                }
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
    _adapter.log.silly('BatteryChecker::onUnload');
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
const BatteryChecker = {
    init: init,
    stopBatteryChecker: stopBatteryChecker,
    initBatteryChecker: initBatteryChecker,
};
exports.default = BatteryChecker;
//# sourceMappingURL=index.js.map