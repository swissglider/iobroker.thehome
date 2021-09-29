import EnumHandler from '../../../utils/adapterUtils/enumHandler';
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
	const stateInfos: StateInformation[] = filteredStates.map(
		(state) =>
			({
				stateID: state._id,
				stateName: NameHelper.getName(state.common.name, adapter.systemConfig.language),
				functions: state.enums
					? Object.keys(state.enums).find((e: string) => e.startsWith('enum.functions.'))
					: undefined,
				rooms: state.enums
					? Object.keys(state.enums).find((e: string) => e.startsWith('enum.rooms.'))
					: undefined,
				store2DB:
					state.native &&
					state.native.swissglider &&
					state.native.swissglider.theHome &&
					state.native.swissglider.theHome.store2DB &&
					typeof state.native.swissglider.theHome.store2DB === 'boolean'
						? state.native.swissglider.theHome.store2DB
						: false,
			} as StateInformation),
	);
	return stateInfos;
};

export const statesConfigDownload = async (adapter: ioBroker.Adapter): Promise<string> => {
	const states = await getAllStatesWithFunctionAndOrRoomEnumsAsStateInformation(adapter);
	const objectWIthStore2DB = await NameHelper.getAllObjectsTheHomeParameter(adapter, 'StateInformationArray');
	for (const obj of objectWIthStore2DB) {
		const tObj = obj as StateInformation;
		if (states.find((e) => e.stateID === tObj.stateID) === undefined) {
			states.push(tObj);
		}
	}
	return JSON.stringify(states, null, 2);
};
