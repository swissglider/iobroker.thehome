import AdapterUtilsFunctions from '../../utils/adapterUtils/adapterUtilsFunctions';
import { rearangeDeviceAndStates } from '../../utils/adapterUtils/RearangeDeviceAndStates';
import { T_AdapterStates, T_RearangeDeviceAndStates_Props, T_Rename_Adapter } from '../../utils/types/T_Rename_Adapter';

const name = 'NetatmoAdapter';
const adapterName = 'netatmo';

const getHealthStati = async (adapter: ioBroker.Adapter): Promise<T_AdapterStates> => {
	const singleAStates = await AdapterUtilsFunctions.getAdapterSingleStates(adapter, adapterName);
	const returnValue = { ...singleAStates, ...{ adapterFullReady: false } };
	returnValue.adapterFullReady = returnValue.isAdapterInstalled && returnValue.isAdapterConnected;
	return returnValue;
};

const isHealth = async (adapter: ioBroker.Adapter): Promise<boolean> => {
	const returnValue = await getHealthStati(adapter);
	return Object.values(returnValue).every((e) => e);
};

const rootLevelElementsCreator = async (adapter: ioBroker.Adapter): Promise<T_RearangeDeviceAndStates_Props[]> => {
	const rootLevel = 'device';
	const rootLevelPath = await AdapterUtilsFunctions.getAdapterPath(adapter, adapterName);
	const rootLevelElements = await adapter.getForeignObjectsAsync(rootLevelPath + '*', rootLevel);
	const returnStruct: T_RearangeDeviceAndStates_Props[] = [];
	if (rootLevelElements) {
		for (const rootObj of Object.values(rootLevelElements)) {
			const [deviceType, room, ...additionalNames] = rootObj._id
				.substr(rootObj._id.lastIndexOf('.') + 1)
				.split('-');
			returnStruct.push({ deviceType, room, additionalNames, rootObj });
		}
	}
	return returnStruct;
};

const rename = async (adapter: ioBroker.Adapter): Promise<string | { error: string }> => {
	return await rearangeDeviceAndStates(
		adapter,
		isHealth,
		adapter.config.NetatmoAdapter_deviceTypeFunctionMappings,
		rootLevelElementsCreator,
	);
};

const NetatmoAdapter: T_Rename_Adapter = {
	name: name,
	getHealthStati: getHealthStati,
	isHealth: isHealth,
	rename: rename,
};

export default NetatmoAdapter;
