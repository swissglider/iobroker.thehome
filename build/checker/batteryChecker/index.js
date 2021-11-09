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
const influxDBHandlerAdapter_1 = __importDefault(require("../../adapters/influxDBHandlerAdapter"));
const checkerTimer_1 = __importDefault(require("../../utils/adapterUtils/checkerTimer"));
const checkInitReadyUtil = __importStar(require("../../utils/adapterUtils/checkInitReady"));
const InfluxDBPointsHelper_1 = __importDefault(require("../../utils/adapterUtils/InfluxDBPointsHelper"));
const NAME = 'BatteryChecker';
const batteryStatiObjectName = 'batteryStati';
const _STATUS = {
    _adapter: undefined,
    _isReady: 'nok',
    _name: 'BatteryChecker',
};
const _getAdapter = () => {
    if (_STATUS._adapter)
        return _STATUS._adapter;
    throw new Error('Adapter not set, probably not correct initialized');
};
const _calculateStati = async () => {
    if (!_getAdapter().config.BatteryChecker_active)
        return;
    const allObj = await _getAdapter().getForeignObjectsAsync('*', 'state');
    const filteredBattObjBoolean = Object.values(allObj).filter((obj) => {
        var _a;
        return ((_a = obj === null || obj === void 0 ? void 0 : obj.common) === null || _a === void 0 ? void 0 : _a.role) &&
            _getAdapter().config.BatteryChecker_roles.includes(obj.common.role) &&
            (obj === null || obj === void 0 ? void 0 : obj.common.type) === 'boolean';
    });
    const filteredBattObjNumber = Object.values(allObj).filter((obj) => {
        var _a;
        return ((_a = obj === null || obj === void 0 ? void 0 : obj.common) === null || _a === void 0 ? void 0 : _a.role) &&
            _getAdapter().config.BatteryChecker_roles.includes(obj.common.role) &&
            (obj === null || obj === void 0 ? void 0 : obj.common.type) === 'number';
    });
    const mergedBattObj = [...filteredBattObjBoolean, ...filteredBattObjNumber];
    const batteryStati = [];
    const tagsValue = [];
    for (const obj of Object.values(mergedBattObj)) {
        if (obj) {
            const tmpState = await _getAdapter().getForeignStateAsync(obj._id);
            try {
                const tags = await InfluxDBPointsHelper_1.default.createTagType(_getAdapter(), obj);
                const state = tmpState && tmpState.val && (typeof tmpState.val === 'number' || typeof tmpState.val === 'boolean')
                    ? tmpState.val
                    : 0;
                batteryStati.push({ ...tags, ...{ value: state } });
                tagsValue.push({ tags: tags, value: state });
            }
            catch (error) { }
        }
    }
    await influxDBHandlerAdapter_1.default.influxDBExportFunc.writeBatteryPoints(_getAdapter(), tagsValue);
    await _getAdapter().setStateChangedAsync(batteryStatiObjectName, JSON.stringify(batteryStati), true);
};
const _initBatteryChecker = async () => {
    _getAdapter().log.silly('BatteryChecker::onReady');
    _STATUS._isReady = 'processing';
    if (!_getAdapter().config.BatteryChecker_active)
        return;
    await _getAdapter().setObjectNotExistsAsync(batteryStatiObjectName, {
        type: 'config',
        common: {
            name: batteryStatiObjectName,
            type: 'string',
            role: 'meta.config',
            desc: 'this meta datas are used for the adapter to handle all the battery stati',
            read: true,
            write: false,
        },
        native: {},
    });
    try {
        _STATUS._isReady = 'ok';
        checkerTimer_1.default.startTimer(NAME, _getAdapter().config.BatteryChecker_timerMS, _calculateStati);
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
    await checkInitReadyUtil.default(adapter, _STATUS, _initBatteryChecker);
};
const onReady = async () => {
    _getAdapter().log.silly('BatteryChecker::onReady');
    await checkInitReady();
};
const initBatteryChecker = async () => {
    await checkInitReady();
};
const stopBatteryChecker = async () => {
    await checkInitReady();
};
const onMessage = async (obj) => {
    _getAdapter().log.silly('BatteryChecker::onMessage');
    await checkInitReady();
    if (typeof obj === 'object') {
        if (obj.command == 'BatteryChecker:refreshStatistics' && obj.callback) {
            try {
                if (_getAdapter().config.BatteryChecker_active) {
                    await _calculateStati();
                }
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
    _getAdapter().log.silly('BatteryChecker::onUnload');
    checkerTimer_1.default.stopTimer(NAME);
};
const init = (adapter) => {
    _STATUS._adapter = adapter;
    _getAdapter().on('ready', onReady);
    _getAdapter().on('message', onMessage);
    _getAdapter().on('unload', onUnload);
};
const BatteryChecker = {
    name: NAME,
    init: init,
    exportFunc: { stopBatteryChecker: stopBatteryChecker, initBatteryChecker: initBatteryChecker },
};
exports.default = BatteryChecker;
//# sourceMappingURL=index.js.map