import AdapterUtilsFunctions from '../../utils/adapterUtils/adapterUtilsFunctions';
import NameHelper from '../../utils/adapterUtils/nameHelper';
import { rearangeDeviceAndStates } from '../../utils/adapterUtils/RearangeDeviceAndStates';
import {
	T_AdapterStates,
	T_IOBAdapter_Handler,
	// eslint-disable-next-line prettier/prettier
	T_RearangeDeviceAndStates_Props
} from '../../utils/types/T_IOBAdapter_Handler';

const name = 'HMIPAdapter';
const adapterName = 'hmip';

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
	const rootLevelElements = await adapter.getForeignObjectsAsync(rootLevelPath + '.devices*', rootLevel);
	const returnStruct: T_RearangeDeviceAndStates_Props[] = [];
	if (rootLevelElements) {
		for (const rootObj of Object.values(rootLevelElements)) {
			const name = NameHelper.getName(rootObj.common?.name ?? '', adapter.systemConfig?.language ?? 'de');
			const [deviceType, room, ...additionalNames] = name.split(' ');
			returnStruct.push({ deviceType, room, additionalNames, rootObj });
		}
	}
	return returnStruct;
};

const rename = async (adapter: ioBroker.Adapter): Promise<string | { error: string }> => {
	return await rearangeDeviceAndStates(adapter, isHealth, rootLevelElementsCreator);
};

const HMIPAdapter: T_IOBAdapter_Handler = {
	name: name,
	isHealth: isHealth,
	onMessageFunc: { getHealthStati: getHealthStati, rename: rename },
};

export default HMIPAdapter;
