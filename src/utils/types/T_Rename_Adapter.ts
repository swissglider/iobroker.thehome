export type T_AdapterSingleStates = {
	isAdapterInstalled: boolean;
	isAdapterRunning: boolean;
	isAdapterConnected: boolean;
};
export type T_AdapterStates = T_AdapterSingleStates & { adapterFullReady: boolean };

export type T_Rename_Adapter = {
	name: string;
	init?: (adapter: ioBroker.Adapter) => Promise<void>;
	destroy?: (adapter: ioBroker.Adapter) => Promise<void>;
	getHealthStati: (adapter: ioBroker.Adapter) => Promise<T_AdapterStates>;
	isHealth: (adapter: ioBroker.Adapter) => Promise<boolean>;
	rename: (adapter: ioBroker.Adapter) => Promise<string | { error: string }>;
	[x: string]: any;
};

export type T_RearangeDeviceAndStates_Props = {
	deviceType: string;
	room: string;
	additionalNames?: string[];
	rootObj: ioBroker.Object;
};
