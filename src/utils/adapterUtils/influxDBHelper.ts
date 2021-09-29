const getInfluxInstanceName = async (adapter: ioBroker.Adapter): Promise<string> => {
	const obj = await adapter.getForeignObjectsAsync('*', 'instance');
	for (const key of Object.keys(obj)) {
		if (key.includes('.influxdb.')) {
			return key.replace(/system.adapter./g, '');
		}
	}
	throw new Error('Probably InfluxDB Adapter is not installed, but required');
};

const InfluxDBHelper = {
	getInfluxInstanceName: getInfluxInstanceName,
};

export default InfluxDBHelper;
