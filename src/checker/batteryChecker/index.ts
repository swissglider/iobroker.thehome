import BatteryBucketHandler from '../../adapters/influxDBHandlerAdapter/BatteryBucketHandler';
import AdapterUtilsFunctions from '../../utils/adapterUtils/adapterUtilsFunctions';
import InfluxDBPointsHelper from '../../utils/adapterUtils/InfluxDBPointsHelper';
import { T_TAGS_TYPE } from '../../utils/types/T_TAGS_TYPE';

let _adapter: ioBroker.Adapter;
let _TIMER: NodeJS.Timeout | undefined;
const batteryStatiObjectName = 'batteryStati';
type T_BATTERY_STATI_TYPE = T_TAGS_TYPE & { value: boolean | number | string };
let _BATTERYSTATI: T_BATTERY_STATI_TYPE[] = [];

const initBatteryChecker = async (): Promise<void> => {
	return;
};

const stopBatteryChecker = async (): Promise<void> => {
	return;
};

const _calculateStati = async (): Promise<void> => {
	if (!_adapter.config.BatteryChecker_active) return;
	const allObj = await _adapter.getForeignObjectsAsync('*', 'state');
	const filteredBattObjBoolean = Object.values(allObj).filter(
		(obj) =>
			obj?.common?.role &&
			_adapter.config.BatteryChecker_roles.includes(obj.common.role) &&
			obj?.common.type === 'boolean',
	);
	const filteredBattObjNumber = Object.values(allObj).filter(
		(obj) =>
			obj?.common?.role &&
			_adapter.config.BatteryChecker_roles.includes(obj.common.role) &&
			obj?.common.type === 'number',
	);
	const mergedBattObj = [...filteredBattObjBoolean, ...filteredBattObjNumber];
	_BATTERYSTATI = [];
	const tagsValue: { tags: T_TAGS_TYPE; value: boolean | number | string }[] = [];
	for (const obj of Object.values(mergedBattObj)) {
		if (obj) {
			const tmpState = await _adapter.getForeignStateAsync((obj as ioBroker.StateObject)._id);
			try {
				const tags: T_TAGS_TYPE = await InfluxDBPointsHelper.createTagType(
					_adapter,
					obj as ioBroker.StateObject,
				);
				const state =
					tmpState && tmpState.val && (typeof tmpState.val === 'number' || typeof tmpState.val === 'boolean')
						? tmpState.val
						: 0;
				_BATTERYSTATI.push({ ...tags, ...{ value: state } });
				tagsValue.push({ tags: tags, value: state });
			} catch (error) {}
		}
	}
	await BatteryBucketHandler.writePoints(_adapter, tagsValue);
	await _adapter.setStateChangedAsync(batteryStatiObjectName, JSON.stringify(_BATTERYSTATI), true);
};

/**
 * start timer accodring to the time in ms configured in admin
 */
const _timerToStart = async (): Promise<void> => {
	try {
		_TIMER = setTimeout(() => _timerToStart(), _adapter.config.BatteryChecker_timerMS);
		await _calculateStati();
	} catch (error) {
		console.error(`unknown error: ${error}`);
		throw error;
	}
};

const onReady = async (): Promise<void> => {
	_adapter.log.silly('BatteryChecker::onReady');
	await AdapterUtilsFunctions.checkIFStartable(_adapter);
	if (!_adapter.config.BatteryChecker_active) return;
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
	} catch (error) {
		console.error(`unknown error: ${error}`);
		_adapter.log.error(`unknown error: ${error}`);
	}
};

const onMessage = async (obj: ioBroker.Message): Promise<void> => {
	_adapter.log.silly('BatteryChecker::onMessage');
	if (typeof obj === 'object') {
		if (obj.command == 'BatteryChecker:refreshStatistics' && obj.callback) {
			try {
				if (_adapter.config.BatteryChecker_active) {
					await _calculateStati();
				}
				_adapter.sendTo(obj.from, obj.command, 'ok', obj.callback);
			} catch (error) {
				_adapter.log.error(`unknown error on ${obj.command}: ${error}`);
				_adapter.sendTo(obj.from, obj.command, `unknown error on ${obj.command}: ${error}`, obj.callback);
			}
		}
	}
};

const onUnload = async (): Promise<void> => {
	_adapter.log.silly('BatteryChecker::onUnload');
	if (_TIMER) {
		clearTimeout(_TIMER);
	}
};

const init = (adapter: ioBroker.Adapter): void => {
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

export default BatteryChecker;
