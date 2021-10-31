import AdapterUtilsFunctions from '../../utils/adapterUtils/adapterUtilsFunctions';

let _adapter: ioBroker.Adapter;
let _TIMER: NodeJS.Timeout | undefined;

const initConnectionChecker = async (): Promise<void> => {
	return;
};

const stopConnectionChecker = async (): Promise<void> => {
	return;
};

/**
 * start timer accodring to the time in ms configured in admin
 */
const _timerToStart = async (): Promise<void> => {
	try {
		_TIMER = setTimeout(() => _timerToStart(), _adapter.config.ConnectionChecker_timerMS);
	} catch (error) {
		console.error(`unknown error: ${error}`);
		throw error;
	}
};

const onReady = async (): Promise<void> => {
	_adapter.log.silly('ConnectionChecker::onReady');
	await AdapterUtilsFunctions.checkIFStartable(_adapter);
	if (_adapter.config.ConnectionChecker_disabled) return;
	try {
		_timerToStart();
	} catch (error) {
		console.error(`unknown error: ${error}`);
		_adapter.log.error(`unknown error: ${error}`);
	}
};

const onMessage = async (obj: ioBroker.Message): Promise<void> => {
	_adapter.log.silly('ConnectionChecker::onMessage');
	if (typeof obj === 'object') {
		if (obj.command == 'ConnectionChecker:getStatistics' && obj.callback) {
			try {
				if (!_adapter.config.ConnectionChecker_disabled) console.log('do what is needed');
				_adapter.sendTo(obj.from, obj.command, 'ok', obj.callback);
			} catch (error) {
				_adapter.log.error(`unknown error on ${obj.command}: ${error}`);
				_adapter.sendTo(obj.from, obj.command, `unknown error on ${obj.command}: ${error}`, obj.callback);
			}
		}
	}
};

const onUnload = async (): Promise<void> => {
	_adapter.log.silly('ConnectionChecker::onUnload');
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

const ConnectionChecker = {
	init: init,
	stopConnectionChecker: stopConnectionChecker,
	initConnectionChecker: initConnectionChecker,
};

export default ConnectionChecker;
