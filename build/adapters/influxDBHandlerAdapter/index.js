"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const influxdb_client_1 = require("@influxdata/influxdb-client");
const influxdb_client_apis_1 = require("@influxdata/influxdb-client-apis");
const influxDBHelper_1 = __importDefault(require("../../utils/adapterUtils/influxDBHelper"));
const nameHelper_1 = __importDefault(require("../../utils/adapterUtils/nameHelper"));
let _adapter;
let _influxDBInstanceConfiguration;
let _influxDB;
let _influxDBOrgBucketName = '';
const zeroTime = '1970-08-16T08:00:00Z';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _sample = async () => {
    const queryApi = _influxDB.getQueryApi('swissglider');
    const fluxQuery = `
		import "strings" 
		
		data = from(bucket: "iobroker") 
			|> range(start: -40y) 
			|> filter(fn: (r) => r["_measurement"] == "netatmo.0.Zuhaus-(Weather-Station).Outdoor-Module.Temperature.Temperature") 
			|> drop(columns: ["_start", "_stop"]) 
			|> map(fn: (r) => { 
				parts = strings.split(v: r._measurement, t: ".") 
				return {r with _measurement:"__test", adapter: parts[0], instanceNB: parts[1], location: parts[3], device: parts[4], function: parts[5]}}) 
		
		data 
			|> to(bucket: "iobroker")
	`;
    await queryApi.queryRaw(fluxQuery);
    const deleteAPI = new influxdb_client_apis_1.DeleteAPI(_influxDB);
    try {
        const now = new Date();
        await deleteAPI.postDelete({
            body: {
                start: '1970-08-16T08:00:00Z',
                stop: now.toISOString(),
                predicate: `_measurement="netatmo.0.Zuhaus-(Weather-Station).Outdoor-Module.Temperature.Temperature"`,
            },
            org: 'swissglider',
            bucket: 'iobroker',
        });
    }
    catch (e) {
        console.error(e);
    }
};
const _getOrganization = async () => {
    const name = _influxDBInstanceConfiguration.organization;
    const orgsApi = new influxdb_client_apis_1.OrgsAPI(_influxDB);
    const apiResponse = await orgsApi.getOrgs({ org: name });
    if (apiResponse) {
        if (!apiResponse.orgs || apiResponse.orgs.length === 0) {
            throw new Error(`No organization named ${name} found!`);
        }
        return apiResponse.orgs[0];
    }
    throw new Error('Something is wrong while getting the InfluxDB Organization');
};
const _createLabel = async (labelStruct, labelsApi) => {
    const { id: orgID } = await _getOrganization();
    const apiResponse = await labelsApi.postLabels({
        body: {
            name: labelStruct.name,
            orgID: orgID,
            properties: {
                color: labelStruct.color,
                description: labelStruct.description,
            },
        },
    });
    if (apiResponse.label)
        return apiResponse.label;
    throw new Error('Something is wrong while creating the InfluxDB Label: ' + name);
};
const _getLabel = async (labelStruct) => {
    const labelsApi = new influxdb_client_apis_1.LabelsAPI(_influxDB);
    const apiResponse = await labelsApi.getLabels();
    if (apiResponse && apiResponse.labels) {
        for (const label of apiResponse.labels) {
            if (label && label.name && label.name === labelStruct.name) {
                return label;
            }
        }
    }
    return _createLabel(labelStruct, labelsApi);
};
const _addAllLabelsToTheBucket = async (bucketsAPI, bucketID) => {
    if (_adapter.config.InfluxDBHandlerAdapter_labels && Array.isArray(_adapter.config.InfluxDBHandlerAdapter_labels)) {
        for (const labelStruct of _adapter.config.InfluxDBHandlerAdapter_labels) {
            const tmpLabel = await _getLabel(labelStruct);
            if (tmpLabel && tmpLabel.id) {
                await bucketsAPI.postBucketsIDLabels({ bucketID: bucketID, body: { labelID: tmpLabel.id } });
            }
        }
    }
};
const _createBucketIfNeeded = async (name, description) => {
    const bucketsAPI = new influxdb_client_apis_1.BucketsAPI(_influxDB);
    const { id: orgID } = await _getOrganization();
    const temp = await bucketsAPI.getBuckets({
        orgID,
    });
    if (temp && temp.buckets) {
        let tmpRetentionRules;
        for (const bucket of temp.buckets) {
            if (bucket.name === _influxDBOrgBucketName) {
                tmpRetentionRules = bucket.retentionRules;
            }
            if (bucket.name === name) {
                return;
            }
        }
        const tmpBucket = await bucketsAPI.postBuckets({
            body: {
                name: name,
                description: description,
                retentionRules: tmpRetentionRules !== null && tmpRetentionRules !== void 0 ? tmpRetentionRules : [],
                orgID: orgID,
            },
        });
        if (tmpBucket && tmpBucket.id) {
            await _addAllLabelsToTheBucket(bucketsAPI, tmpBucket.id);
        }
    }
};
const _createLabelBucketIfNeeded = async () => {
    await _createBucketIfNeeded(_adapter.config.InfluxDBHandlerAdapter_bucketLabels, 'Created by Swissglider:TheHome Adapter for taged based Measurements');
};
const _calculateChannelAndDeviceName = async (tags, id) => {
    var _a, _b, _c, _d;
    const array = id.split(/\.(?=[^\.]+$)/);
    if (array.length == 1)
        return;
    if (array[0]) {
        const tempObj = await _adapter.getForeignObjectAsync(array[0], '*');
        if (tempObj) {
            switch (tempObj.type) {
                case 'channel': {
                    tags.channelName = nameHelper_1.default.getName(tempObj === null || tempObj === void 0 ? void 0 : tempObj.common.name, (_b = (_a = _adapter.systemConfig) === null || _a === void 0 ? void 0 : _a.language) !== null && _b !== void 0 ? _b : 'de');
                    break;
                }
                case 'device': {
                    tags.deviceName = nameHelper_1.default.getName(tempObj === null || tempObj === void 0 ? void 0 : tempObj.common.name, (_d = (_c = _adapter.systemConfig) === null || _c === void 0 ? void 0 : _c.language) !== null && _d !== void 0 ? _d : 'de');
                    break;
                }
            }
        }
        await _calculateChannelAndDeviceName(tags, array[0]);
    }
    return;
};
const _getEnum = (obj, filterString) => {
    var _a, _b;
    const tmp = Object.entries(obj).find(([key]) => key.includes(filterString));
    return tmp ? nameHelper_1.default.getName(tmp[1], (_b = (_a = _adapter.systemConfig) === null || _a === void 0 ? void 0 : _a.language) !== null && _b !== void 0 ? _b : 'de') : undefined;
};
const _updateOnDB = async (tags) => {
    const deleteAPI = new influxdb_client_apis_1.DeleteAPI(_influxDB);
    try {
        const now = new Date();
        await deleteAPI.postDelete({
            body: {
                start: zeroTime,
                stop: now.toISOString(),
                predicate: `_measurement="${tags.id}"`,
            },
            org: _influxDBInstanceConfiguration.organization,
            bucket: _adapter.config.InfluxDBHandlerAdapter_bucketLabels,
        });
    }
    catch (error) {
        console.error(error);
        throw error;
    }
    const writeApi = _influxDB.getWriteApi(_influxDBInstanceConfiguration.organization, _adapter.config.InfluxDBHandlerAdapter_bucketLabels);
    writeApi.useDefaultTags(JSON.parse(JSON.stringify(tags)));
    const point1 = new influxdb_client_1.Point(tags.id).stringField('value', 'tags');
    writeApi.writePoint(point1);
    try {
        await writeApi.close();
    }
    catch (error) {
        console.log('WRITE FAILED', error);
        throw error;
    }
};
const _updateOneLablePerObj = async (obj) => {
    var _a, _b, _c, _d;
    const influxName = await influxDBHelper_1.default.getInfluxInstanceName(_adapter);
    if (obj.common.custom && ((_a = obj.common.custom[influxName]) === null || _a === void 0 ? void 0 : _a.enabled) === true) {
        const array = obj._id.split('.');
        const tags = {
            id: obj._id,
            name: nameHelper_1.default.getName(obj.common.name, (_c = (_b = _adapter.systemConfig) === null || _b === void 0 ? void 0 : _b.language) !== null && _c !== void 0 ? _c : 'de'),
            adapterName: array[0],
            instanceNumber: array[1],
            role: obj.common.role,
            unit: obj.common.unit,
            function: obj.enums && typeof obj.enums === 'object' ? _getEnum(obj.enums, '.functions.') : '-',
            room: obj.enums && typeof obj.enums === 'object' ? _getEnum(obj.enums, '.rooms.') : '-',
        };
        await _calculateChannelAndDeviceName(tags, obj._id);
        for (const key of Object.keys(tags)) {
            tags[key] = (_d = tags[key]) !== null && _d !== void 0 ? _d : '-';
            tags[key] = tags[key].replace(/\s/g, '_');
        }
        await _updateOnDB(tags);
    }
};
const changeNameOnDBBucket = async (id) => {
    _adapter.log.silly('InfluxDBHandlerAdapter::changeNameOnDBBucket - ' + id);
    if (_adapter.config.InfluxDBHandlerAdapter_disabled)
        return;
    const tmpoAllObjects = await _adapter.getForeignObjectsAsync(id);
    for (const obj of Object.values(tmpoAllObjects)) {
        await _updateOneLablePerObj(obj);
    }
};
const _updateAllLabels = async () => {
    try {
        const tmpoAllObjects = await _adapter.getForeignObjectsAsync('*');
        for (const obj of Object.values(tmpoAllObjects)) {
            await _updateOneLablePerObj(obj);
        }
    }
    catch (error) {
        console.log(error);
        throw error;
    }
};
const _initInfluxDBTags = async () => {
    var _a, _b, _c;
    // get InfluxDB Adapter Configuration
    const adapterName = 'influxdb';
    const tempInstances = await _adapter.getObjectViewAsync('system', 'instance', {
        startkey: `system.adapter.${adapterName ? adapterName + '.' : ''}`,
        endkey: `system.adapter.${adapterName ? adapterName + '.' : ''}\u9999`,
    });
    _influxDBInstanceConfiguration = (_b = (_a = tempInstances.rows[0]) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.native;
    const url = `${_influxDBInstanceConfiguration.protocol}://${_influxDBInstanceConfiguration.host}:${_influxDBInstanceConfiguration.port}`;
    const token = _adapter.config.InfluxDBHandlerAdapter_token;
    _influxDB = new influxdb_client_1.InfluxDB({
        url: url,
        token: token,
    });
    _influxDBOrgBucketName = (_c = _influxDBInstanceConfiguration.bucket) !== null && _c !== void 0 ? _c : _influxDBInstanceConfiguration.dbname;
    // init InfluxDB if needed
    await _createLabelBucketIfNeeded();
    await _updateAllLabels();
    _adapter.log.silly('InfluxDBHandlerAdapter::_initInfluxDBTags - all Tags are up to date now on InfluxDB');
};
const onReady = async () => {
    _adapter.log.silly('InfluxDBHandlerAdapter::onReady');
    if (_adapter.config.InfluxDBHandlerAdapter_disabled)
        return;
    try {
        _initInfluxDBTags();
    }
    catch (error) {
        _adapter.log.silly(`unknown error: ${error}`);
    }
};
const onMessage = async (obj) => {
    _adapter.log.silly('InfluxDBHandlerAdapter::onMessage');
    if (typeof obj === 'object') {
        if (obj.command == 'InfluxDBHandlerAdapter:refreshAllTagsOnInfluxDB' && obj.callback) {
            try {
                if (!_adapter.config.InfluxDBHandlerAdapter_disabled)
                    await _initInfluxDBTags();
                _adapter.sendTo(obj.from, obj.command, 'ok', obj.callback);
            }
            catch (error) {
                _adapter.log.error(`unknown error on ${obj.command}: ${error}`);
                _adapter.sendTo(obj.from, obj.command, `unknown error on ${obj.command}: ${error}`, obj.callback);
            }
        }
    }
};
const onUnload = async () => {
    _adapter.log.silly('InfluxDBHandlerAdapter::onUnload');
};
const init = (adapter) => {
    _adapter = adapter;
    if (_adapter.config.InfluxDBHandlerAdapter_disabled)
        return;
    _adapter.on('ready', onReady);
    _adapter.on('message', onMessage);
    _adapter.on('unload', onUnload);
};
const InfluxDBHandlerAdapter = {
    init: init,
    changeNameOnDBBucket: changeNameOnDBBucket,
};
exports.default = InfluxDBHandlerAdapter;
//# sourceMappingURL=index.js.map