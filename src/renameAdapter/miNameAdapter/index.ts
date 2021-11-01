import AdapterUtilsFunctions from '../../utils/adapterUtils/adapterUtilsFunctions';
import { rearangeDeviceAndStates } from '../../utils/adapterUtils/RearangeDeviceAndStates';
import { T_AdapterStates, T_RearangeDeviceAndStates_Props, T_Rename_Adapter } from '../../utils/types/T_Rename_Adapter';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AuthMiIO, ApiMiIO } = require('miio-token-extractor');

const deviceLists: Record<string, any> = {};

const name = 'MiNameAdapter';
const miNameAdapterProps = {
	miHomeInstanceName: '',
};

const _getDeviceList = async (login: string, password: string, country: string): Promise<any> => {
	try {
		const stringTmp = `${login}-${password}-${country}`;
		if (stringTmp in deviceLists) {
			return deviceLists[stringTmp];
		}
		const authMiIO = new AuthMiIO();
		const apiMiIO = new ApiMiIO();
		const { userId, token, ssecurity } = await authMiIO.login(login, password);
		const devices = await apiMiIO.getDeviceList(userId, ssecurity, token, country);
		deviceLists[`${login}-${password}-${country}`] = devices;
		return devices;
	} catch (error) {
		throw new Error(`${error}`);
	}
};

const getGatewayToken = async (
	adapter: ioBroker.Adapter,
	{ login, password, country }: Record<string, any>,
): Promise<string> => {
	const devices = await _getDeviceList(login, password, country);
	const gateway = devices.find((e: any) => e.parent_id === '' && e.token);
	return gateway ? gateway.token : '';
};

const testConnectionWithNewParameter = async (
	adapter: ioBroker.Adapter,
	{ login, password, country }: Record<string, any>,
): Promise<string | { error: string }> => {
	try {
		await _getDeviceList(login, password, country);
		return 'ok';
	} catch (error) {
		return { error: `${error}` };
	}
};

const getMiTokenList = async (adapter: ioBroker.Adapter, _contry?: string): Promise<any> => {
	if (miNameAdapterProps.miHomeInstanceName === '') {
		miNameAdapterProps.miHomeInstanceName = await AdapterUtilsFunctions.getAdapterPath(adapter, 'mihome');
	}
	const miChannels = await adapter.getForeignObjectsAsync(miNameAdapterProps.miHomeInstanceName + '*', 'channel');
	const login = adapter.config.MiNameAdapter_login;
	const password = adapter.config.MiNameAdapter_password;
	const country = _contry ?? adapter.config.MiNameAdapter_defaultCountry;
	try {
		let devices = await _getDeviceList(login, password, country);
		devices = devices.map((device: any) => {
			const { did, token, name, localip, model, mac } = device;
			let stateID;
			if (model.includes('gateway')) {
				stateID = Object.keys(miChannels).find((e) => e.includes('gateway'));
			} else {
				stateID = Object.keys(miChannels).find((e) => e.includes(did.split('.').pop()));
			}
			const stateName = stateID ? miChannels[stateID].common.name : undefined;
			return { did, token, name, localip, model, mac, stateID, stateName };
			// return { did, token, name, localip, model, mac };
		});
		return devices;
	} catch (error) {
		throw error;
	}
};

const getHealthStati = async (adapter: ioBroker.Adapter): Promise<T_AdapterStates> => {
	const singleAStates = await AdapterUtilsFunctions.getAdapterSingleStates(adapter, 'mihome');
	const returnValue = { ...singleAStates, ...{ adapterFullReady: false } };
	const values = {
		login: adapter.config.MiNameAdapter_login,
		password: adapter.config.MiNameAdapter_password,
		country: adapter.config.MiNameAdapter_defaultCountry,
	};
	try {
		const result = await testConnectionWithNewParameter(adapter, values);
		if (typeof result === 'object' && result.error) {
			returnValue.adapterFullReady = false;
		} else {
			returnValue.adapterFullReady = true;
		}
	} catch (error) {
		returnValue.adapterFullReady = false;
	}
	return returnValue;
};

const isHealth = async (adapter: ioBroker.Adapter): Promise<boolean> => {
	const returnValue = await getHealthStati(adapter);
	return Object.values(returnValue).every((e) => e);
};

const rootLevelElementsCreator = async (adapter: ioBroker.Adapter): Promise<T_RearangeDeviceAndStates_Props[]> => {
	const returnStruct: T_RearangeDeviceAndStates_Props[] = [];
	const tokenList = await getMiTokenList(adapter);
	for (const comp of tokenList) {
		const rootID = comp.stateID;
		if (rootID && comp.name) {
			const rootObj = await adapter.getForeignObjectAsync(rootID);
			if (rootObj) {
				const [deviceType, room, ...additionalNames] = comp.name.split(' ');
				returnStruct.push({ deviceType, room, additionalNames, rootObj });
			}
		}
	}
	return returnStruct;
};

const rename = async (adapter: ioBroker.Adapter): Promise<string | { error: string }> => {
	return await rearangeDeviceAndStates(
		adapter,
		isHealth,
		adapter.config.MiNameAdapter_deviceTypeFunctionMappings,
		rootLevelElementsCreator,
	);
};

const MiNameAdapter: T_Rename_Adapter = {
	name: name,
	getHealthStati: getHealthStati,
	isHealth: isHealth,
	rename: rename,
	getGatewayToken: getGatewayToken,
	testConnectionWithNewParameter: testConnectionWithNewParameter,
	getMiTokenList: getMiTokenList,
};

export default MiNameAdapter;
