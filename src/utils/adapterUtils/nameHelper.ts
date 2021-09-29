import { StateInformation } from '../../adapters/configAdapter/interfaces/I_StateInformation';
import InfluxDBHelper from './influxDBHelper';

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

const changeStateNameAndStore2DB = async (adapter: ioBroker.Adapter, stateConfig: StateInformation): Promise<void> => {
	if (stateConfig.stateID && stateConfig.stateName) {
		const ob = await adapter.getForeignObjectAsync(stateConfig.stateID, 'state');
		if (ob) {
			// change state name
			ob.common.name = stateConfig.stateName;
			delete ob.enums;
			// save object
			await adapter.setForeignObjectAsync(stateConfig.stateID, ob);

			// activate / deactivate DB
			const influxDBName = await InfluxDBHelper.getInfluxInstanceName(adapter);
			if (stateConfig.store2DB) {
				await adapter.sendToAsync(influxDBName, 'enableHistory', {
					id: ob._id,
					options: {
						storageType: '',
						aliasId: '',
						changesOnly: false,
						debounce: 1000,
						changesRelogInterval: 0,
						changesMinDelta: 0,
					},
				});
			} else {
				await adapter.sendToAsync(influxDBName, 'disableHistory', { id: ob._id });
			}
		}
	}
};

const changeAllStateNameAndStore2DBs = async (adapter: ioBroker.Adapter, config: StateInformation[]): Promise<void> => {
	for (const stateConfig of config) {
		await changeStateNameAndStore2DB(adapter, stateConfig);
	}
};

const NameHelper = {
	changeStateNameAndStore2DB: changeStateNameAndStore2DB,
	changeAllStateNameAndStore2DBs: changeAllStateNameAndStore2DBs,
	getName: getName,
};

export default NameHelper;
