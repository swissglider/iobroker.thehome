import { StateInformation } from '../../adapters/configAdapter/interfaces/I_StateInformation';

const chechAndCreateIfNeededNewEnum = async (
	adapter: ioBroker.Adapter,
	enumID: string,
	enumName?: string,
	enumIcon?: string,
	enumDescription?: string,
	enumColor?: string,
): Promise<void> => {
	if (adapter && enumID) {
		const enumObject: ioBroker.Enum = {};
		enumObject.type = 'enum';
		enumObject.common = {};
		enumObject.common.name = enumName ? enumName : enumID.substr(enumID.lastIndexOf('.') + 1);
		enumObject.common.enabled = true;
		if (enumColor) enumObject.common.color = enumColor;
		if (enumDescription) enumObject.common.desc = enumDescription;
		if (enumIcon) enumObject.common.icon = enumIcon;
		enumObject.common.members = [];
		enumObject.natice = {};
		enumObject._id = enumID;
		enumObject.from = 'system.adapter.admin.0';
		enumObject.user = 'system.user.admin';
		delete enumObject.enums;
		await adapter.setForeignObjectNotExistsAsync(enumID, enumObject);
	}
	return;
};

const addStateIDToEnum = async (_adapter: ioBroker.Adapter, enumID: string, stateID: string): Promise<void> => {
	const en = await _adapter.getForeignObjectAsync(enumID, 'enum');
	if (en && en.common.members && !en.common.members.includes(stateID)) {
		en.common.members.push(stateID);
		delete en.enums;
		await _adapter.setForeignObjectAsync(enumID, en);
	}
};

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

const removeStateFromAllRoomFunctionEnums = async (adapter: ioBroker.Adapter, stateID: string): Promise<void> => {
	const stateObjects = await adapter.getForeignObjectsAsync(stateID, 'state', ['rooms', 'functions']);
	const stateObject = Object.values(stateObjects)[0];
	if (stateObject && stateObject.enums) {
		for (const enumID of Object.keys(stateObject.enums)) {
			if (enumID.startsWith('enum.rooms.') || enumID.startsWith('enum.functions.')) {
				const en = await adapter.getForeignObjectAsync(enumID, 'enum');
				if (en && en.common.members) {
					const members = en.common.members.filter((e: string) => e !== stateObject._id);
					en.common.members = members;
					delete en.enums;
					await adapter.setForeignObjectAsync(enumID, en);
				}
			}
		}
	}
	return;
};

const removeAllStatesFromAllRoomFunctionEnums = async (adapter: ioBroker.Adapter): Promise<void> => {
	const stateObjects: ioBroker.Object[] = await getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject(adapter);
	for (const stateObject of stateObjects) {
		await removeStateFromAllRoomFunctionEnums(adapter, stateObject._id);
	}
	return;
};

const addStateToEnums = async (adapter: ioBroker.Adapter, stateConfig: StateInformation): Promise<void> => {
	if (stateConfig.stateID && stateConfig.functions) {
		// check and create if needed new enum
		await chechAndCreateIfNeededNewEnum(adapter, stateConfig.functions);
		// add state to function enum from config
		await addStateIDToEnum(adapter, stateConfig.functions, stateConfig.stateID);
	}
	if (stateConfig.stateID && stateConfig.rooms) {
		// check and create if needed new enum
		await chechAndCreateIfNeededNewEnum(adapter, stateConfig.rooms);
		// add state to room enum from config
		await addStateIDToEnum(adapter, stateConfig.rooms, stateConfig.stateID);
	}
};

const addAllStatesToEnums = async (adapter: ioBroker.Adapter, config: StateInformation[]): Promise<void> => {
	for (const stateConfig of config) {
		await addStateToEnums(adapter, stateConfig);
	}
};

const EnumHandler = {
	getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject: getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject,
	removeStateFromAllRoomFunctionEnums: removeStateFromAllRoomFunctionEnums,
	removeAllStatesFromAllRoomFunctionEnums: removeAllStatesFromAllRoomFunctionEnums,
	addStateToEnums: addStateToEnums,
	addAllStatesToEnums: addAllStatesToEnums,
};

export default EnumHandler;
