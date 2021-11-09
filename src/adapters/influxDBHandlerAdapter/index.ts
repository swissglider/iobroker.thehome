import { InfluxDB, QueryApi, WriteApi } from '@influxdata/influxdb-client';
import { BucketsAPI, Label, LabelsAPI, Organization, OrgsAPI } from '@influxdata/influxdb-client-apis';
import AdapterUtilsFunctions from '../../utils/adapterUtils/adapterUtilsFunctions';
import * as checkInitReadyUtil from '../../utils/adapterUtils/checkInitReady';
import { T_AdapterStates, T_IOBAdapter_Handler, T_STATUS } from '../../utils/types/T_IOBAdapter_Handler';
import BatteryBucketHandler from './BatteryBucketHandler';
import LabelBucketHandler from './LabelBucketHandler';

const name = 'InfluxDBHandlerAdapter';
const adapterName = 'influxdb';

type T_APIS = {
	influxDB?: InfluxDB;
	influxDBInstanceConfiguration?: Record<string, any> | (ioBroker.HostNative & Record<string, any>) | undefined;
	organization?: Organization;
	influxName?: string;
	queryAPI?: QueryApi | undefined;
	orgsAPI?: OrgsAPI | undefined;
	labelsAPI?: LabelsAPI | undefined;
	bucketsAPI?: BucketsAPI | undefined;
	writeApiLabel?: WriteApi | undefined;
	writeApiConnection?: WriteApi | undefined;
};

type T_LABEL_STRUCT = { name: string; color?: string; description?: string };

const _STATUS: T_STATUS = {
	_isReady: 'nok',
	_name: 'InfluxDBHandlerAdapter',
};

const influxStatics: T_APIS = {};

const _getToken = (adapter: ioBroker.Adapter): string => {
	const token = adapter.config.InfluxDBHandlerAdapter_token;
	if (token === '') {
		adapter.log.silly('token not yet set');
		throw new Error('token not yet set');
	}
	return token;
};

const _getOrganization = (): Organization => {
	if (!influxStatics.organization) throw new Error('Organization not set');
	return influxStatics.organization;
};
const _getInfluxName = async (adapter: ioBroker.Adapter): Promise<string> => {
	if (!influxStatics.influxName) {
		influxStatics.influxName = await AdapterUtilsFunctions.getAdapterPath(adapter, 'influxdb');
	}
	return influxStatics.influxName;
};

const _createLabel = async (adapter: ioBroker.Adapter, labelStruct: T_LABEL_STRUCT): Promise<Label> => {
	const { id: orgID } = _getOrganization();
	const apiResponse = await influxStatics.labelsAPI?.postLabels({
		body: {
			name: labelStruct.name,
			orgID: orgID as string,
			properties: {
				color: labelStruct.color,
				description: labelStruct.description,
			},
		},
	});
	if (apiResponse?.label) return apiResponse?.label;
	throw new Error('Something is wrong while creating the InfluxDB Label: ' + name);
};

const _getLabel = async (adapter: ioBroker.Adapter, labelStruct: T_LABEL_STRUCT): Promise<Label | undefined> => {
	const apiResponse = await influxStatics.labelsAPI?.getLabels();
	if (apiResponse && apiResponse.labels) {
		for (const label of apiResponse.labels) {
			if (label && label.name && label.name === labelStruct.name) {
				return label;
			}
		}
	}
	return _createLabel(adapter, labelStruct);
};

const _addAllLabelsToTheBucket = async (adapter: ioBroker.Adapter, bucketID: string): Promise<void> => {
	if (adapter.config.InfluxDBHandlerAdapter_labels && Array.isArray(adapter.config.InfluxDBHandlerAdapter_labels)) {
		for (const labelStruct of adapter.config.InfluxDBHandlerAdapter_labels) {
			const tmpLabel = await _getLabel(adapter, labelStruct);
			if (tmpLabel && tmpLabel.id) {
				await influxStatics.bucketsAPI?.postBucketsIDLabels({
					bucketID: bucketID,
					body: { labelID: tmpLabel.id },
				});
			}
		}
	}
};

