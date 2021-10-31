export type T_AdapterSingleStates = {
	isAdapterInstalled: boolean;
	isAdapterRunning: boolean;
	isAdapterConnected: boolean;
	adapterFullReady: boolean;
};

export const defaultAdapterSingleStates = {
	isAdapterInstalled: false,
	isAdapterRunning: false,
	isAdapterConnected: false,
	adapterFullReady: false,
};
