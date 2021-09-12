import { StateInformation } from '../configAdapter/interfaces/I_StateInformation';

const resetInfluxTimeSeries = async (adapter: ioBroker.Adapter, stateObject: ioBroker.Object): Promise<void> => {
	adapter;
	stateObject;
	//TODO
};

const deletCustomInfluxDBAdapterEntries = async (
	adapter: ioBroker.Adapter,
	stateObject: ioBroker.Object,
): Promise<void> => {
	adapter;
	stateObject;
	//TODO
};

const changeInfluxDBAdapterCustomAliasEntry = async (
	adapter: ioBroker.Adapter,
	stateConfig: StateInformation,
): Promise<void> => {
	adapter;
	stateConfig;
	//TODO
};

const changeInfluxTimeSeries = async (adapter: ioBroker.Adapter, stateConfig: StateInformation): Promise<void> => {
	adapter;
	stateConfig;
	//TODO
};

const setInfluxDBAdapterCustomEnableEntry = async (
	adapter: ioBroker.Adapter,
	stateConfig: StateInformation,
): Promise<void> => {
	adapter;
	stateConfig;
	//TODO
};

const InfluxDBHandlerAdapter = {
	resetInfluxTimeSeries: resetInfluxTimeSeries,
	deletCustomInfluxDBAdapterEntries: deletCustomInfluxDBAdapterEntries,
	changeInfluxDBAdapterCustomAliasEntry: changeInfluxDBAdapterCustomAliasEntry,
	changeInfluxTimeSeries: changeInfluxTimeSeries,
	setInfluxDBAdapterCustomEnableEntry: setInfluxDBAdapterCustomEnableEntry,
};

export default InfluxDBHandlerAdapter;
