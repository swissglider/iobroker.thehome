import EnumHandler from '../../../utils/adapterUtils/enumHandler';
import InfluxDBHelper from '../../../utils/adapterUtils/influxDBHelper';
import NameHelper from '../../../utils/adapterUtils/nameHelper';
import { StateInformation } from '../interfaces/I_StateInformation';

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
	const filteredStates = await EnumHandler.getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject(adapter, mandatoryEnums);
	const influxName = await InfluxDBHelper.getInfluxInstanceName(adapter);
	const stateInfos: StateInformation[] = filteredStates.map(
		(state) =>
			({
				stateID: state._id,
				stateName: NameHelper.getName(state.common.name, adapter.systemConfig?.language ?? 'de'),
				functions: state.enums
					? Object.keys(state.enums).find((e: string) => e.startsWith('enum.functions.'))
					: undefined,
				rooms: state.enums
					? Object.keys(state.enums).find((e: string) => e.startsWith('enum.rooms.'))
					: undefined,
				store2DB: (state.common.custom && state.common.custom[influxName]?.enabled === true) ?? false,
			} as StateInformation),
	);
	return stateInfos;
};

export const statesConfigDownload = async (adapter: ioBroker.Adapter): Promise<string> => {
	const states = await getAllStatesWithFunctionAndOrRoomEnumsAsStateInformation(adapter);
	return JSON.stringify(states, null, 2);
};
