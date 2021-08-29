import AdapterUtils, { StateInformation } from '../../utils/adapterUtils';
import removeAllRoomFunctionEnums_SubFunctions from './removeAllRoomFunctionEnums_SubFunctions';

const configDownload = async (adapter: ioBroker.Adapter): Promise<string> => {
	const states = await AdapterUtils.getAllStatesWithFunctionAndOrRoomEnumsAsStateInformation(adapter);
	return JSON.stringify(states, null, 2);
};

const configUpload = async (adapter: ioBroker.Adapter, config: StateInformation[]): Promise<string> => {
	// stop all services
	try {
		await AdapterUtils.stopAllServices();
	} catch (error) {
		return `unknown error while stopping all services: ${error}`;
	}

	// get all States with Room or/and Function enums
	let stateObjects: ioBroker.Object[];
	try {
		stateObjects = await AdapterUtils.getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject(adapter);
	} catch (error) {
		return `unknown error while getting all the states: ${error}`;
	}

	// reseting all states
	try {
		//read next config state
		for (const stateObject of stateObjects) {
			await Promise.all([
				removeAllRoomFunctionEnums_SubFunctions.handleInfluxDBReset(adapter, stateObject),
				removeAllRoomFunctionEnums_SubFunctions.removeAllRoomFunctionEnums(adapter, stateObject),
			]);
		}
	} catch (error) {
		return `unknown error while removing or reset states: ${error}`;
	}

	// set new Config
	try {
		for (const stateConfig of config) {
			await Promise.all([
				removeAllRoomFunctionEnums_SubFunctions.addStateToEnums(adapter, stateConfig),
				removeAllRoomFunctionEnums_SubFunctions.changeStateName(adapter, stateConfig),
				removeAllRoomFunctionEnums_SubFunctions.handleInfluxDBNewConfiguration(adapter, stateConfig),
			]);
		}
	} catch (error) {
		return `unknown error while setting new config: ${error}`;
	}

	// restart all services
	try {
		await AdapterUtils.restartAllServices();
	} catch (error) {
		return `unknown error while stopping all services: ${error}`;
	}
	return 'ok';
};

const ConfigAdapterFunctions = {
	configDownload: configDownload,
	configUpload: configUpload,
};

export default ConfigAdapterFunctions;
