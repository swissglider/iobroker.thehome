import { InfluxDB, Point } from '@influxdata/influxdb-client';
import {
	Buckets,
	BucketsAPI,
	DeleteAPI,
	Label,
	LabelsAPI,
	Organization,
	// eslint-disable-next-line prettier/prettier
	OrgsAPI
} from '@influxdata/influxdb-client-apis';
import InfluxDBHelper from '../../utils/adapterUtils/influxDBHelper';
import NameHelper from '../../utils/adapterUtils/nameHelper';

let _adapter: ioBroker.Adapter;
let _influxDBInstanceConfiguration: any;
let _influxDB: InfluxDB;
let _influxDBOrgBucketName = '';
const zeroTime = '1970-08-16T08:00:00Z';

type T_LABEL_STRUCT = { name: string; color?: string; description?: string };
type T_TAGS_TYPE = {
	id: string;
	name: string;
	channelName?: string;
	deviceName?: string;
	instanceNumber?: string;
	adapterName?: string;
	role?: string;
	unit?: string;
	function?: string;
	room?: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _sample = async (): Promise<void> => {
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

	const deleteAPI = new DeleteAPI(_influxDB);
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
	} catch (e) {
		console.error(e);
	}
};

const _getOrganization = async (): Promise<Organization> => {
	const name = _influxDBInstanceConfiguration.organization;
	const orgsApi = new OrgsAPI(_influxDB);
	const apiResponse = await orgsApi.getOrgs({ org: name });
	if (apiResponse) {
		if (!apiResponse.orgs || apiResponse.orgs.length === 0) {
			throw new Error(`No organization named ${name} found!`);
		}
		return apiResponse.orgs[0];
	}
	throw new Error('Something is wrong while getting the InfluxDB Organization');
};

const _createLabel = async (labelStruct: T_LABEL_STRUCT, labelsApi: LabelsAPI): Promise<Label> => {
	const { id: orgID } = await _getOrganization();
	const apiResponse = await labelsApi.postLabels({
		body: {
			name: labelStruct.name,
			orgID: orgID as string,
			properties: {
				color: labelStruct.color,
				description: labelStruct.description,
			},
		},
	});
	if (apiResponse.label) return apiResponse.label;
	throw new Error('Something is wrong while creating the InfluxDB Label: ' + name);
};

const _getLabel = async (labelStruct: T_LABEL_STRUCT): Promise<Label | undefined> => {
	const labelsApi = new LabelsAPI(_influxDB);
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

const _addAllLabelsToTheBucket = async (bucketsAPI: BucketsAPI, bucketID: string): Promise<void> => {
	if (_adapter.config.InfluxDBHandlerAdapter_labels && Array.isArray(_adapter.config.InfluxDBHandlerAdapter_labels)) {
		for (const labelStruct of _adapter.config.InfluxDBHandlerAdapter_labels) {
			const tmpLabel = await _getLabel(labelStruct);
			if (tmpLabel && tmpLabel.id) {
				await bucketsAPI.postBucketsIDLabels({ bucketID: bucketID, body: { labelID: tmpLabel.id } });
			}
		}
	}
};

const _createBucketIfNeeded = async (name: string, description: string): Promise<void> => {
	const bucketsAPI = new BucketsAPI(_influxDB);
	const { id: orgID } = await _getOrganization();
	const temp: Buckets = await bucketsAPI.getBuckets({
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
				retentionRules: tmpRetentionRules ?? [],
				orgID: orgID as string,
			},
		});
		if (tmpBucket && tmpBucket.id) {
			await _addAllLabelsToTheBucket(bucketsAPI, tmpBucket.id);
		}
	}
};

const _createLabelBucketIfNeeded = async (): Promise<void> => {
	await _createBucketIfNeeded(
		_adapter.config.InfluxDBHandlerAdapter_bucketLabels,
		'Created by Swissglider:TheHome Adapter for taged based Measurements',
	);
};

const _calculateChannelAndDeviceName = async (tags: T_TAGS_TYPE, id: string): Promise<void> => {
	const array = id.split(/\.(?=[^\.]+$)/);
	if (array.length == 1) return;
	if (array[0]) {
		const tempObj = await _adapter.getForeignObjectAsync(array[0], '*');
		if (tempObj) {
			switch (tempObj.type) {
				case 'channel': {
					tags.channelName = NameHelper.getName(
						tempObj?.common.name,
						_adapter.systemConfig?.language ?? 'de',
					);
					break;
				}
				case 'device': {
					tags.deviceName = NameHelper.getName(tempObj?.common.name, _adapter.systemConfig?.language ?? 'de');
					break;
				}
			}
		}
		await _calculateChannelAndDeviceName(tags, array[0]);
	}
	return;
};

const _getEnum = (obj: Record<string, ioBroker.StringOrTranslated>, filterString: string): string | undefined => {
	const tmp = Object.entries(obj).find(([key]) => key.includes(filterString));
	return tmp ? NameHelper.getName(tmp[1], _adapter.systemConfig?.language ?? 'de') : undefined;
};

