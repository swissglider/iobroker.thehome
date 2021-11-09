import * as checkInitReadyUtil from '../../utils/adapterUtils/checkInitReady';
import { T_STATUS } from '../../utils/types/T_IOBAdapter_Handler';
import { T_SubAdapter } from '../../utils/types/T_SubAdapter';
import ConfigAdapterUseCases from './useCases';

const _STATUS: T_STATUS = {
	_adapter: undefined,
	_isReady: 'nok',
	_name: 'ConfigAdapter',
};

const _getAdapter = (): ioBroker.Adapter => {
	if (_STATUS._adapter) return _STATUS._adapter;
	throw new Error('Adapter not set, probably not correct initialized');
};

const _initConfigAdapter = async (): Promise<void> => {
	_STATUS._isReady = 'ok';
};

const checkInitReady = async (adapter?: ioBroker.Adapter): Promise<void> => {
	if (!adapter) adapter = _getAdapter();
	await checkInitReadyUtil.default(adapter, _STATUS, _initConfigAdapter);
};

const onReady = async (): Promise<void> => {
	_getAdapter().log.silly('ConfigAdapter::onReady');
	await checkInitReady();
};

const onMessage = async (obj: ioBroker.Message): Promise<void> => {
	_getAdapter().log.silly('ConfigAdapter::onMessage');
	await checkInitReady();
	// if (typeof obj === 'object' && obj.message) {
	try {
		if (typeof obj === 'object') {
			if (obj.command == 'ConfigAdapter:statesConfigDownload') {
				if (obj.callback) {
					const t1 = await ConfigAdapterUseCases.statesConfigDownload(_getAdapter());
					_getAdapter().sendTo(obj.from, obj.command, t1, obj.callback);
				}
			}
		}
		if (obj.command == 'ConfigAdapter:statesConfigUpload') {
			if (obj.callback && typeof obj.message !== 'string' && 'config' in obj.message) {
				const config = obj.message.config;
				const result = await ConfigAdapterUseCases.statesConfigUpload(_getAdapter(), config);
				_getAdapter().sendTo(obj.from, obj.command, result, obj.callback);
			}
		}
		if (obj.command == 'ConfigAdapter:singleStateConfigUpload') {
			if (obj.callback && typeof obj.message !== 'string' && 'config' in obj.message) {
				const config = obj.message.config;
				const result = await ConfigAdapterUseCases.singleStateConfigUpload(_getAdapter(), config);
				_getAdapter().sendTo(obj.from, obj.command, result, obj.callback);
			}
		}
	} catch (error) {
		_getAdapter().log.error(`unknown error on ${obj.command}: ${error}`);
		_getAdapter().sendTo(obj.from, obj.command, `unknown error on ${obj.command}: ${error}`, obj.callback);
	}
};

const init = (adapter: ioBroker.Adapter): void => {
	_STATUS._adapter = adapter;
	_getAdapter().on('ready', onReady);
	_getAdapter().on('message', onMessage);
};

const ConfigAdapter: T_SubAdapter = {
	name: 'ConfigAdapter',
	init: init,
	exportFunc: {},
};

export default ConfigAdapter;
