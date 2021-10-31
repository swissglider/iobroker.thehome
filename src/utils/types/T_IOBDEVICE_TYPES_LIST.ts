export type T_IOBDEVICE_TYPES_LIST = Record<
	string,
	{
		stateId: string | undefined;
		currentStateName: ioBroker.StringOrTranslated | undefined;
		targetStateName: ioBroker.StringOrTranslated;
		deviceType: string | undefined;
		room: string | undefined;
		additionalNames: string[];
		additionalInfos: string[];
	}
>;
