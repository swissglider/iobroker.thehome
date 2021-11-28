const TIMERS: Record<string, NodeJS.Timeout> = {};

const startTimer = async (name: string, timeMS: number, func: () => Promise<void> | void): Promise<void> => {
	try {
		await func();
		TIMERS[name] = setTimeout(() => startTimer(name, timeMS, func), timeMS);
	} catch (error) {
		console.error(error);
		console.error(`unknown error: ${error}`);
		throw error;
	}
};

const stopTimer = async (name: string): Promise<void> => {
	if (TIMERS[name]) {
		clearTimeout(TIMERS[name]);
	}
};

const CheckerTimer = {
	startTimer: startTimer,
	stopTimer: stopTimer,
};

export default CheckerTimer;
