"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const influxdb_client_1 = require("@influxdata/influxdb-client");
const influxdb_client_apis_1 = require("@influxdata/influxdb-client-apis");
const adapterUtilsFunctions_1 = __importDefault(require("../../utils/adapterUtils/adapterUtilsFunctions"));
const checkInitReadyUtil = __importStar(require("../../utils/adapterUtils/checkInitReady"));
const BatteryBucketHandler_1 = __importDefault(require("./BatteryBucketHandler"));
const LabelBucketHandler_1 = __importDefault(require("./LabelBucketHandler"));
const name = 'InfluxDBHandlerAdapter';
const adapterName = 'influxdb';
const _STATUS = {
    _isReady: 'nok',
    _name: 'InfluxDBHandlerAdapter',
};
const influxStatics = {};
const _getToken = (adapter) => {
    const token = adapter.config.InfluxDBHandlerAdapter_token;
    if (token === '') {
        adapter.log.silly('token not yet set');
        throw new Error('token not yet set');
    }
    return token;
};
const _getOrganization = () => {
    if (!influxStatics.organization)
        throw new Error('Organization not set');
    return influxStatics.organization;
};
const _getInfluxName = async (adapter) => {
    if (!influxStatics.influxName) {
        influxStatics.influxName = await adapterUtilsFunctions_1.default.getAdapterPath(adapter, 'influxdb');
    }
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
const _initInfluxDBTags = async (adapter) => {
    var _a;
    // get InfluxDB Adapter Configuration
    _STATUS._isReady = 'processing';
    influxStatics.influxDBInstanceConfiguration = await adapterUtilsFunctions_1.default.getInstanceNative(adapter, adapterName);
    if (!influxStatics.influxDBInstanceConfiguration)
        throw new Error('no influxdb instance configuration');
    const url = `${influxStatics.influxDBInstanceConfiguration.protocol}://${influxStatics.influxDBInstanceConfiguration.host}:${influxStatics.influxDBInstanceConfiguration.port}`;
    const token = _getToken(adapter);
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
    }
    catch (error) {
        console.error(error);
        throw new Error(`something went wrong while establish the influxDB connection: ${error}`);
    }
    try {
        // get InfluxName
        const _influxName = await _getInfluxName(adapter);
        _STATUS._isReady = 'ok';
        await LabelBucketHandler_1.default.initInfluxDB(adapter, _influxName);
        await BatteryBucketHandler_1.default.initInfluxDB(adapter, _influxName);
    }
    catch (error) {
        throw new Error(`something went wrong while establish the influxDB connection: ${error}`);
    }
};
const _init = async (adapter) => {
    if (!adapter.config.InfluxDBHandlerAdapter_active) {
        _STATUS._isReady = 'ok';
        return;
    }
    try {
        await _initInfluxDBTags(adapter);
    }
    catch (error) {
        _STATUS._isReady = 'nok';
        adapter.log.error(`unknown error: ${error}`);
    }
};
const checkInitReady = async (adapter) => {
    await checkInitReadyUtil.default(adapter, _STATUS, _init);
};
const init = async (adapter) => {
    await checkInitReady(adapter);
};
const testInfluxDBConnectionWithToken = async (adapter, { token: token }) => {
    await checkInitReady(adapter);
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
    const influxName = await _getInfluxName(adapter);
    const testResult = await adapter
        .sendToAsync(influxName, 'test', { config: subset })
        .catch((reason) => {
        throw new Error(reason);
    });
    if (testResult.error) {
        throw testResult.error;
    }
    return 'ok';
};
const createBucketIfNeeded = async (adapter, name, description) => {
    var _a, _b, _c;
    await checkInitReady(adapter);
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
    await checkInitReady(adapter);
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
    await checkInitReady(adapter);
    if (!influxStatics.influxDBInstanceConfiguration || !influxStatics.influxDB)
        return undefined;
    return influxStatics.influxDB.getWriteApi(influxStatics.influxDBInstanceConfiguration.organization, bucketName);
};
const getHealthStati = async (adapter) => {
    await checkInitReady(adapter);
    const singleAStates = await adapterUtilsFunctions_1.default.getAdapterSingleStates(adapter, 'influxdb');
    const returnValue = { ...singleAStates, ...{ adapterFullReady: false } };
    try {
        await testInfluxDBConnectionWithToken(adapter, { token: _getToken(adapter) });
        returnValue.adapterFullReady = true;
    }
    catch (error) {
        returnValue.adapterFullReady = false;
    }
    return returnValue;
};
const isHealth = async (adapter) => {
    await checkInitReady(adapter);
    const returnValue = await getHealthStati(adapter);
    return Object.values(returnValue).every((e) => e);
};
const rename = async (adapter) => {
    await checkInitReady(adapter);
    const returnValue = { error: `Rename not available for ${name}` };
    return returnValue;
};
const refreshAllTagsOnInfluxDB = async (adapter) => {
    await checkInitReady(adapter);
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
const InfluxDBHandlerAdapter = {
    name: name,
    init: init,
    isHealth: isHealth,
    onMessageFunc: {
        rename: rename,
        refreshAllTagsOnInfluxDB: refreshAllTagsOnInfluxDB,
        testInfluxDBConnectionWithToken: testInfluxDBConnectionWithToken,
        getHealthStati: getHealthStati,
    },
    influxDBExportFunc: {
        deleteBucket: deleteBucket,
        createBucketIfNeeded: createBucketIfNeeded,
        getBucketWriteApi: getBucketWriteApi,
        writeBatteryPoints: BatteryBucketHandler_1.default.writePoints,
        getHealthStati: getHealthStati,
        checkInitReady: checkInitReady,
    },
};
exports.default = InfluxDBHandlerAdapter;
//# sourceMappingURL=index.js.map