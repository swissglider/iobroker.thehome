import AdapterUtilsFunctions from '../../utils/adapterUtils/adapterUtilsFunctions';
import ConfigAdapterUseCases from './useCases';

let _adapter: ioBroker.Adapter;

const onReady = async (): Promise<void> => {
	_adapter.log.silly('ConfigAdapter::onReady');
	await AdapterUtilsFunctions.checkIFStartable(_adapter);
};

const onMessage = async (obj: ioBroker.Message): Promise<void> => {
	_adapter.log.silly('ConfigAdapter::onMessage');
	// if (typeof obj === 'object' && obj.message) {
	try {
		if (typeof obj === 'object') {
			if (obj.command == 'ConfigAdapter:statesConfigDownload') {
				if (obj.callback) {
					const t1 = await ConfigAdapterUseCases.statesConfigDownload(_adapter);
					_adapter.sendTo(obj.from, obj.command, t1, obj.callback);
				}
			}
		}
		if (obj.command == 'ConfigAdapter:statesConfigUpload') {
			if (obj.callback && typeof obj.message !== 'string' && 'config' in obj.message) {
				const config = obj.message.config;
				const result = await ConfigAdapterUseCases.statesConfigUpload(_adapter, config);
				_adapter.sendTo(obj.from, obj.command, result, obj.callback);
			}
		}
		if (obj.command == 'ConfigAdapter:singleStateConfigUpload') {
			if (obj.callback && typeof obj.message !== 'string' && 'config' in obj.message) {
				const config = obj.message.config;
				const result = await ConfigAdapterUseCases.singleStateConfigUpload(_adapter, config);
				_adapter.sendTo(obj.from, obj.command, result, obj.callback);
			}
		}
	} catch (error) {
		_adapter.log.error(`unknown error on ${obj.command}: ${error}`);
		_adapter.sendTo(obj.from, obj.command, `unknown error on ${obj.command}: ${error}`, obj.callback);
	}
};

const init = (adapter: ioBroker.Adapter): void => {
	_adapter = adapter;
	_adapter.on('ready', onReady);
	_adapter.on('message', onMessage);
};

const ConfigAdapter = {
	init: init,
};

export default ConfigAdapter;
