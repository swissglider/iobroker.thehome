import * as E from 'fp-ts/Either';
import * as D from 'io-ts/Decoder';
import AdapterUtils from '../../utils/adapterUtils';
import { StateInformation, stateInformations } from '../../utils/adapterUtils/I_StateInformation';
import removeAllRoomFunctionEnums_SubFunctions from './removeAllRoomFunctionEnums_SubFunctions';

const statesConfigDownload = async (adapter: ioBroker.Adapter): Promise<string> => {
	const states = await AdapterUtils.getAllStatesWithFunctionAndOrRoomEnumsAsStateInformation(adapter);
	return JSON.stringify(states, null, 2);
};

const statesConfigUpload = async (adapter: ioBroker.Adapter, config: StateInformation[]): Promise<string> => {
	// check config
	const decodedConfig: E.Either<D.DecodeError, StateInformation[]> = stateInformations.decode(config);
	if (E.isLeft(decodedConfig)) return 'Wrong configuration, please check the file !';

	// stop all services
	try {
		await AdapterUtils.stopAllServices(adapter);
	} catch (error) {
		return `unknown error while stopping all services: ${error}`;
	}

	// get all State Objects with Room or/and Function enums
	let stateObjects: ioBroker.Object[];
	try {
		stateObjects = await AdapterUtils.getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject(adapter);
	} catch (error) {
		return `unknown error while getting all the states: ${error}`;
	}

	// resetting all states
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
		await AdapterUtils.restartAllServices(adapter);
	} catch (error) {
		return `unknown error while starting all services: ${error}`;
	}
	return 'ok';
};

const singleStateConfigUpload = async (adapter: ioBroker.Adapter, stateConfig: StateInformation): Promise<string> => {
	// remove State from all Services
	try {
		await AdapterUtils.removeStateFromAllServices(adapter, stateConfig);
	} catch (error) {
		return `unknown error while removing state from all services: ${error}`;
	}

	// get all State Object with  enums
	try {
		const stateObjects = await adapter.getForeignObjectsAsync(stateConfig.stateID, 'state', ['rooms', 'functions']);
		const stateObject = Object.values(stateObjects)[0];
		if (stateObject) {
			// resetting state
			try {
				await Promise.all([
					removeAllRoomFunctionEnums_SubFunctions.handleInfluxDBReset(adapter, stateObject),
					removeAllRoomFunctionEnums_SubFunctions.removeAllRoomFunctionEnums(adapter, stateObject),
				]);
			} catch (error) {
				return `unknown error while removing or reset state: ${error}`;
			}
		}
	} catch (error) {
		return `unknown error while getting all the states: ${error}`;
	}

	//set new Config
	try {
		await Promise.all([
			removeAllRoomFunctionEnums_SubFunctions.addStateToEnums(adapter, stateConfig),
			removeAllRoomFunctionEnums_SubFunctions.changeStateName(adapter, stateConfig),
			removeAllRoomFunctionEnums_SubFunctions.handleInfluxDBNewConfiguration(adapter, stateConfig),
		]);
	} catch (error) {
		return `unknown error while setting new config: ${error}`;
	}

	// add state to all services
	try {
		await AdapterUtils.addStateToAllServices(adapter, stateConfig);
	} catch (error) {
		return `unknown error while adding state to all services: ${error}`;
	}
	return 'ok';
};

const ConfigAdapterFunctions = {
	statesConfigDownload: statesConfigDownload,
	statesConfigUpload: statesConfigUpload,
	singleStateConfigUpload: singleStateConfigUpload,
};

export default ConfigAdapterFunctions;
