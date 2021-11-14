import AdapterUtilsFunctions from '../../utils/adapterUtils/adapterUtilsFunctions';
import { rearangeDeviceAndStates } from '../../utils/adapterUtils/RearangeDeviceAndStates';
import {
	T_AdapterStates,
	T_IOBAdapter_Handler,
	// eslint-disable-next-line prettier/prettier
	T_RearangeDeviceAndStates_Props
} from '../../utils/types/T_IOBAdapter_Handler';

const name = 'JeelinkAdapter';
const adapterName = 'jeelink';

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
	const rootLevel = 'channel';
	const returnStruct: T_RearangeDeviceAndStates_Props[] = [];
	const rootLevelPathes = await AdapterUtilsFunctions.getAdapterPathes(adapter, adapterName);
	for (const rootLevelPath of rootLevelPathes) {
		const rootLevelElements = await adapter.getForeignObjectsAsync(rootLevelPath + '*', rootLevel);
		if (rootLevelElements) {
			for (const rootObj of Object.values(rootLevelElements)) {
				const [deviceType, room, ...additionalNames] = rootObj._id
					.substr(rootObj._id.lastIndexOf('_') + 1)
					.split(' ');
				returnStruct.push({ deviceType, room, additionalNames, rootObj });
			}
		}
	}
	return returnStruct;
};

const rename = async (adapter: ioBroker.Adapter): Promise<string | { error: string }> => {
	return await rearangeDeviceAndStates(adapter, isHealth, rootLevelElementsCreator);
};

const JeelinkAdapter: T_IOBAdapter_Handler = {
	name: name,
	isHealth: isHealth,
	onMessageFunc: { getHealthStati: getHealthStati, rename: rename },
};

export default JeelinkAdapter;