const _initInfluxDBTags = async (adapter: ioBroker.Adapter): Promise<void> => {
	// get InfluxDB Adapter Configuration
	_STATUS._isReady = 'processing';

	influxStatics.influxDBInstanceConfiguration = await AdapterUtilsFunctions.getInstanceNative(adapter, adapterName);
	if (!influxStatics.influxDBInstanceConfiguration) throw new Error('no influxdb instance configuration');

	const url = `${influxStatics.influxDBInstanceConfiguration.protocol}://${influxStatics.influxDBInstanceConfiguration.host}:${influxStatics.influxDBInstanceConfiguration.port}`;
	const token = _getToken(adapter);
	influxStatics.influxDB = new InfluxDB({
		url: url,
		token: token,
	});
	if (!influxStatics.influxDB) throw new Error('no influxdb instance configuration');

	try {
		influxStatics.queryAPI = influxStatics.influxDB.getQueryApi('swissglider');
		influxStatics.orgsAPI = new OrgsAPI(influxStatics.influxDB);
		influxStatics.labelsAPI = new LabelsAPI(influxStatics.influxDB);
		influxStatics.bucketsAPI = new BucketsAPI(influxStatics.influxDB);
		influxStatics.writeApiLabel = influxStatics.influxDB.getWriteApi(
			influxStatics.influxDBInstanceConfiguration.organization,
			adapter.config.InfluxDBHandlerAdapter_bucketLabels,
		);
		// get the organization
		if (!influxStatics.influxDBInstanceConfiguration) throw new Error(`No organization found!`);
		const name = influxStatics.influxDBInstanceConfiguration.organization;
		const apiResponse = await influxStatics.orgsAPI?.getOrgs({ org: name });
		if (apiResponse) {
			if (!apiResponse.orgs || apiResponse.orgs.length === 0) {
				throw new Error(`No organization named ${name} found!`);
			}
			influxStatics.organization = apiResponse.orgs[0];
		} else {
			throw new Error('Something is wrong while getting the InfluxDB Organization');
		}
	} catch (error) {
		console.error(error);
		throw new Error(`something went wrong while establish the influxDB connection: ${error}`);
	}
	try {
		// get InfluxName
		const _influxName = await _getInfluxName(adapter);
		_STATUS._isReady = 'ok';
		await LabelBucketHandler.initInfluxDB(adapter, _influxName);
		await BatteryBucketHandler.initInfluxDB(adapter, _influxName);
	} catch (error) {
		throw new Error(`something went wrong while establish the influxDB connection: ${error}`);
	}
};

const _init = async (adapter: ioBroker.Adapter): Promise<void> => {
	if (!adapter.config.InfluxDBHandlerAdapter_active) {
		_STATUS._isReady = 'ok';
		return;
	}
	try {
		await _initInfluxDBTags(adapter);
	} catch (error) {
		_STATUS._isReady = 'nok';
		adapter.log.error(`unknown error: ${error}`);
	}
};

const checkInitReady = async (adapter: ioBroker.Adapter): Promise<void> => {
	await checkInitReadyUtil.default(adapter, _STATUS, _init);
};

const init = async (adapter: ioBroker.Adapter): Promise<void> => {
	await checkInitReady(adapter);
};

const testInfluxDBConnectionWithToken = async (
	adapter: ioBroker.Adapter,
	{ token: token }: Record<string, any>,
): Promise<string | { error: string }> => {
	await checkInitReady(adapter);
	// create config object for influxDB Test call
	const isAdapterConnected = await AdapterUtilsFunctions.isAdapterConnected(adapter, 'influxdb');
	if (!isAdapterConnected) throw new Error('Influxdb adapter is not running correct');
	const tmpConfig = {
		...influxStatics.influxDBInstanceConfiguration,
		...{
			token: token,
		},
	};
	const usedParams = ['port', 'host', 'dbversion', 'protocol', 'organization', 'dbname', 'token'];
	const subset = Object.fromEntries(Object.entries(tmpConfig).filter(([key]) => usedParams.includes(key)));
	const influxName = await _getInfluxName(adapter);

	const testResult: ioBroker.Message | undefined = await adapter
		.sendToAsync(influxName, 'test', { config: subset })
		.catch((reason) => {
			throw new Error(reason);
		});

	if ((testResult as any).error) {
		throw (testResult as any).error;
	}
	return 'ok';
};

