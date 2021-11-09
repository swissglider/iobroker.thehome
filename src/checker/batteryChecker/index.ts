import InfluxDBHandlerAdapter from '../../adapters/influxDBHandlerAdapter';
import CheckerTimer from '../../utils/adapterUtils/checkerTimer';
import * as checkInitReadyUtil from '../../utils/adapterUtils/checkInitReady';
import InfluxDBPointsHelper from '../../utils/adapterUtils/InfluxDBPointsHelper';
import { T_STATUS } from '../../utils/types/T_IOBAdapter_Handler';
import { T_SubAdapter } from '../../utils/types/T_SubAdapter';
import { T_TAGS_TYPE } from '../../utils/types/T_TAGS_TYPE';

type T_BATTERY_STATI_TYPE = T_TAGS_TYPE & { value: boolean | number | string };

const NAME = 'BatteryChecker';
const batteryStatiObjectName = 'batteryStati';
const _STATUS: T_STATUS = {
	_adapter: undefined,
	_isReady: 'nok',
	_name: 'BatteryChecker',
};

const _getAdapter = (): ioBroker.Adapter => {
	if (_STATUS._adapter) return _STATUS._adapter;
	throw new Error('Adapter not set, probably not correct initialized');
};

const _calculateStati = async (): Promise<void> => {
	if (!_getAdapter().config.BatteryChecker_active) return;
	const allObj = await _getAdapter().getForeignObjectsAsync('*', 'state');
	const filteredBattObjBoolean = Object.values(allObj).filter(
		(obj) =>
			obj?.common?.role &&
			_getAdapter().config.BatteryChecker_roles.includes(obj.common.role) &&
			obj?.common.type === 'boolean',
	);
	const filteredBattObjNumber = Object.values(allObj).filter(
		(obj) =>
			obj?.common?.role &&
			_getAdapter().config.BatteryChecker_roles.includes(obj.common.role) &&
			obj?.common.type === 'number',
	);
	const mergedBattObj = [...filteredBattObjBoolean, ...filteredBattObjNumber];
	const batteryStati: T_BATTERY_STATI_TYPE[] = [];
	const tagsValue: { tags: T_TAGS_TYPE; value: boolean | number | string }[] = [];
	for (const obj of Object.values(mergedBattObj)) {
		if (obj) {
			const tmpState = await _getAdapter().getForeignStateAsync((obj as ioBroker.StateObject)._id);
			try {
				const tags: T_TAGS_TYPE = await InfluxDBPointsHelper.createTagType(
					_getAdapter(),
					obj as ioBroker.StateObject,
				);
				const state =
					tmpState && tmpState.val && (typeof tmpState.val === 'number' || typeof tmpState.val === 'boolean')
						? tmpState.val
						: 0;
				batteryStati.push({ ...tags, ...{ value: state } });
				tagsValue.push({ tags: tags, value: state });
			} catch (error) {}
		}
	}
	await InfluxDBHandlerAdapter.influxDBExportFunc.writeBatteryPoints(_getAdapter(), tagsValue);
	await _getAdapter().setStateChangedAsync(batteryStatiObjectName, JSON.stringify(batteryStati), true);
};

const _initBatteryChecker = async (): Promise<void> => {
	_getAdapter().log.silly('BatteryChecker::onReady');
	_STATUS._isReady = 'processing';
	if (!_getAdapter().config.BatteryChecker_active) return;
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
		CheckerTimer.startTimer(NAME, _getAdapter().config.BatteryChecker_timerMS, _calculateStati);
	} catch (error) {
		console.error(`unknown error: ${error}`);
		_STATUS._isReady = 'nok';
		_getAdapter().log.error(`unknown error: ${error}`);
	}
};

const checkInitReady = async (adapter?: ioBroker.Adapter): Promise<void> => {
	if (!adapter) adapter = _getAdapter();
	await checkInitReadyUtil.default(adapter, _STATUS, _initBatteryChecker);
};

const onReady = async (): Promise<void> => {
	_getAdapter().log.silly('BatteryChecker::onReady');
	await checkInitReady();
};

const initBatteryChecker = async (): Promise<void> => {
	await checkInitReady();
};

const stopBatteryChecker = async (): Promise<void> => {
	await checkInitReady();
};

const onMessage = async (obj: ioBroker.Message): Promise<void> => {
	_getAdapter().log.silly('BatteryChecker::onMessage');
	await checkInitReady();
	if (typeof obj === 'object') {
		if (obj.command == 'BatteryChecker:refreshStatistics' && obj.callback) {
			try {
				if (_getAdapter().config.BatteryChecker_active) {
					await _calculateStati();
				}
				_getAdapter().sendTo(obj.from, obj.command, 'ok', obj.callback);
			} catch (error) {
				_getAdapter().log.error(`unknown error on ${obj.command}: ${error}`);
				_getAdapter().sendTo(obj.from, obj.command, `unknown error on ${obj.command}: ${error}`, obj.callback);
			}
		}
	}
};

const onUnload = async (): Promise<void> => {
	_getAdapter().log.silly('BatteryChecker::onUnload');
	CheckerTimer.stopTimer(NAME);
};

const init = (adapter: ioBroker.Adapter): void => {
	_STATUS._adapter = adapter;
	_getAdapter().on('ready', onReady);
	_getAdapter().on('message', onMessage);
	_getAdapter().on('unload', onUnload);
};

const BatteryChecker: T_SubAdapter = {
	name: NAME,
	init: init,
	exportFunc: { stopBatteryChecker: stopBatteryChecker, initBatteryChecker: initBatteryChecker },
};

export default BatteryChecker;
