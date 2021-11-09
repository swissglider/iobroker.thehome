import * as E from 'fp-ts/Either';
import * as D from 'io-ts/Decoder';
import BatteryChecker from '../../../checker/batteryChecker';
import ConnectionChecker from '../../../checker/connectionChecker';
import EnumHandler from '../../../utils/adapterUtils/enumHandler';
import IOBrokerObjectHanlder_Name_Custom from '../../../utils/adapterUtils/ioBrokerObjectHanlder_Name_Custom';
import { StateInformation, stateInformations } from '../interfaces/I_StateInformation';

export const statesConfigUpload = async (adapter: ioBroker.Adapter, config: StateInformation[]): Promise<string> => {
	// check config
	const decodedConfig: E.Either<D.DecodeError, StateInformation[]> = stateInformations.decode(config);
	if (E.isLeft(decodedConfig)) return 'Wrong configuration, please check the file !';

	// ==== pre work
	// = stop Battery Checker
	// = stop Connection Checker
	// = stop Config Change Listener
	// = remove states from all function and room enum
	try {
		await Promise.all([
			BatteryChecker.exportFunc.stopBatteryChecker(),
			ConnectionChecker.exportFunc.stopConnectionChecker(),
			EnumHandler.removeAllStatesFromAllRoomFunctionEnums(adapter),
		]);
	} catch (error) {
		return `unknown error while stopping connection/battery checker or configChange listener / deleting all enums with state: ${error}`;
	}

	// ==== set new Config
	// = add all states to enums (functions/rooms) and create the enum if needed
	// = change name and store2DB on all Objects
	try {
		await Promise.all([
			EnumHandler.addAllStatesToEnums(adapter, config),
			IOBrokerObjectHanlder_Name_Custom.changeAllStateNameAndInfluxCustom(adapter, config),
		]);
	} catch (error) {
		console.error((error as TypeError).stack);
		return `unknown error while setting name or Store2DB Parameters: ${error}`;
	}

	// ==== set new config
	// = new init ConfigChangeListener (includes new init of DB)
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
