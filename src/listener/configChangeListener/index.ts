import _ from 'lodash';
import AdapterUtilsFunctions from '../../utils/adapterUtils/adapterUtilsFunctions';
import { T_StateIDWithConfig } from '../../utils/types/T_StateIDWithConfig';

export const objectStateInformations = 'objectStateInformations';
let _adapter: ioBroker.Adapter;
let _allStateIDsWithConfig: T_StateIDWithConfig = {};

const _setObjectStateInformations = async (): Promise<void> => {
	await _adapter.setStateChangedAsync(objectStateInformations, JSON.stringify(_allStateIDsWithConfig), true);
};

const _getLatestName = (key: string): ioBroker.StringOrTranslated => {
	return _allStateIDsWithConfig[key].names[_allStateIDsWithConfig[key].names.length - 1];
};

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
		delete _allStateIDsWithConfig[key];
		_adapter.log.silly(`object ${key} deleted`);
		return;
	} else if (value && !(key in _allStateIDsWithConfig)) {
		// new state
		_allStateIDsWithConfig[key] = { defaultName: value.common?.name ?? '', names: [value.common?.name ?? ''] };
	} else if (value && !_.isEqual(_getLatestName(key), value.common?.name ?? '')) {
		// state name changed
		_allStateIDsWithConfig[key].names.push(value.common?.name ?? '');
	}
	_adapter.log.silly(`object ${key} changed: ${JSON.stringify(value)}`);
};

const _initConfigChangeListener = async (): Promise<void> => {
	const allStateObjects = await _adapter.getForeignObjectsAsync('*', 'state');
	const allChannelObjects = await _adapter.getForeignObjectsAsync('*', 'channel');
	const allDeviceObjects = await _adapter.getForeignObjectsAsync('*', 'device');

	const allObjects = { ...allStateObjects, ...allChannelObjects, ...allDeviceObjects };
	for (const [key, value] of Object.entries(allObjects)) {
		await _setNewName(key, value, true);
	}
	await _setObjectStateInformations();
};

const resetStateNameToDefault = async (id: string): Promise<void> => {
	if (!_adapter.config.ConfigChangeListener_active) return;
	if (!(id in _allStateIDsWithConfig)) return;
	const obj = await _adapter.getForeignObjectAsync(id);
	if (obj) {
		obj.common.name = _allStateIDsWithConfig[id].defaultName;
		delete obj.enums;
		await _adapter.setForeignObjectAsync(id, obj);
	}
};

const resetAllStateNamesToDefault = async (): Promise<void> => {
	if (!_adapter.config.ConfigChangeListener_active) return;
	const promiseArray: Promise<void>[] = [];
	for (const id of Object.keys(_allStateIDsWithConfig)) {
		promiseArray.push(resetStateNameToDefault(id));
	}
	await Promise.all(promiseArray);
};

const getObjectIDsWithChangedNames = (): string[] => {
	const returnArray: string[] = [];
	for (const [key, value] of Object.entries(_allStateIDsWithConfig)) {
		if (!_.isEqual(value.defaultName, value.names[value.names.length - 1])) {
			returnArray.push(key);
		}
	}
	return returnArray;
};

const onReady = async (): Promise<void> => {
	if (!_adapter.config.ConfigChangeListener_active) return;
	_adapter.log.silly('ConfigChangeListener::onReady');
	await AdapterUtilsFunctions.checkIFStartable(_adapter);
	await _adapter.setObjectNotExistsAsync(objectStateInformations, {
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
	const rawState = await _adapter.getStateAsync(objectStateInformations);
	if (!!rawState && !!rawState.val) {
		_allStateIDsWithConfig = JSON.parse(rawState.val as string) as T_StateIDWithConfig;
	} else {
		_allStateIDsWithConfig = {};
	}
	await _initConfigChangeListener();
};

const onMessage = async (obj: ioBroker.Message): Promise<void> => {
	_adapter.log.silly('ConfigChangeListener::onMessage');
	if (typeof obj === 'object') {
		if (
			obj.command == 'ConfigChangeListener:resetStateNameToDefault' &&
			obj.message &&
			typeof obj.message === 'object' &&
			'id' in obj.message &&
			obj.callback
		) {
			try {
				if (_adapter.config.ConfigChangeListener_active) await resetStateNameToDefault(obj.message.id);
				_adapter.sendTo(obj.from, obj.command, 'ok', obj.callback);
			} catch (error) {
				_adapter.sendTo(obj.from, obj.command, `unknown error on ${obj.command}: ${error}`, obj.callback);
			}
		} else if (obj.command == 'ConfigChangeListener:resetAllStateNamesToDefault' && obj.callback) {
			try {
				if (_adapter.config.ConfigChangeListener_active) await resetAllStateNamesToDefault();
				_adapter.sendTo(obj.from, obj.command, 'ok', obj.callback);
			} catch (error) {
				_adapter.sendTo(obj.from, obj.command, `unknown error on ${obj.command}: ${error}`, obj.callback);
			}
		}
	}
};

const onObjectChange = async (id: string, obj: ioBroker.Object | null | undefined): Promise<void> => {
	_adapter.log.silly('ConfigChangeListener::onObjectChange');

	if (_adapter.config.ConfigChangeListener_active) {
		await _setNewName(id, obj);
		_adapter.log.silly(`object ${id} changed: ${JSON.stringify(obj)}`);
	}
};

const onUnload = async (): Promise<void> => {
	_adapter.log.error('ConfigChangeListener::onUnload');
	if (_adapter.config.ConfigChangeListener_active) await _setObjectStateInformations();
};

const init = (adapter: ioBroker.Adapter): void => {
	_adapter = adapter;
	_adapter.on('ready', onReady);
	_adapter.on('message', onMessage);
	_adapter.on('objectChange', onObjectChange);
	_adapter.on('unload', onUnload);
};

const ConfigChangeListener = {
	init: init,
	getObjectIDsWithChangedNames: getObjectIDsWithChangedNames,
};

export default ConfigChangeListener;
