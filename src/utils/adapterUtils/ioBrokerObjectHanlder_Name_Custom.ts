import { StateInformation } from '../../adapters/configAdapter/interfaces/I_StateInformation';
import AdapterUtilsFunctions from './adapterUtilsFunctions';

const setInfluxCustom = async (adapter: ioBroker.Adapter, stateName: string, store2DB: boolean): Promise<void> => {
	// activate / deactivate DB
	const influxDBName = await AdapterUtilsFunctions.getAdapterPath(adapter, 'influxdb');
	if (store2DB) {
		await adapter.sendToAsync(influxDBName, 'enableHistory', {
			id: stateName,
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
		await adapter.sendToAsync(influxDBName, 'disableHistory', { id: stateName });
	}
};

const changeStateNameAndInfluxCustom = async (
	adapter: ioBroker.Adapter,
	stateConfig: StateInformation,
): Promise<void> => {
	if (stateConfig.stateID && stateConfig.stateName) {
		const ob = await adapter.getForeignObjectAsync(stateConfig.stateID, 'state');
		if (ob) {
			// change state name
			ob.common.name = stateConfig.stateName;
			delete ob.enums;
			// save object
			await adapter.setForeignObjectAsync(stateConfig.stateID, ob);

			// activate / deactivate DB
			await setInfluxCustom(adapter, ob._id, stateConfig.store2DB);
		}
	}
};

const changeAllStateNameAndInfluxCustom = async (
	adapter: ioBroker.Adapter,
	config: StateInformation[],
): Promise<void> => {
	for (const stateConfig of config) {
		await changeStateNameAndInfluxCustom(adapter, stateConfig);
	}
};

const IOBrokerObjectHanlder_Name_Custom = {
	changeStateNameAndInfluxCustom: changeStateNameAndInfluxCustom,
	changeAllStateNameAndInfluxCustom: changeAllStateNameAndInfluxCustom,
	setInfluxCustom: setInfluxCustom,
};

export default IOBrokerObjectHanlder_Name_Custom;
