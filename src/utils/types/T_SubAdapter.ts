export type T_SubAdapterExportFunc = {
	[x: string]: any;
};

export type T_SubAdapter = {
	name: string;
	init?: (adapter: ioBroker.Adapter) => Promise<void> | void;
	exportFunc: T_SubAdapterExportFunc;
};
