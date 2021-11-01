import * as utils from '@iobroker/adapter-core';
import { T_AdapterSingleStates } from '../types/T_Rename_Adapter';

const _getInstance = async (adapter: ioBroker.Adapter, adapterName: string): Promise<ioBroker.GetObjectViewItem> => {
	const instances = await adapter.getObjectViewAsync('system', 'instance', {
		startkey: `system.adapter.${adapterName ? adapterName + '.' : ''}`,
		endkey: `system.adapter.${adapterName ? adapterName + '.' : ''}\u9999`,
	});
	if (!(instances && instances.rows && instances.rows[0])) {
		throw new Error(`There is no ${adapterName} Adapter`);
	}
	return instances.rows[0];
};

const getInstanceNative = async (
	adapter: ioBroker.Adapter,
	adapterName: string,
): Promise<Record<string, any> | (ioBroker.HostNative & Record<string, any>) | undefined> => {
	return (await _getInstance(adapter, adapterName)).value?.native;
};

const getAdapterPath = async (adapter: ioBroker.Adapter, adapterName: string): Promise<string> => {
	const instance = await _getInstance(adapter, adapterName);
	if (!instance) return '';
	return instance.id.replace(/system.adapter./g, '');
};

const isAdapterInstalled = async (adapter: ioBroker.Adapter, adapterName: string): Promise<boolean> => {
	const instance = await _getInstance(adapter, adapterName);
	if (!instance) return false;

	try {
		const results = await Promise.all([adapter.getForeignStatesAsync(`${instance.id}.alive`)]);
		const isAlive = results && results[0] && `${instance.id}.alive` in results[0];
		return isAlive;
	} catch (error) {
		return false;
	}
};

const isAdapterRunning = async (adapter: ioBroker.Adapter, adapterName: string): Promise<boolean> => {
	const instance = await _getInstance(adapter, adapterName);
	if (!instance) return false;

	const results = await Promise.all([
		adapter.getForeignStatesAsync(`${instance.id}.alive`),
		adapter.getForeignStatesAsync(`${instance.id}.connected`),
	]);
	const isAlive = `${instance.id}.alive` in results[0] && results[0][`${instance.id}.alive`].val === true;
	const isConnected = `${instance.id}.connected` in results[1] && results[1][`${instance.id}.connected`].val === true;
	return isAlive && isConnected;
};

const isAdapterConnected = async (adapter: ioBroker.Adapter, adapterName: string): Promise<boolean> => {
	const instance = await _getInstance(adapter, adapterName);
	if (!instance) return false;
	const instancePath = instance.id.replace(/system.adapter./g, '');

	const results = await Promise.all([
		adapter.getForeignStatesAsync(`${instance.id}.alive`),
		adapter.getForeignStatesAsync(`${instance.id}.connected`),
		adapter.getForeignStatesAsync(`${instancePath}.info.connection`),
	]);
	const isAlive = `${instance.id}.alive` in results[0] && results[0][`${instance.id}.alive`].val === true;
	const isConnected = `${instance.id}.connected` in results[1] && results[1][`${instance.id}.connected`].val === true;
	const isConnection =
		(`${instancePath}.info.connection` in results[2] &&
			results[2][`${instancePath}.info.connection`].val === true) ||
		Object.keys(results[2]).length === 0;
	return isAlive && isConnected && isConnection;
};

const getAdapterSingleStates = async (
	adapter: ioBroker.Adapter,
	adapterName: string,
): Promise<T_AdapterSingleStates> => {
	const returnResult: T_AdapterSingleStates = {
		isAdapterInstalled: false,
		isAdapterRunning: false,
		isAdapterConnected: false,
	};
	const instance = await _getInstance(adapter, adapterName);
	if (!instance) return returnResult;
	const instancePath = instance.id.replace(/system.adapter./g, '');

	const results = await Promise.all([
		adapter.getForeignStatesAsync(`${instance.id}.alive`),
		adapter.getForeignStatesAsync(`${instance.id}.connected`),
		adapter.getForeignStatesAsync(`${instancePath}.info.connection`),
	]);
	returnResult.isAdapterInstalled = `${instance.id}.alive` in results[0];
	returnResult.isAdapterRunning =
		`${instance.id}.connected` in results[1] &&
		results[1][`${instance.id}.connected`].val === true &&
		`${instance.id}.alive` in results[0] &&
		results[0][`${instance.id}.alive`].val === true;
	returnResult.isAdapterConnected =
		(returnResult.isAdapterRunning &&
			`${instancePath}.info.connection` in results[2] &&
			results[2][`${instancePath}.info.connection`].val === true) ||
		(returnResult.isAdapterRunning && Object.keys(results[2]).length === 0);
	return returnResult;
};

const checkIFStartable = async (adapter: ioBroker.Adapter): Promise<void> => {
	isAdapterInstalled(adapter, 'influxdb')
		.then((e) => {
			if (e) {
				// console.info('Influxdb installed ;-)');
				// adapter.log.info('Influxdb installed ;-)');
			} else {
				const error = 'Influxdb adapter needs to be installed';
				adapter.log.error(error);
				console.error(error);
				adapter.terminate(error, utils.EXIT_CODES.ADAPTER_REQUESTED_TERMINATION);
			}
		})
		.catch((reason) => {
			const error = `Influxdb adapter needs to be installed - ${reason}`;
			adapter.log.error(error);
			console.error(error);
			adapter.terminate(error, utils.EXIT_CODES.ADAPTER_REQUESTED_TERMINATION);
		});
};

const AdapterUtilsFunctions = {
	isAdapterInstalled: isAdapterInstalled,
	isAdapterRunning: isAdapterRunning,
	isAdapterConnected: isAdapterConnected,
	checkIFStartable: checkIFStartable,
	getAdapterSingleStates: getAdapterSingleStates,
	getAdapterPath: getAdapterPath,
	getInstanceNative: getInstanceNative,
};

export default AdapterUtilsFunctions;
