import axios from 'axios';
import AdapterUtilsFunctions from '../../utils/adapterUtils/adapterUtilsFunctions';
import { rearangeDeviceAndStates } from '../../utils/adapterUtils/RearangeDeviceAndStates';
import {
	T_AdapterStates,
	T_IOBAdapter_Handler,
	// eslint-disable-next-line prettier/prettier
	T_RearangeDeviceAndStates_Props
} from '../../utils/types/T_IOBAdapter_Handler';

const name = 'SonoffAdapter';
const adapterName = 'sonoff';

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
	const rootLevelPath = await AdapterUtilsFunctions.getAdapterPath(adapter, adapterName);
	const rootLevelElements = await adapter.getForeignObjectsAsync(rootLevelPath + '*', rootLevel);
	const returnStruct: T_RearangeDeviceAndStates_Props[] = [];
	if (rootLevelElements) {
		for (const rootObj of Object.values(rootLevelElements)) {
			if (!rootObj._id.endsWith('.info')) {
				try {
					const ipAddress = await adapter.getForeignStateAsync(`${rootObj._id}.INFO.Info2_IPAddress`);
					if (ipAddress && ipAddress.val) {
						const {
							data: { DeviceName },
						} = await axios.get(`http://${ipAddress.val}/cm?cmnd=DeviceName`);
						const [deviceType, room, ...additionalNames] = DeviceName.split(' ');

						const { data: friendlyName } = await axios.get(`http://${ipAddress.val}/cm?cmnd=FriendlyName`);
						const funcID2NameMap: Record<string, string> = {};
						if (deviceType === '4CH') {
							Object.values(friendlyName).forEach((value, index) => {
								funcID2NameMap[`POWER${index + 1}`] = value as string;
							});
						} else if (deviceType === 'Switch') {
							funcID2NameMap['POWER'] = friendlyName['FriendlyName1'];
						}
						returnStruct.push({ deviceType, room, additionalNames, rootObj, funcID2NameMap });
					}
				} catch (error) {}
			}
		}
	}
	return returnStruct;
};

const rename = async (adapter: ioBroker.Adapter): Promise<string | { error: string }> => {
	return await rearangeDeviceAndStates(
		adapter,
		isHealth,
		adapter.config.SonoffAdapter_deviceTypeFunctionMappings,
		rootLevelElementsCreator,
	);
};

const SonoffAdapter: T_IOBAdapter_Handler = {
	name: name,
	isHealth: isHealth,
	onMessageFunc: { getHealthStati: getHealthStati, rename: rename },
};

export default SonoffAdapter;
