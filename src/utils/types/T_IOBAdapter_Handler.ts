export type T_AdapterSingleStates = {
	isAdapterInstalled: boolean;
	isAdapterRunning: boolean;
	isAdapterConnected: boolean;
};
export type T_AdapterStates = T_AdapterSingleStates & { adapterFullReady: boolean };

export type T_ON_Message_Func = {
	rename: (adapter: ioBroker.Adapter) => Promise<string | { error: string }>;
	getHealthStati: (adapter: ioBroker.Adapter) => Promise<T_AdapterStates>;
	[x: string]: any;
};

export type T_IOBAdapter_Handler = {
	name: string;
	init?: (adapter: ioBroker.Adapter) => Promise<void>;
	destroy?: (adapter: ioBroker.Adapter) => Promise<void>;
	isHealth: (adapter: ioBroker.Adapter) => Promise<boolean>;
	onMessageFunc: T_ON_Message_Func;
};

export type T_RearangeDeviceAndStates_Props = {
	deviceType: string;
	room: string;
	additionalNames?: string[];
	rootObj: ioBroker.Object;
	funcID2NameMap?: Record<string, string>;
};

export type T_STATUS = {
	_isReady: 'ok' | 'nok' | 'processing';
	_name: string;
	[x: string]: any;
};
