import AdapterUtilsFunctions from '../../utils/adapterUtils/adapterUtilsFunctions';
import NameHelper from '../../utils/adapterUtils/nameHelper';
import { rearangeDeviceAndStates } from '../../utils/adapterUtils/RearangeDeviceAndStates';
import {
	T_AdapterStates,
	T_IOBAdapter_Handler,
	// eslint-disable-next-line prettier/prettier
	T_RearangeDeviceAndStates_Props
} from '../../utils/types/T_IOBAdapter_Handler';

const name = 'DasWetterAdapter';
const adapterName = 'daswetter';

const getHealthStati = async (adapter: ioBroker.Adapter): Promise<T_AdapterStates> => {
	const instancePath = await AdapterUtilsFunctions.getAdapterPath(adapter, adapterName);
	const observeTimeState = await adapter.getForeignStateAsync(
		`${instancePath}.NextHours.Location_1.Day_1.current.temp_value`,
	);
	if (observeTimeState && typeof observeTimeState.ts) {
		const observeTime = new Date(observeTimeState.ts);
		const now = Date.now();
		const div = (now - observeTime.getTime()) / 1000 / 60;
		if (div < adapter.config.DasWetterAdapter_lastObeserveTimeSinceMinutes) {
			return {
				isAdapterInstalled: true,
				isAdapterRunning: true,
				isAdapterConnected: true,
				adapterFullReady: true,
			};
		}
	}
	throw new Error(
		`Last Update to long ago (more than ${adapter.config.DasWetterAdapter_lastObeserveTimeSinceMinutes} min), is the adapter still running and is it installed ?`,
	);
};

const isHealth = async (adapter: ioBroker.Adapter): Promise<boolean> => {
	const returnValue = await getHealthStati(adapter);
	return Object.values(returnValue).every((e) => e);
};

const rootLevelElementsCreator = async (adapter: ioBroker.Adapter): Promise<T_RearangeDeviceAndStates_Props[]> => {
	const rootLevelPath = await AdapterUtilsFunctions.getAdapterPath(adapter, adapterName);
	const returnStruct: T_RearangeDeviceAndStates_Props[] = [];
	const results = await Promise.all([
		adapter.getForeignObjectAsync(`${rootLevelPath}.NextHours.Location_1.Day_1.current`),
		adapter.getForeignObjectAsync(`${rootLevelPath}.NextHours.Location_1.Day_1.Hour_1`),
	]);
	const room = 'draussen';
	if (results[0]) {
		returnStruct.push({
			deviceType: 'Aktualles_Wetter',
			room,
			additionalNames: [NameHelper.getName(results[0]?.common.name ?? '')],
			rootObj: results[0],
		});
	}
	if (results[1]) {
		returnStruct.push({
			deviceType: 'ForecastNächsteStunde_Wetter',
			room,
			additionalNames: [NameHelper.getName(results[1]?.common.name ?? '')],
			rootObj: results[1],
		});
	}
	return returnStruct;
};

const rename = async (adapter: ioBroker.Adapter): Promise<string | { error: string }> => {
	return await rearangeDeviceAndStates(adapter, isHealth, rootLevelElementsCreator);
};

const DasWetterAdapter: T_IOBAdapter_Handler = {
	name: name,
	isHealth: isHealth,
	onMessageFunc: { getHealthStati: getHealthStati, rename: rename },
};

export default DasWetterAdapter;
