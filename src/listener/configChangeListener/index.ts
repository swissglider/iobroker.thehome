const initConfigChangeListener = async (adapter: ioBroker.Adapter): Promise<void> => {
	adapter;
	return;
};

const stopConfigChangeListener = async (adapter: ioBroker.Adapter): Promise<void> => {
	adapter;
	return;
};

const ConfigChangeListener = {
	stopConfigChangeListener: stopConfigChangeListener,
	initConfigChangeListener: initConfigChangeListener,
};

export default ConfigChangeListener;