const createBucketIfNeeded = async (adapter: ioBroker.Adapter, name: string, description: string): Promise<void> => {
	await checkInitReady(adapter);
	const { id: orgID } = _getOrganization();
	const temp = await influxStatics.bucketsAPI?.getBuckets({
		orgID,
	});
	if (temp && temp.buckets && influxStatics.influxDBInstanceConfiguration) {
		let tmpRetentionRules;
		for (const bucket of temp.buckets) {
			const influxDBOrgBucketName =
				influxStatics.influxDBInstanceConfiguration.bucket ??
				influxStatics.influxDBInstanceConfiguration.dbname;
			if (bucket.name === influxDBOrgBucketName) {
				tmpRetentionRules = bucket.retentionRules;
			}
			if (bucket.name === name) {
				return;
			}
		}
		const tmpBucket = await influxStatics.bucketsAPI?.postBuckets({
			body: {
				name: name,
				description: description,
				retentionRules: tmpRetentionRules ?? [],
				orgID: orgID as string,
			},
		});
		if (tmpBucket && tmpBucket.id) {
			await _addAllLabelsToTheBucket(adapter, tmpBucket.id);
		}
	}
};

const deleteBucket = async (adapter: ioBroker.Adapter, bucketName: string): Promise<void> => {
	await checkInitReady(adapter);
	const { id: orgID } = _getOrganization();
	const temp = await influxStatics.bucketsAPI?.getBuckets({
		orgID,
	});
	if (temp && temp.buckets) {
		for (const bucket of temp.buckets) {
			if (bucket.name === bucketName && bucket.id) {
				await influxStatics.bucketsAPI?.deleteBucketsID({ bucketID: bucket.id });
			}
		}
	}
};

const getBucketWriteApi = async (adapter: ioBroker.Adapter, bucketName: string): Promise<WriteApi | undefined> => {
	await checkInitReady(adapter);
	if (!influxStatics.influxDBInstanceConfiguration || !influxStatics.influxDB) return undefined;
	return influxStatics.influxDB.getWriteApi(influxStatics.influxDBInstanceConfiguration.organization, bucketName);
};

const getHealthStati = async (adapter: ioBroker.Adapter): Promise<T_AdapterStates> => {
	await checkInitReady(adapter);
	const singleAStates = await AdapterUtilsFunctions.getAdapterSingleStates(adapter, 'influxdb');
	const returnValue = { ...singleAStates, ...{ adapterFullReady: false } };
	try {
		await testInfluxDBConnectionWithToken(adapter, { token: _getToken(adapter) });
		returnValue.adapterFullReady = true;
	} catch (error) {
		returnValue.adapterFullReady = false;
	}
	return returnValue;
};

const isHealth = async (adapter: ioBroker.Adapter): Promise<boolean> => {
	await checkInitReady(adapter);
	const returnValue = await getHealthStati(adapter);
	return Object.values(returnValue).every((e) => e);
};

const rename = async (adapter: ioBroker.Adapter): Promise<string | { error: string }> => {
	await checkInitReady(adapter);
	const returnValue = { error: `Rename not available for ${name}` };
	return returnValue;
};

const refreshAllTagsOnInfluxDB = async (adapter: ioBroker.Adapter): Promise<string | { error: string }> => {
	await checkInitReady(adapter);
	try {
		if (adapter.config.InfluxDBHandlerAdapter_active) {
			await LabelBucketHandler.updateAll(adapter);
		}
		return 'ok';
	} catch (error) {
		return { error: `${error}` };
	}
};

const InfluxDBHandlerAdapter: T_IOBAdapter_Handler & { influxDBExportFunc: { [x: string]: any } } = {
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
		writeBatteryPoints: BatteryBucketHandler.writePoints,
		getHealthStati: getHealthStati,
		checkInitReady: checkInitReady,
	},
};

export default InfluxDBHandlerAdapter;
