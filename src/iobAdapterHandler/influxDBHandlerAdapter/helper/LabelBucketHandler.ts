import { Point } from '@influxdata/influxdb-client';
import InfluxDBHandlerAdapter from '..';
import InfluxDBPointsHelper from '../../../utils/adapterUtils/InfluxDBPointsHelper';
import { T_STATUS } from '../../../utils/types/T_IOBAdapter_Handler';
import { T_TAGS_TYPE } from '../../../utils/types/T_TAGS_TYPE';

const _STATUS: T_STATUS = {
	writeApi: undefined,
	influxName: '',
	_isReady: 'nok',
	_name: 'LabelBucketHandler',
};

const deleteBucket = async (adapter: ioBroker.Adapter): Promise<void> => {
	await InfluxDBHandlerAdapter.influxDBExportFunc.deleteBucket(
		adapter,
		adapter.config.InfluxDBHandlerAdapter_bucketLabels,
	);
};

const _updateAllLabels = async (adapter: ioBroker.Adapter): Promise<void> => {
	try {
		await deleteBucket(adapter);
		await InfluxDBHandlerAdapter.influxDBExportFunc.createBucketIfNeeded(
			adapter,
			adapter.config.InfluxDBHandlerAdapter_bucketLabels,
			'Created by Swissglider:TheHome Adapter for taged based Measurements',
		);
		const tmpoAllObjects = await adapter.getForeignObjectsAsync('*');
		const points: Point[] = [];
		for (const obj of Object.values(tmpoAllObjects)) {
			if (obj.common.custom && obj.common.custom[_STATUS.influxName]?.enabled === true) {
				const tags: T_TAGS_TYPE = await InfluxDBPointsHelper.createTagType(adapter, obj);
				points.push(InfluxDBPointsHelper.createPointFromTags(tags, 'tags'));
			}
		}
		_STATUS.writeApi?.writePoints(points);
		await _STATUS.writeApi?.flush();
	} catch (error) {
		console.error(error);
		throw error;
	}
};

const initInfluxDB = async (adapter: ioBroker.Adapter, influxName: string): Promise<void> => {
	_STATUS._isReady = 'processing';
	_STATUS.influxName = influxName;
	try {
		_STATUS.writeApi = await InfluxDBHandlerAdapter.influxDBExportFunc.getBucketWriteApi(
			adapter,
			adapter.config.InfluxDBHandlerAdapter_bucketLabels,
		);
		await _updateAllLabels(adapter);
		_STATUS._isReady = 'ok';
	} catch (error) {
		throw error;
	}
};

const updateAll = async (adapter: ioBroker.Adapter): Promise<void> => {
	await InfluxDBHandlerAdapter.influxDBExportFunc.checkInitReady(adapter);
	if (await InfluxDBHandlerAdapter.isHealth(adapter)) {
		await _updateAllLabels(adapter);
	} else {
		throw new Error('InfluxDB Adapter not correct initialized: do you have set the Toker and saved ?');
	}
};

const LabelBucketHandler = {
	initInfluxDB: initInfluxDB,
	deleteBucket: deleteBucket,
	updateAll: updateAll,
};

export default LabelBucketHandler;
