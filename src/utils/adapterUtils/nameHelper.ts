import { T_Object_Parent_Names } from '../types/T_Object_Parent_Names';

const getName = (name: ioBroker.StringOrTranslated, systemLanguage: ioBroker.Languages = 'de'): string => {
	if (typeof name === 'string') {
		return name;
	} else if (
		typeof name === 'object' &&
		typeof systemLanguage === 'string' &&
		systemLanguage &&
		systemLanguage in name &&
		name[systemLanguage]
	) {
		return name[systemLanguage] as string;
	} else if (typeof name === 'object' && 'en' in name && name.en) {
		return name.en;
	} else if (typeof name === 'object' && 'de' in name && name.de) {
		return name.de;
	} else {
		return name.toString();
	}
};

/**
 *
 * @param enumObjects object from ioBorker.Object.enums
 * @param filterEnumString string to find the right Enum i.e. '.rooms.'
 * @param defaultString string to return if nothing found or enumObject is undefined of wrong..
 * @returns name of the first found enum fitting the filterEnumString localized to the system language
 */
const getEnumNameFromObject = (
	adapter: ioBroker.Adapter,
	enumObjects: Record<string, ioBroker.StringOrTranslated> | undefined,
	filterEnumString: string,
	defaultString?: string | undefined,
): string | undefined => {
	if (enumObjects && typeof enumObjects === 'object') {
		const tmp = Object.entries(enumObjects).find(([key]) => key.includes(filterEnumString));
		return tmp ? getName(tmp[1], adapter.systemConfig?.language ?? 'de') : defaultString;
	}
	return defaultString;
};

/**
 *
 * @param adapter ioBrokerAdapter
 * @param id stateID
 * @returns Promise of a Touple with [channelName | undefined, deviceName | undefined]
 */
const getObjectParentNames = async (adapter: ioBroker.Adapter, id: string): Promise<T_Object_Parent_Names> => {
	const array = id.split('.');
	const retrurnNames: T_Object_Parent_Names = {
		adapterName: array[0],
		instanceNumber: array[1],
	};
	if (!Array.isArray(array) || array.length < 2) return retrurnNames;
	while (!(retrurnNames.channelName !== undefined && retrurnNames.deviceName !== undefined) && array.length > 1) {
		array.pop();
		const tempID = array.join('.');
		const tempObj = await adapter.getForeignObjectAsync(tempID, '*');
		if (tempObj) {
			switch (tempObj.type) {
				case 'channel': {
					retrurnNames.channelName = getName(
						tempObj?.common?.name ?? '',
						adapter.systemConfig?.language ?? 'de',
					);
					break;
				}
				case 'device': {
					retrurnNames.deviceName = getName(
						tempObj?.common?.name ?? '',
						adapter.systemConfig?.language ?? 'de',
					);
					break;
				}
			}
		}
	}
	return retrurnNames;
};

const NameHelper = {
	getName: getName,
	getEnumNameFromObject: getEnumNameFromObject,
	getObjectParentNames: getObjectParentNames,
};

export default NameHelper;
