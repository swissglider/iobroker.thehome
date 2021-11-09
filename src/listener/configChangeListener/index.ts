import _ from 'lodash';
import * as checkInitReadyUtil from '../../utils/adapterUtils/checkInitReady';
import { T_STATUS } from '../../utils/types/T_IOBAdapter_Handler';
import { T_StateIDWithConfig } from '../../utils/types/T_StateIDWithConfig';
import { T_SubAdapter } from '../../utils/types/T_SubAdapter';

export const objectStateInformations = 'objectStateInformations';

const _STATUS: T_STATUS = {
	_adapter: undefined,
	_isReady: 'nok',
	allStateIDsWithConfig: {},
	_name: 'ConfigChangeListener',
};

const _getAdapter = (): ioBroker.Adapter => {
	if (_STATUS._adapter) return _STATUS._adapter;
	throw new Error('Adapter not set, probably not correct initialized');
};

const _setObjectStateInformations = async (): Promise<void> => {
	await _getAdapter().setStateChangedAsync(
		objectStateInformations,
		JSON.stringify(_STATUS.allStateIDsWithConfig),
		true,
	);
};

const _getLatestName = (key: string): ioBroker.StringOrTranslated => {
	return _STATUS.allStateIDsWithConfig[key].names[_STATUS.allStateIDsWithConfig[key].names.length - 1];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _setNewName = async (key: string, value: ioBroker.Object | null | undefined, init = false): Promise<void> => {
	if (
		key.startsWith('system.') ||
		key.startsWith('0_userdata.') ||
		key.startsWith('admin.') ||
		key.startsWith('alias.') ||
		key.startsWith('enum.') ||
		key.startsWith('_design.')
	) {
		return;
	}
	if (!value) {
		// state deleted
		delete _STATUS.allStateIDsWithConfig[key];
		_getAdapter().log.silly(`object ${key} deleted`);
		return;
	} else if (value && !(key in _STATUS.allStateIDsWithConfig)) {
		// new state
		_STATUS.allStateIDsWithConfig[key] = {
			defaultName: value.common?.name ?? '',
			names: [value.common?.name ?? ''],
		};
	} else if (value && !_.isEqual(_getLatestName(key), value.common?.name ?? '')) {
		// state name changed
		_STATUS.allStateIDsWithConfig[key].names.push(value.common?.name ?? '');
	}
	_getAdapter().log.silly(`object ${key} changed: ${JSON.stringify(value)}`);
};

const _initConfigChangeListener = async (): Promise<void> => {
	const allStateObjects = await _getAdapter().getForeignObjectsAsync('*', 'state');
	const allChannelObjects = await _getAdapter().getForeignObjectsAsync('*', 'channel');
	const allDeviceObjects = await _getAdapter().getForeignObjectsAsync('*', 'device');

	const allObjects = { ...allStateObjects, ...allChannelObjects, ...allDeviceObjects };
	for (const [key, value] of Object.entries(allObjects)) {
		await _setNewName(key, value, true);
	}
	await _setObjectStateInformations();
};

const resetStateNameToDefault = async (id: string): Promise<void> => {
	if (!_getAdapter().config.ConfigChangeListener_active) return;
	if (!(id in _STATUS.allStateIDsWithConfig)) return;
	const obj = await _getAdapter().getForeignObjectAsync(id);
	if (obj) {
		obj.common.name = _STATUS.allStateIDsWithConfig[id].defaultName;
		delete obj.enums;
		await _getAdapter().setForeignObjectAsync(id, obj);
	}
};

const resetAllStateNamesToDefault = async (): Promise<void> => {
	if (!_getAdapter().config.ConfigChangeListener_active) return;
	const promiseArray: Promise<void>[] = [];
	for (const id of Object.keys(_STATUS.allStateIDsWithConfig)) {
		promiseArray.push(resetStateNameToDefault(id));
	}
	await Promise.all(promiseArray);
};

const _initConfigListener = async (): Promise<void> => {
	_STATUS._isReady = 'processing';
	_getAdapter().log.silly('ConfigChangeListener::onReady');
	if (!_getAdapter().config.ConfigChangeListener_active) return;
	await _getAdapter().setObjectNotExistsAsync(objectStateInformations, {
		type: 'config',
		common: {
			name: 'ObjectStateInformations',
			type: 'string',
			role: 'meta.config',
			desc: 'this meta datas are used for the adapter to handle all the objcet state datas faster',
			read: true,
			write: false,
		},
		native: {},
	});
	const rawState = await _getAdapter().getStateAsync(objectStateInformations);
	if (!!rawState && !!rawState.val) {
		_STATUS.allStateIDsWithConfig = JSON.parse(rawState.val as string) as T_StateIDWithConfig;
	} else {
		_STATUS.allStateIDsWithConfig = {};
	}
	await _initConfigChangeListener();
	_STATUS._isReady = 'ok';
};

const checkInitReady = async (adapter?: ioBroker.Adapter): Promise<void> => {
	if (!adapter) adapter = _getAdapter();
	await checkInitReadyUtil.default(adapter, _STATUS, _initConfigListener);
};

const onReady = async (): Promise<void> => {
	_getAdapter().log.silly('ConnectionChecker::onReady');
	await checkInitReady();
};

const onMessage = async (obj: ioBroker.Message): Promise<void> => {
	_getAdapter().log.silly('ConfigChangeListener::onMessage');
	if (!_getAdapter().config.ConfigChangeListener_active)
		_getAdapter().sendTo(obj.from, obj.command, `ok`, obj.callback);
	await checkInitReady();
	if (typeof obj === 'object') {
		if (
			obj.command == 'ConfigChangeListener:resetStateNameToDefault' &&
			obj.message &&
			typeof obj.message === 'object' &&
			'id' in obj.message &&
			obj.callback
		) {
			try {
				if (_getAdapter().config.ConfigChangeListener_active) await resetStateNameToDefault(obj.message.id);
				_getAdapter().sendTo(obj.from, obj.command, 'ok', obj.callback);
			} catch (error) {
				_getAdapter().sendTo(obj.from, obj.command, `unknown error on ${obj.command}: ${error}`, obj.callback);
			}
		} else if (obj.command == 'ConfigChangeListener:resetAllStateNamesToDefault' && obj.callback) {
			try {
				if (_getAdapter().config.ConfigChangeListener_active) await resetAllStateNamesToDefault();
				_getAdapter().sendTo(obj.from, obj.command, 'ok', obj.callback);
			} catch (error) {
				_getAdapter().sendTo(obj.from, obj.command, `unknown error on ${obj.command}: ${error}`, obj.callback);
			}
		}
	}
};

const getObjectIDsWithChangedNames = async (): Promise<string[]> => {
	await checkInitReady();
	const returnArray: string[] = [];
	for (const [key, value] of Object.entries(_STATUS.allStateIDsWithConfig)) {
		const _value = value as any;
		if (!_.isEqual(_value.defaultName, _value.names[_value.names.length - 1])) {
			returnArray.push(key);
		}
	}
	return returnArray;
};

const onObjectChange = async (id: string, obj: ioBroker.Object | null | undefined): Promise<void> => {
	_getAdapter().log.silly('ConfigChangeListener::onObjectChange');
	await checkInitReady();

	if (_getAdapter().config.ConfigChangeListener_active) {
		await _setNewName(id, obj);
		_getAdapter().log.silly(`object ${id} changed: ${JSON.stringify(obj)}`);
	}
};

const onUnload = async (): Promise<void> => {
	_getAdapter().log.error('ConfigChangeListener::onUnload');
	if (_getAdapter().config.ConfigChangeListener_active) await _setObjectStateInformations();
};

const init = (adapter: ioBroker.Adapter): void => {
	_STATUS._adapter = adapter;
	_getAdapter().on('ready', onReady);
	_getAdapter().on('message', onMessage);
	_getAdapter().on('objectChange', onObjectChange);
	_getAdapter().on('unload', onUnload);
};

const ConfigChangeListener: T_SubAdapter = {
	name: 'ConfigChangeListener',
	init: init,
	exportFunc: { getObjectIDsWithChangedNames: getObjectIDsWithChangedNames },
};

export default ConfigChangeListener;
