import { Point, WriteApi } from '@influxdata/influxdb-client';
import InfluxDBHandlerAdapter from '.';
import InfluxDBPointsHelper from '../../utils/adapterUtils/InfluxDBPointsHelper';
import { T_TAGS_TYPE } from '../../utils/types/T_TAGS_TYPE';

let _writeApi: WriteApi | undefined;
let _influxName: string;

const deleteBucket = async (adapter: ioBroker.Adapter): Promise<void> => {
	await InfluxDBHandlerAdapter.deleteBucket(adapter, adapter.config.InfluxDBHandlerAdapter_bucketLabels);
};

const _updateAllLabels = async (adapter: ioBroker.Adapter): Promise<void> => {
	try {
		await deleteBucket(adapter);
		await InfluxDBHandlerAdapter.createBucketIfNeeded(
			adapter,
			adapter.config.InfluxDBHandlerAdapter_bucketLabels,
			'Created by Swissglider:TheHome Adapter for taged based Measurements',
		);
		const tmpoAllObjects = await adapter.getForeignObjectsAsync('*');
		const points: Point[] = [];
		for (const obj of Object.values(tmpoAllObjects)) {
			if (obj.common.custom && obj.common.custom[_influxName]?.enabled === true) {
				const tags: T_TAGS_TYPE = await InfluxDBPointsHelper.createTagType(adapter, obj);
				points.push(InfluxDBPointsHelper.createPointFromTags(tags, 'tags'));
			}
		}
		_writeApi?.writePoints(points);
		await _writeApi?.flush();
	} catch (error) {
		console.error(error);
		throw error;
	}
};

const updateAll = async (adapter: ioBroker.Adapter): Promise<void> => {
	if (await InfluxDBHandlerAdapter.isHealth(adapter)) {
		await _updateAllLabels(adapter);
	}
};

const initInfluxDB = async (adapter: ioBroker.Adapter, influxName: string): Promise<void> => {
	_influxName = influxName;
	_writeApi = await InfluxDBHandlerAdapter.getBucketWriteApi(
		adapter,
		adapter.config.InfluxDBHandlerAdapter_bucketLabels,
	);
	await _updateAllLabels(adapter);
};

const LabelBucketHandler = {
	initInfluxDB: initInfluxDB,
	deleteBucket: deleteBucket,
	updateAll: updateAll,
};

export default LabelBucketHandler;
