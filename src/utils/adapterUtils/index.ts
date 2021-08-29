export interface StateInformation {
	stateID: string;
	stateName: string;
	functions?: string;
	rooms?: string;
}

/**
 * Creates and returns an array of ioBroker.Objects with all states that contains function and/or room enums
 * @param adapter adapter Object
 * @param mandatoryEnums 0 = functions + rooms mandatory / 1 = function mandatory / 2 = rooms mandatory / 3 = rooms or functions
 * @returns
 */
const getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject = async (
	adapter: ioBroker.Adapter,
	mandatoryEnums: 0 | 1 | 2 | 3 = 3,
): Promise<ioBroker.Object[]> => {
	const allStates = await adapter.getForeignObjectsAsync('*', 'state', ['rooms', 'functions']);
	const filteredStates = Object.values(allStates).filter((state) => {
		const mainFilter = state.enums && Object.keys(state.enums).length > 0;
		const mandatoryEnumFilter =
			mandatoryEnums == 0
				? state.enums &&
				  Object.keys(state.enums).some((e) => e.startsWith('enum.rooms.')) &&
				  Object.keys(state.enums).some((e) => e.startsWith('enum.functions.'))
				: mandatoryEnums == 1
				? state.enums && Object.keys(state.enums).some((e) => e.startsWith('enum.functions.'))
				: mandatoryEnums == 2
				? state.enums && Object.keys(state.enums).some((e) => e.startsWith('enum.rooms.'))
				: mandatoryEnums == 3
				? state.enums &&
				  (Object.keys(state.enums).some((e) => e.startsWith('enum.rooms.')) ||
						Object.keys(state.enums).some((e) => e.startsWith('enum.functions.')))
				: false;
		return mainFilter && mandatoryEnumFilter;
	});
	return filteredStates;
};

/**
 * Creates and returns an array of StateInformations with all states that contains function and/or room enums
 * @param adapter adapter Object
 * @param mandatoryEnums 0 = functions + rooms mandatory / 1 = function mandatory / 2 = rooms mandatory / 3 = rooms or functions
 * @returns
 */
const getAllStatesWithFunctionAndOrRoomEnumsAsStateInformation = async (
	adapter: ioBroker.Adapter,
	mandatoryEnums: 0 | 1 | 2 | 3 = 3,
): Promise<StateInformation[]> => {
	const filteredStates = await getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject(adapter, mandatoryEnums);
	const stateInfos: StateInformation[] = filteredStates.map((state) => ({
		stateID: state._id,
		stateName: <string>state.common.name,
		functions: state.enums
			? Object.keys(state.enums).find((e: string) => e.startsWith('enum.functions.'))
			: undefined,
		rooms: state.enums ? Object.keys(state.enums).find((e: string) => e.startsWith('enum.rooms.')) : undefined,
	}));
	return stateInfos;
};

const stopAllServices = async (): Promise<void> => {
	// TODO
	return;
};

const startAllServices = async (): Promise<void> => {
	// TODO
	return;
};

const restartAllServices = async (): Promise<void> => {
	// TODO
	return;
};

const AdapterUtils = {
	getAllStatesWithFunctionAndOrRoomEnumsAsStateInformation: getAllStatesWithFunctionAndOrRoomEnumsAsStateInformation,
	getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject: getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject,
	stopAllServices: stopAllServices,
	startAllServices: startAllServices,
	restartAllServices: restartAllServices,
};

export default AdapterUtils;
