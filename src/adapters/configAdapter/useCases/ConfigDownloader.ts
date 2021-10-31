import ConfigChangeListener from '../../../listener/configChangeListener';
import AdapterUtilsFunctions from '../../../utils/adapterUtils/adapterUtilsFunctions';
import EnumHandler from '../../../utils/adapterUtils/enumHandler';
import NameHelper from '../../../utils/adapterUtils/nameHelper';
import { StateInformation } from '../interfaces/I_StateInformation';

const getStateInfo = (adapter: ioBroker.Adapter, obj: ioBroker.Object, influxName: string): StateInformation => {
	return {
		stateID: obj._id,
		stateName: NameHelper.getName(obj.common?.name ?? '', adapter.systemConfig?.language ?? 'de'),
		functions: obj.enums ? Object.keys(obj.enums).find((e: string) => e.startsWith('enum.functions.')) : undefined,
		rooms: obj.enums ? Object.keys(obj.enums).find((e: string) => e.startsWith('enum.rooms.')) : undefined,
		store2DB: (obj.common.custom && obj.common.custom[influxName]?.enabled === true) ?? false,
	} as StateInformation;
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
	try {
		const filteredObj = await EnumHandler.getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject(
			adapter,
			mandatoryEnums,
		);
		const influxName = await AdapterUtilsFunctions.getAdapterPath(adapter, 'influxdb');
		const stateInfos: StateInformation[] = filteredObj.map((obj) => getStateInfo(adapter, obj, influxName));
		const changedNameObjIDs = ConfigChangeListener.getObjectIDsWithChangedNames();
		const tmpAlreadyAddedStateIDs = stateInfos.map((e) => e.stateID);
		for (const objID of changedNameObjIDs) {
			if (!tmpAlreadyAddedStateIDs.includes(objID)) {
				const tmpObj = await adapter.getForeignObjectAsync(objID);
				if (tmpObj) {
					stateInfos.push(getStateInfo(adapter, tmpObj, influxName));
				}
			}
		}
		return stateInfos;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const statesConfigDownload = async (adapter: ioBroker.Adapter): Promise<string> => {
	const states = await getAllStatesWithFunctionAndOrRoomEnumsAsStateInformation(adapter);
	return JSON.stringify(states, null, 2);
};
