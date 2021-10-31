"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _getInstance = async (adapter, adapterName) => {
    const instances = await adapter.getObjectViewAsync('system', 'instance', {
        startkey: `system.adapter.${adapterName ? adapterName + '.' : ''}`,
        endkey: `system.adapter.${adapterName ? adapterName + '.' : ''}\u9999`,
    });
    if (!(instances && instances.rows && instances.rows[0])) {
        Promise.reject(`There is no ${adapterName} Adapter`);
    }
    return instances.rows[0];
};
const isAdapterInstalled = async (adapter, adapterName) => {
    const instance = await _getInstance(adapter, adapterName);
    const results = await Promise.all([adapter.getForeignStatesAsync(`${instance.id}.alive`)]);
    const isAlive = `${instance.id}.alive` in results[0] && results[0][`${instance.id}.alive`].val === true;
    return isAlive;
};
const isAdapterRunning = async (adapter, adapterName) => {
    const instance = await _getInstance(adapter, adapterName);
    const results = await Promise.all([
        adapter.getForeignStatesAsync(`${instance.id}.alive`),
        adapter.getForeignStatesAsync(`${instance.id}.connected`),
    ]);
    const isAlive = `${instance.id}.alive` in results[0] && results[0][`${instance.id}.alive`].val === true;
    const isConnected = `${instance.id}.connected` in results[1] && results[1][`${instance.id}.connected`].val === true;
    return isAlive && isConnected;
};
const isAdapterConnected = async (adapter, adapterName) => {
    const instance = await _getInstance(adapter, adapterName);
    const instancePath = instance.id.replace(/system.adapter./g, '');
    const results = await Promise.all([
        adapter.getForeignStatesAsync(`${instance.id}.alive`),
        adapter.getForeignStatesAsync(`${instance.id}.connected`),
        adapter.getForeignStatesAsync(`${instancePath}.info.connection`),
    ]);
    const isAlive = `${instance.id}.alive` in results[0] && results[0][`${instance.id}.alive`].val === true;
    const isConnected = `${instance.id}.connected` in results[1] && results[1][`${instance.id}.connected`].val === true;
    const isConnection = `${instancePath}.info.connection` in results[2] && results[2][`${instancePath}.info.connection`].val === true;
    return isAlive && isConnected && isConnection;
};
const AdapterUtilsFunctions = {
    isAdapterInstalled: isAdapterInstalled,
    isAdapterRunning: isAdapterRunning,
    isAdapterConnected: isAdapterConnected,
};
exports.default = AdapterUtilsFunctions;
//# sourceMappingURL=functions.js.map