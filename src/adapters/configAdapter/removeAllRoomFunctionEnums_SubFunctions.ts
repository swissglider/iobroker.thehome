import { StateInformation } from '../../utils/adapterUtils';
import InfluxDBHandlerAdapter from '../influxDBHandlerAdapter';

const handleInfluxDBReset = async (adapter: ioBroker.Adapter, stateObject: ioBroker.Object): Promise<void> => {
	// reset Influx TimeSeries to org Statename on InfluxDB
	await InfluxDBHandlerAdapter.resetInfluxTimeSeries(adapter, stateObject);

	// delete custom InfluxDBAdapter entry
	await InfluxDBHandlerAdapter.deletCustomInfluxDBAdapterEntries(adapter, stateObject);
	return;
};

const removeAllRoomFunctionEnums = async (adapter: ioBroker.Adapter, stateObject: ioBroker.Object): Promise<void> => {
	if (stateObject.enums) {
		for (const enumID of Object.keys(stateObject.enums)) {
			// await adapter.deleteStateFromEnumAsync(enumID, '', '', stateObject._id);
			if (enumID.startsWith('enum.rooms.') || enumID.startsWith('enum.functions.')) {
				const en = await adapter.getForeignObjectAsync(enumID, 'enum');
				if (en && en.common.members) {
					const members = en.common.members.filter((e: string) => e !== stateObject._id);
					en.common.members = members;
					await adapter.setForeignObjectAsync(enumID, en);
				}
			}
		}
	}
	return;
};

const addStateToEnums = async (adapter: ioBroker.Adapter, stateConfig: StateInformation): Promise<void> => {
	const addStateIDToEnum = async (_adapter: ioBroker.Adapter, enumID: string, stateID: string): Promise<void> => {
		const en = await _adapter.getForeignObjectAsync(enumID, 'enum');
		if (en && en.common.members) {
			en.common.members.push(stateID);
			await _adapter.setForeignObjectAsync(enumID, en);
		}
	};

	if (stateConfig.stateID && stateConfig.functions) {
		// add state to function enum from config
		await addStateIDToEnum(adapter, stateConfig.functions, stateConfig.stateID);
	}
	if (stateConfig.stateID && stateConfig.rooms) {
		// add state to room enum from config
		await addStateIDToEnum(adapter, stateConfig.rooms, stateConfig.stateID);
	}
};

const changeStateName = async (adapter: ioBroker.Adapter, stateConfig: StateInformation): Promise<void> => {
	if (stateConfig.stateID && stateConfig.stateName) {
		// change state name
		const en = await adapter.getForeignObjectAsync(stateConfig.stateID, 'state');
		if (en) {
			en.common.name = stateConfig.stateName;
			await adapter.setForeignObjectAsync(stateConfig.stateID, en);
		}
	}
};

const handleInfluxDBNewConfiguration = async (
	adapter: ioBroker.Adapter,
	stateConfig: StateInformation,
): Promise<void> => {
	adapter;
	stateConfig;

	// change alias on InfluxDBAdapter custom
	await InfluxDBHandlerAdapter.changeInfluxDBAdapterCustomAliasEntry(adapter, stateConfig);

	// change TimeSeries State Name on InfluxDB
	await InfluxDBHandlerAdapter.changeInfluxTimeSeries(adapter, stateConfig);

	// set enable on InfluxDBAdapter custom
	await InfluxDBHandlerAdapter.setInfluxDBAdapterCustomEnableEntry(adapter, stateConfig);

	return;
};

const removeAllRoomFunctionEnums_SubFunctions = {
	removeAllRoomFunctionEnums: removeAllRoomFunctionEnums,
	handleInfluxDBReset: handleInfluxDBReset,
	addStateToEnums: addStateToEnums,
	changeStateName: changeStateName,
	handleInfluxDBNewConfiguration: handleInfluxDBNewConfiguration,
};

export default removeAllRoomFunctionEnums_SubFunctions;
