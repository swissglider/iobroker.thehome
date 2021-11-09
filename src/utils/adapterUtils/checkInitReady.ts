import { T_STATUS } from '../types/T_IOBAdapter_Handler';

const checkInitReady = async (
	adapter: ioBroker.Adapter,
	status: T_STATUS,
	initFunc: (adapter: ioBroker.Adapter) => Promise<void>,
): Promise<void> => {
	if (status._isReady === 'ok') return;
	if (status._isReady === 'nok') {
		await initFunc(adapter);
		return;
	}

	let counter = 0;

	const __startTimer = async (): Promise<void> => {
		return new Promise((resolve) => setTimeout(resolve, 200));
	};

	while (status._isReady === 'processing' && counter < 100) {
		await __startTimer();
		counter = counter + 1;
	}
	if (counter === 100) {
		console.error('init not finished correct', status);
		throw new Error('init not finished correct');
	}
};

export default checkInitReady;
