import * as E from 'fp-ts/Either';
import * as D from 'io-ts/Decoder';
import BatteryChecker from '../../../checker/batteryChecker';
import ConnectionChecker from '../../../checker/connectionChecker';
import EnumHandler from '../../../utils/adapterUtils/enumHandler';
import CustomHandler_InfluxDBAdapter from '../../../utils/adapterUtils/ioBrokerObjectHanlder_Name_Custom';
import { StateInformation, stateInformation } from '../interfaces/I_StateInformation';

export const singleStateConfigUpload = async (
	adapter: ioBroker.Adapter,
	stateConfig: StateInformation,
): Promise<string> => {
	// check config
	const decodedConfig: E.Either<D.DecodeError, StateInformation> = stateInformation.decode(stateConfig);
	if (E.isLeft(decodedConfig)) return 'Wrong configuration, please check the input !';

	// ==== pre work
	// = stop Battery Checker
	// = stop Connection Checker
	// = remove state from all function and room enum
	try {
		await Promise.all([
			BatteryChecker.exportFunc.stopBatteryChecker(),
			ConnectionChecker.exportFunc.stopConnectionChecker(),
			EnumHandler.removeStateFromAllRoomFunctionEnums(adapter, stateConfig.stateID),
		]);
	} catch (error) {
		return `unknown error while stopping connection or battery checker / deleting all enums with state: ${error}`;
	}

	// ==== set new config
	// = add state To Enums
	try {
		await EnumHandler.addStateToEnums(adapter, stateConfig);
	} catch (error) {
		return `unknown error while adding the state to the enums: ${error}`;
	}
	// = change name and store2DB on Object
	try {
		await CustomHandler_InfluxDBAdapter.changeStateNameAndInfluxCustom(adapter, stateConfig);
	} catch (error) {
		return `unknown error while setting config name or store2DB: ${error}`;
	}

	// ==== set new config
	// = new init BatteryChecker
	// = new init ConnectionChecker
	try {
		await Promise.all([
			BatteryChecker.exportFunc.initBatteryChecker(),
			ConnectionChecker.exportFunc.initConnectionChecker(),
		]);
	} catch (error) {
		return `unknown error while init connection or battery checker: ${error}`;
	}

	// ==== result
	// return result
	return 'ok';
};
