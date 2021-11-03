import AdapterUtilsFunctions from '../../utils/adapterUtils/adapterUtilsFunctions';
import { rearangeDeviceAndStates } from '../../utils/adapterUtils/RearangeDeviceAndStates';
import { T_AdapterStates, T_RearangeDeviceAndStates_Props, T_Rename_Adapter } from '../../utils/types/T_Rename_Adapter';

const name = 'ShellyAdapter';
const adapterName = 'shelly';

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

const _proceedRelay = async (
	adapter: ioBroker.Adapter,
	device: ioBroker.Object,
	returnStruct: T_RearangeDeviceAndStates_Props[],
): Promise<void> => {
	const channels = await adapter.getForeignObjectsAsync(device._id + '*', 'channel');
	for (const channel of Object.values(channels)) {
		if (channel._id.includes('Relay')) {
			const channelNameState = await adapter.getForeignStateAsync(channel._id + '.ChannelName');
			if (channelNameState && channelNameState.val && typeof channelNameState.val === 'string') {
				const [channelDeviceType, channelRoom, ...channnelAdditionalNames] = channelNameState.val.split(' ');
				returnStruct.push({
					deviceType: channelDeviceType,
					room: channelRoom,
					additionalNames: channnelAdditionalNames,
					rootObj: channel,
				});
			}
		}
	}
};

const rootLevelElementsCreator = async (adapter: ioBroker.Adapter): Promise<T_RearangeDeviceAndStates_Props[]> => {
	const rootLevelPath = await AdapterUtilsFunctions.getAdapterPath(adapter, adapterName);
	const devices = await adapter.getForeignObjectsAsync(rootLevelPath + '*', 'device');
	const returnStruct: T_RearangeDeviceAndStates_Props[] = [];

	if (devices) {
		for (const device of Object.values(devices)) {
			const typeObject = await adapter.getForeignStateAsync(device._id + '.mode');
			const nameObject = await adapter.getForeignStateAsync(device._id + '.name');
			if (nameObject && nameObject.val && typeof nameObject.val === 'string') {
				const [deviceType, room, ...additionalNames] = nameObject.val.split(' ');
				returnStruct.push({
					deviceType: 'Shelly',
					room,
					additionalNames: [...[deviceType], ...additionalNames],
					rootObj: device,
				});
				if (typeObject) {
					switch (typeObject.val) {
						case 'roller':
							const rootObj = await adapter.getForeignObjectAsync(device._id + '.Shutter');
							if (rootObj) {
								returnStruct.push({ deviceType, room, additionalNames, rootObj });
							}
							break;
						case 'relay':
							_proceedRelay(adapter, device, returnStruct);
						default:
					}
				} else {
					_proceedRelay(adapter, device, returnStruct);
				}
			}
		}
	}
	return returnStruct;
};

const rename = async (adapter: ioBroker.Adapter): Promise<string | { error: string }> => {
	return await rearangeDeviceAndStates(
		adapter,
		isHealth,
		adapter.config.ShellyAdapter_deviceTypeFunctionMappings,
		rootLevelElementsCreator,
	);
};

const ShellyAdapter: T_Rename_Adapter = {
	name: name,
	getHealthStati: getHealthStati,
	isHealth: isHealth,
	rename: rename,
};

export default ShellyAdapter;
