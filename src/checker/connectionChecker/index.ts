import CheckerTimer from '../../utils/adapterUtils/checkerTimer';
import * as checkInitReadyUtil from '../../utils/adapterUtils/checkInitReady';
import { T_STATUS } from '../../utils/types/T_IOBAdapter_Handler';

const NAME = 'ConnectionChecker';
const _STATUS: T_STATUS = {
	_adapter: undefined,
	_isReady: 'nok',
	_name: 'ConnectionChecker',
};

const _getAdapter = (): ioBroker.Adapter => {
	if (_STATUS._adapter) return _STATUS._adapter;
	throw new Error('Adapter not set, probably not correct initialized');
};

const _initConnectionChecker = async (): Promise<void> => {
	_getAdapter().log.silly('ConnectionChecker::onReady');
	_STATUS._isReady = 'processing';
	if (_getAdapter().config.ConnectionChecker_disabled) return;
	try {
		CheckerTimer.startTimer(NAME, _getAdapter().config.ConnectionChecker_timerMS, (): void => {
			return;
		});
		_STATUS._isReady = 'ok';
	} catch (error) {
		console.error(`unknown error: ${error}`);
		_STATUS._isReady = 'nok';
		_getAdapter().log.error(`unknown error: ${error}`);
	}
};

const checkInitReady = async (adapter?: ioBroker.Adapter): Promise<void> => {
	if (!adapter) adapter = _getAdapter();
	await checkInitReadyUtil.default(adapter, _STATUS, _initConnectionChecker);
};

const onReady = async (): Promise<void> => {
	_getAdapter().log.silly('ConnectionChecker::onReady');
	await checkInitReady();
};

const initConnectionChecker = async (): Promise<void> => {
	await checkInitReady();
};

const stopConnectionChecker = async (): Promise<void> => {
	await checkInitReady();
};

const onMessage = async (obj: ioBroker.Message): Promise<void> => {
	_getAdapter().log.silly('ConnectionChecker::onMessage');
	await checkInitReady();
	if (typeof obj === 'object') {
		if (obj.command == 'ConnectionChecker:getStatistics' && obj.callback) {
			try {
				if (!_getAdapter().config.ConnectionChecker_disabled) console.log('do what is needed');
				_getAdapter().sendTo(obj.from, obj.command, 'ok', obj.callback);
			} catch (error) {
				_getAdapter().log.error(`unknown error on ${obj.command}: ${error}`);
				_getAdapter().sendTo(obj.from, obj.command, `unknown error on ${obj.command}: ${error}`, obj.callback);
			}
		}
	}
};

const onUnload = async (): Promise<void> => {
	_getAdapter().log.silly('ConnectionChecker::onUnload');
	CheckerTimer.stopTimer(NAME);
};

const init = (adapter: ioBroker.Adapter): void => {
	_STATUS._adapter = adapter;
	_getAdapter().on('ready', onReady);
	_getAdapter().on('message', onMessage);
	_getAdapter().on('unload', onUnload);
};

const ConnectionChecker = {
	name: NAME,
	init: init,
	exportFunc: { stopConnectionChecker: stopConnectionChecker, initConnectionChecker: initConnectionChecker },
};

export default ConnectionChecker;
