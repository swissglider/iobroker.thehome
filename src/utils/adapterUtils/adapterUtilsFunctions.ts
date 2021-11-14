import * as utils from '@iobroker/adapter-core';
import { T_AdapterSingleStates } from '../types/T_IOBAdapter_Handler';

const _getInstances = async (adapter: ioBroker.Adapter, adapterName: string): Promise<ioBroker.GetObjectViewItem[]> => {
	const instances = await adapter.getObjectViewAsync('system', 'instance', {
		startkey: `system.adapter.${adapterName ? adapterName + '.' : ''}`,
		endkey: `system.adapter.${adapterName ? adapterName + '.' : ''}\u9999`,
	});
	if (!(instances && instances.rows && instances.rows[0])) {
		throw new Error(`There is no ${adapterName} Adapter`);
	}
	return instances.rows;
};

const getInstanceNative = async (
	adapter: ioBroker.Adapter,
	adapterName: string,
	instanceNumber?: number,
): Promise<Record<string, any> | (ioBroker.HostNative & Record<string, any>) | undefined> => {
	const iNumber = instanceNumber ?? 0;
	return (await _getInstances(adapter, adapterName))[iNumber].value?.native;
};

const getAdapterPath = async (adapter: ioBroker.Adapter, adapterName: string): Promise<string> => {
	const instance = await (await _getInstances(adapter, adapterName))[0];
	if (!instance) return '';
	return instance.id.replace(/system.adapter./g, '');
};

const getAdapterPathes = async (adapter: ioBroker.Adapter, adapterName: string): Promise<string[]> => {
	const instances = await _getInstances(adapter, adapterName);
	if (!instances) return [];
	const returnArray: string[] = [];
	for (const instance of instances) {
		returnArray.push(instance.id.replace(/system.adapter./g, ''));
	}
	return returnArray;
};

const isAdapterInstalled = async (adapter: ioBroker.Adapter, adapterName: string): Promise<boolean> => {
	const instances = await _getInstances(adapter, adapterName);
	if (!instances) return false;

	try {
		for (const instance of instances) {
			const results = await Promise.all([adapter.getForeignStatesAsync(`${instance.id}.alive`)]);
			const isAlive = results && results[0] && `${instance.id}.alive` in results[0];
			if (!isAlive) return false;
		}
		return true;
	} catch (error) {
		return false;
	}
};

const isAdapterRunning = async (adapter: ioBroker.Adapter, adapterName: string): Promise<boolean> => {
	const instances = await _getInstances(adapter, adapterName);
	if (!instances) return false;

	for (const instance of instances) {
		const results = await Promise.all([
			adapter.getForeignStatesAsync(`${instance.id}.alive`),
			adapter.getForeignStatesAsync(`${instance.id}.connected`),
		]);
		const isAlive = `${instance.id}.alive` in results[0] && results[0][`${instance.id}.alive`].val === true;
		const isConnected =
			`${instance.id}.connected` in results[1] && results[1][`${instance.id}.connected`].val === true;
		if (!(isAlive && isConnected)) return false;
	}
	return true;
};

const isAdapterConnected = async (adapter: ioBroker.Adapter, adapterName: string): Promise<boolean> => {
	const instances = await _getInstances(adapter, adapterName);
	if (!instances) return false;

	for (const instance of instances) {
		const instancePath = instance.id.replace(/system.adapter./g, '');

		const results = await Promise.all([
			adapter.getForeignStatesAsync(`${instance.id}.alive`),
			adapter.getForeignStatesAsync(`${instance.id}.connected`),
			adapter.getForeignStatesAsync(`${instancePath}.info.connection`),
		]);
		const isAlive = `${instance.id}.alive` in results[0] && results[0][`${instance.id}.alive`].val === true;
		const isConnected =
			`${instance.id}.connected` in results[1] && results[1][`${instance.id}.connected`].val === true;
		const isConnection =
			(`${instancePath}.info.connection` in results[2] &&
				results[2][`${instancePath}.info.connection`].val === true) ||
			Object.keys(results[2]).length === 0;
		if (!(isAlive && isConnected && isConnection)) return false;
	}
	return true;
};

const getAdapterSingleStates = async (
	adapter: ioBroker.Adapter,
	adapterName: string,
): Promise<T_AdapterSingleStates> => {
	const returnResult: T_AdapterSingleStates = {
		isAdapterInstalled: true,
		isAdapterRunning: true,
		isAdapterConnected: true,
	};
	const instances = await _getInstances(adapter, adapterName);
	if (!instances)
		return {
			isAdapterInstalled: false,
			isAdapterRunning: false,
			isAdapterConnected: false,
		};
	for (const instance of instances) {
		const instancePath = instance.id.replace(/system.adapter./g, '');

		const results = await Promise.all([
			adapter.getForeignStatesAsync(`${instance.id}.alive`),
			adapter.getForeignStatesAsync(`${instance.id}.connected`),
			adapter.getForeignStatesAsync(`${instancePath}.info.connection`),
		]);
		returnResult.isAdapterInstalled = `${instance.id}.alive` in results[0] && returnResult.isAdapterInstalled;
		returnResult.isAdapterRunning =
			`${instance.id}.connected` in results[1] &&
			results[1][`${instance.id}.connected`].val === true &&
			`${instance.id}.alive` in results[0] &&
			results[0][`${instance.id}.alive`].val === true &&
			returnResult.isAdapterRunning;
		returnResult.isAdapterConnected =
			((returnResult.isAdapterRunning &&
				`${instancePath}.info.connection` in results[2] &&
				(results[2][`${instancePath}.info.connection`].val === true ||
					(typeof results[2][`${instancePath}.info.connection`].val === 'string' &&
						results[2][`${instancePath}.info.connection`].val !== ''))) ||
				(returnResult.isAdapterRunning && Object.keys(results[2]).length === 0)) &&
			returnResult.isAdapterConnected;
	}
	return returnResult;
};

const checkIFStartable = async (adapter: ioBroker.Adapter): Promise<void> => {
	const error = 'Influxdb adapter needs to be installed on ioBroker';
	isAdapterInstalled(adapter, 'influxdb')
		.then((e) => {
			if (!e) {
				adapter.log.error(error);
				console.error(error);
				adapter.terminate(error, utils.EXIT_CODES.ADAPTER_REQUESTED_TERMINATION);
			}
		})
		.catch((reason) => {
			const _error = `${error} - ${reason}`;
			adapter.log.error(_error);
			console.error(_error);
			adapter.terminate(_error, utils.EXIT_CODES.ADAPTER_REQUESTED_TERMINATION);
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
	getAdapterPathes: getAdapterPathes,
};

export default AdapterUtilsFunctions;