const _updateOnDB = async (tags: T_TAGS_TYPE): Promise<void> => {
	const deleteAPI = new DeleteAPI(_influxDB);
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
	} catch (error) {
		console.error(error);
		throw error;
	}
	const writeApi = _influxDB.getWriteApi(
		_influxDBInstanceConfiguration.organization,
		_adapter.config.InfluxDBHandlerAdapter_bucketLabels,
	);
	writeApi.useDefaultTags(JSON.parse(JSON.stringify(tags)));
	const point1 = new Point(tags.id).stringField('value', 'tags');
	writeApi.writePoint(point1);
	try {
		await writeApi.close();
	} catch (error) {
		console.log('WRITE FAILED', error);
		throw error;
	}
};

const _updateOneLablePerObj = async (obj: ioBroker.Object): Promise<void> => {
	const influxName = await InfluxDBHelper.getInfluxInstanceName(_adapter);
	if (obj.common.custom && obj.common.custom[influxName]?.enabled === true) {
		const array = obj._id.split('.');
		const tags: T_TAGS_TYPE = {
			id: obj._id,
			name: NameHelper.getName(obj.common.name, _adapter.systemConfig?.language ?? 'de'),
			adapterName: array[0],
			instanceNumber: array[1],
			role: obj.common.role as string,
			unit: obj.common.unit as string,
			function: obj.enums && typeof obj.enums === 'object' ? _getEnum(obj.enums, '.functions.') : '-',
			room: obj.enums && typeof obj.enums === 'object' ? _getEnum(obj.enums, '.rooms.') : '-',
		};
		await _calculateChannelAndDeviceName(tags, obj._id);
		for (const key of Object.keys(tags)) {
			tags[key as keyof T_TAGS_TYPE] = tags[key as keyof T_TAGS_TYPE] ?? '-';
			tags[key as keyof T_TAGS_TYPE] = (tags[key as keyof T_TAGS_TYPE] as string).replace(/\s/g, '_');
		}
		await _updateOnDB(tags);
	}
};

const changeNameOnDBBucket = async (id: string): Promise<void> => {
	_adapter.log.silly('InfluxDBHandlerAdapter::changeNameOnDBBucket - ' + id);
	const tmpoAllObjects = await _adapter.getForeignObjectsAsync(id);
	for (const obj of Object.values(tmpoAllObjects)) {
		await _updateOneLablePerObj(obj);
	}
};

const _updateAllLabels = async (): Promise<void> => {
	try {
		const tmpoAllObjects = await _adapter.getForeignObjectsAsync('*');
		for (const obj of Object.values(tmpoAllObjects)) {
			await _updateOneLablePerObj(obj);
		}
	} catch (error) {
		console.log(error);
		throw error;
	}
};

const _initInfluxDBTags = async (): Promise<void> => {
	// get InfluxDB Adapter Configuration
	const adapterName = 'influxdb';
	const tempInstances = await _adapter.getObjectViewAsync('system', 'instance', {
		startkey: `system.adapter.${adapterName ? adapterName + '.' : ''}`,
		endkey: `system.adapter.${adapterName ? adapterName + '.' : ''}\u9999`,
	});
	_influxDBInstanceConfiguration = tempInstances.rows[0]?.value?.native;

	const url = `${_influxDBInstanceConfiguration.protocol}://${_influxDBInstanceConfiguration.host}:${_influxDBInstanceConfiguration.port}`;
	const token = _adapter.config.InfluxDBHandlerAdapter_token;
	_influxDB = new InfluxDB({
		url: url,
		token: token,
	});
	_influxDBOrgBucketName = _influxDBInstanceConfiguration.bucket ?? _influxDBInstanceConfiguration.dbname;

	// init InfluxDB if needed
	await _createLabelBucketIfNeeded();
	await _updateAllLabels();
	_adapter.log.silly('InfluxDBHandlerAdapter::_initInfluxDBTags - all Tags are up to date now on InfluxDB');
};

const onReady = async (): Promise<void> => {
	_adapter.log.silly('InfluxDBHandlerAdapter::onReady');
	try {
		_initInfluxDBTags();
	} catch (error) {
		_adapter.log.silly(`unknown error: ${error}`);
	}
};

const onMessage = async (obj: ioBroker.Message): Promise<void> => {
	_adapter.log.silly('InfluxDBHandlerAdapter::onMessage');
	if (typeof obj === 'object') {
		if (obj.command == 'InfluxDBHandlerAdapter:refreshAllTagsOnInfluxDB' && obj.callback) {
			try {
				await _initInfluxDBTags();
				_adapter.sendTo(obj.from, obj.command, 'ok', obj.callback);
			} catch (error) {
				_adapter.log.error(`unknown error on ${obj.command}: ${error}`);
				_adapter.sendTo(obj.from, obj.command, `unknown error on ${obj.command}: ${error}`, obj.callback);
			}
		}
	}
};

const onUnload = async (): Promise<void> => {
	_adapter.log.silly('InfluxDBHandlerAdapter::onUnload');
};

const init = (adapter: ioBroker.Adapter): void => {
	_adapter = adapter;
	_adapter.on('ready', onReady);
	_adapter.on('message', onMessage);
	_adapter.on('unload', onUnload);
};

const InfluxDBHandlerAdapter = {
	init: init,
	changeNameOnDBBucket: changeNameOnDBBucket,
};

export default InfluxDBHandlerAdapter;
