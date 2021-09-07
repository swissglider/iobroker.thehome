import ConfigAdapterFunctions from './functions';

let _adapter: ioBroker.Adapter;

const onReady = async (): Promise<void> => {
	_adapter.log.silly('ConfigAdapter::onReady');
};

const onMessage = async (obj: ioBroker.Message): Promise<void> => {
	_adapter.log.silly('ConfigAdapter::onMessage');
	// if (typeof obj === 'object' && obj.message) {
	if (typeof obj === 'object') {
		if (obj.command == 'ConfigAdapter:statesConfigDownload') {
			if (obj.callback) {
				const t1 = await ConfigAdapterFunctions.statesConfigDownload(_adapter);
				_adapter.sendTo(obj.from, obj.command, t1, obj.callback);
			}
		}
		if (obj.command == 'ConfigAdapter:statesConfigUpload') {
			if (obj.callback && typeof obj.message !== 'string' && 'config' in obj.message) {
				const config = obj.message.config;
				const result = await ConfigAdapterFunctions.statesConfigUpload(_adapter, config);
				_adapter.sendTo(obj.from, obj.command, result, obj.callback);
			}
		}
		if (obj.command == 'ConfigAdapter:singleStateConfigUpload') {
			if (obj.callback && typeof obj.message !== 'string' && 'config' in obj.message) {
				const config = obj.message.config;
				const result = await ConfigAdapterFunctions.singleStateConfigUpload(_adapter, config);
				_adapter.sendTo(obj.from, obj.command, result, obj.callback);
			}
		}
	}
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const onStateChange = async (id: string, state: ioBroker.State | null | undefined): Promise<void> => {
	_adapter.log.silly('ConfigAdapter::onStateChange');
	if (state) {
		// The state was changed
		_adapter.log.silly(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
	} else {
		// The state was deleted
		_adapter.log.silly(`state ${id} deleted`);
	}
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const onObjectChange = async (id: string, obj: ioBroker.Object | null | undefined): Promise<void> => {
	_adapter.log.silly('ConfigAdapter::onObjectChange');
	if (obj) {
		// The object was changed
		_adapter.log.silly(`object ${id} changed: ${JSON.stringify(obj)}`);
		// AdapterCreators.enumChanged(this, id, obj);
	} else {
		// The object was deleted
		_adapter.log.silly(`object ${id} deleted`);
	}
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const onUnload = async (callback: () => void): Promise<void> => {
	_adapter.log.silly('ConfigAdapter::unload');
	try {
		// Here you must clear all timeouts or intervals that may still be active
		// clearTimeout(timeout1);
		// clearTimeout(timeout2);
		// ...
		// clearInterval(interval1);

		callback();
	} catch (e) {
		callback();
	}
};

const init = (adapter: ioBroker.Adapter): void => {
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

export default ConfigAdapter;
