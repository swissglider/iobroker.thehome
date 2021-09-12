import InfluxDBHandlerAdapter from '../influxDBHandlerAdapter';
import { StateInformation } from './interfaces/I_StateInformation';

const handleInfluxDBReset = async (adapter: ioBroker.Adapter, stateObject: ioBroker.Object): Promise<void> => {
	// reset Influx TimeSeries to org Statename on InfluxDB
	await InfluxDBHandlerAdapter.resetInfluxTimeSeries(adapter, stateObject);

	// delete custom InfluxDBAdapter entry
	await InfluxDBHandlerAdapter.deletCustomInfluxDBAdapterEntries(adapter, stateObject);
	return;
};

const handleInfluxDBNewConfiguration = async (
	adapter: ioBroker.Adapter,
	stateConfig: StateInformation,
): Promise<void> => {
	adapter;
	stateConfig;

	// change alias on InfluxDBAdapter custom
	await InfluxDBHandlerAdapter.changeInfluxDBAdapterCustomAliasEntry(adapter, stateConfig);

	// change TimeSeries State Name on InfluxDB
	await InfluxDBHandlerAdapter.changeInfluxTimeSeries(adapter, stateConfig);

	// set enable on InfluxDBAdapter custom
	await InfluxDBHandlerAdapter.setInfluxDBAdapterCustomEnableEntry(adapter, stateConfig);

	return;
};

const removeAllRoomFunctionEnums_SubFunctions = {
	handleInfluxDBReset: handleInfluxDBReset,
	handleInfluxDBNewConfiguration: handleInfluxDBNewConfiguration,
};

export default removeAllRoomFunctionEnums_SubFunctions;
