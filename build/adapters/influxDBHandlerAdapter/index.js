"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const influxdb_client_1 = require("@influxdata/influxdb-client");
const influxdb_client_apis_1 = require("@influxdata/influxdb-client-apis");
const adapterUtilsFunctions_1 = __importDefault(require("../../utils/adapterUtils/adapterUtilsFunctions"));
const BatteryBucketHandler_1 = __importDefault(require("./BatteryBucketHandler"));
const LabelBucketHandler_1 = __importDefault(require("./LabelBucketHandler"));
const name = 'InfluxDBHandlerAdapter';
const adapterName = 'influxdb';
const influxStatics = {};
const _getOrganization = () => {
    if (!influxStatics.organization)
        throw new Error('Organization not set');
    return influxStatics.organization;
};
const _getInfluxName = () => {
    if (!influxStatics.influxName)
        throw new Error('InfluxName not set');
    return influxStatics.influxName;
};
const _createLabel = async (adapter, labelStruct) => {
    var _a;
    const { id: orgID } = _getOrganization();
    const apiResponse = await ((_a = influxStatics.labelsAPI) === null || _a === void 0 ? void 0 : _a.postLabels({
        body: {
            name: labelStruct.name,
            orgID: orgID,
            properties: {
                color: labelStruct.color,
                description: labelStruct.description,
            },
        },
    }));
    if (apiResponse === null || apiResponse === void 0 ? void 0 : apiResponse.label)
        return apiResponse === null || apiResponse === void 0 ? void 0 : apiResponse.label;
    throw new Error('Something is wrong while creating the InfluxDB Label: ' + name);
};
const _getLabel = async (adapter, labelStruct) => {
    var _a;
    const apiResponse = await ((_a = influxStatics.labelsAPI) === null || _a === void 0 ? void 0 : _a.getLabels());
    if (apiResponse && apiResponse.labels) {
        for (const label of apiResponse.labels) {
            if (label && label.name && label.name === labelStruct.name) {
                return label;
            }
        }
    }
    return _createLabel(adapter, labelStruct);
};
const _addAllLabelsToTheBucket = async (adapter, bucketID) => {
    var _a;
    if (adapter.config.InfluxDBHandlerAdapter_labels && Array.isArray(adapter.config.InfluxDBHandlerAdapter_labels)) {
        for (const labelStruct of adapter.config.InfluxDBHandlerAdapter_labels) {
            const tmpLabel = await _getLabel(adapter, labelStruct);
            if (tmpLabel && tmpLabel.id) {
                await ((_a = influxStatics.bucketsAPI) === null || _a === void 0 ? void 0 : _a.postBucketsIDLabels({
                    bucketID: bucketID,
                    body: { labelID: tmpLabel.id },
                }));
            }
        }
    }
};
const testInfluxDBConnectionWithToken = async (adapter, { token: token }) => {
    // create config object for influxDB Test call
    const isAdapterConnected = await adapterUtilsFunctions_1.default.isAdapterConnected(adapter, 'influxdb');
    if (!isAdapterConnected)
        throw new Error('Influxdb adapter is not running correct');
    const tmpConfig = {
        ...influxStatics.influxDBInstanceConfiguration,
        ...{
            token: token,
        },
    };
    const usedParams = ['port', 'host', 'dbversion', 'protocol', 'organization', 'dbname', 'token'];
    const subset = Object.fromEntries(Object.entries(tmpConfig).filter(([key]) => usedParams.includes(key)));
    const testResult = await adapter
        .sendToAsync(_getInfluxName(), 'test', { config: subset })
        .catch((reason) => {
        console.log('hallo', 1, reason);
        throw new Error(reason);
    });
    if (testResult.error) {
        throw testResult.error;
    }
    return 'ok';
};
const createBucketIfNeeded = async (adapter, name, description) => {
    var _a, _b, _c;
    const { id: orgID } = _getOrganization();
    const temp = await ((_a = influxStatics.bucketsAPI) === null || _a === void 0 ? void 0 : _a.getBuckets({
        orgID,
    }));
    if (temp && temp.buckets && influxStatics.influxDBInstanceConfiguration) {
        let tmpRetentionRules;
        for (const bucket of temp.buckets) {
            const influxDBOrgBucketName = (_b = influxStatics.influxDBInstanceConfiguration.bucket) !== null && _b !== void 0 ? _b : influxStatics.influxDBInstanceConfiguration.dbname;
            if (bucket.name === influxDBOrgBucketName) {
                tmpRetentionRules = bucket.retentionRules;
            }
            if (bucket.name === name) {
                return;
            }
        }
        const tmpBucket = await ((_c = influxStatics.bucketsAPI) === null || _c === void 0 ? void 0 : _c.postBuckets({
            body: {
                name: name,
                description: description,
                retentionRules: tmpRetentionRules !== null && tmpRetentionRules !== void 0 ? tmpRetentionRules : [],
                orgID: orgID,
            },
        }));
        if (tmpBucket && tmpBucket.id) {
            await _addAllLabelsToTheBucket(adapter, tmpBucket.id);
        }
    }
};
const deleteBucket = async (adapter, bucketName) => {
    var _a, _b;
    const { id: orgID } = _getOrganization();
    const temp = await ((_a = influxStatics.bucketsAPI) === null || _a === void 0 ? void 0 : _a.getBuckets({
        orgID,
    }));
    if (temp && temp.buckets) {
        for (const bucket of temp.buckets) {
            if (bucket.name === bucketName && bucket.id) {
                await ((_b = influxStatics.bucketsAPI) === null || _b === void 0 ? void 0 : _b.deleteBucketsID({ bucketID: bucket.id }));
            }
        }
    }
};
const getBucketWriteApi = async (adapter, bucketName) => {
    if (!influxStatics.influxDBInstanceConfiguration || !influxStatics.influxDB)
        return undefined;
    return influxStatics.influxDB.getWriteApi(influxStatics.influxDBInstanceConfiguration.organization, bucketName);
};
const _initInfluxDBTags = async (adapter) => {
    // get InfluxDB Adapter Configuration
    var _a;
    influxStatics.influxDBInstanceConfiguration = await adapterUtilsFunctions_1.default.getInstanceNative(adapter, adapterName);
    if (!influxStatics.influxDBInstanceConfiguration)
        throw new Error('no influxdb instance configuration');
    const url = `${influxStatics.influxDBInstanceConfiguration.protocol}://${influxStatics.influxDBInstanceConfiguration.host}:${influxStatics.influxDBInstanceConfiguration.port}`;
    const token = adapter.config.InfluxDBHandlerAdapter_token;
    influxStatics.influxDB = new influxdb_client_1.InfluxDB({
        url: url,
        token: token,
    });
    if (!influxStatics.influxDB)
        throw new Error('no influxdb instance configuration');
    try {
        influxStatics.queryAPI = influxStatics.influxDB.getQueryApi('swissglider');
        influxStatics.orgsAPI = new influxdb_client_apis_1.OrgsAPI(influxStatics.influxDB);
        influxStatics.labelsAPI = new influxdb_client_apis_1.LabelsAPI(influxStatics.influxDB);
        influxStatics.bucketsAPI = new influxdb_client_apis_1.BucketsAPI(influxStatics.influxDB);
        influxStatics.writeApiLabel = influxStatics.influxDB.getWriteApi(influxStatics.influxDBInstanceConfiguration.organization, adapter.config.InfluxDBHandlerAdapter_bucketLabels);
        // get the organization
        if (!influxStatics.influxDBInstanceConfiguration)
            throw new Error(`No organization found!`);
        const name = influxStatics.influxDBInstanceConfiguration.organization;
        const apiResponse = await ((_a = influxStatics.orgsAPI) === null || _a === void 0 ? void 0 : _a.getOrgs({ org: name }));
        if (apiResponse) {
            if (!apiResponse.orgs || apiResponse.orgs.length === 0) {
                throw new Error(`No organization named ${name} found!`);
            }
            influxStatics.organization = apiResponse.orgs[0];
        }
        else {
            throw new Error('Something is wrong while getting the InfluxDB Organization');
        }
        influxStatics.influxName = await adapterUtilsFunctions_1.default.getAdapterPath(adapter, 'influxdb');
    }
    catch (error) {
        throw new Error(`something went wrong while establish the influxDB connection: ${error}`);
    }
    try {
        await LabelBucketHandler_1.default.initInfluxDB(adapter, influxStatics.influxName);
        await BatteryBucketHandler_1.default.initInfluxDB(adapter, influxStatics.influxName);
    }
    catch (error) {
        throw new Error(`something went wrong while establish the influxDB connection: ${error}`);
    }
};
const getHealthStati = async (adapter) => {
    const singleAStates = await adapterUtilsFunctions_1.default.getAdapterSingleStates(adapter, 'influxdb');
    const returnValue = { ...singleAStates, ...{ adapterFullReady: false } };
    try {
        await testInfluxDBConnectionWithToken(adapter, { token: adapter.config.InfluxDBHandlerAdapter_token });
        returnValue.adapterFullReady = true;
    }
    catch (error) {
        returnValue.adapterFullReady = false;
    }
    return returnValue;
};
const isHealth = async (adapter) => {
    const returnValue = await getHealthStati(adapter);
    return Object.values(returnValue).every((e) => e);
};
const rename = async () => {
    const returnValue = { error: `Rename not available for ${name}` };
    return returnValue;
};
const refreshAllTagsOnInfluxDB = async (adapter) => {
    try {
        if (adapter.config.InfluxDBHandlerAdapter_active) {
            await LabelBucketHandler_1.default.updateAll(adapter);
        }
        return 'ok';
    }
    catch (error) {
        return { error: `${error}` };
    }
};
const init = async (adapter) => {
    await adapterUtilsFunctions_1.default.checkIFStartable(adapter);
    if (!adapter.config.InfluxDBHandlerAdapter_active)
        return;
    try {
        await _initInfluxDBTags(adapter);
    }
    catch (error) {
        adapter.log.silly(`unknown error: ${error}`);
    }
};
const InfluxDBHandlerAdapter = {
    name: name,
    init: init,
    deleteBucket: deleteBucket,
    createBucketIfNeeded: createBucketIfNeeded,
    getBucketWriteApi: getBucketWriteApi,
    getHealthStati: getHealthStati,
    isHealth: isHealth,
    rename: rename,
    refreshAllTagsOnInfluxDB: refreshAllTagsOnInfluxDB,
    testInfluxDBConnectionWithToken: testInfluxDBConnectionWithToken,
};
exports.default = InfluxDBHandlerAdapter;
//# sourceMappingURL=index.js.map