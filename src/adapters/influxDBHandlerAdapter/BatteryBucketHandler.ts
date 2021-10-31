import { Point, WriteApi } from '@influxdata/influxdb-client';
import InfluxDBHandlerAdapter from '.';
import InfluxDBPointsHelper from '../../utils/adapterUtils/InfluxDBPointsHelper';
import { T_TAGS_TYPE } from '../../utils/types/T_TAGS_TYPE';

let _writeApi: WriteApi | undefined;
let _influxName: string;

const writePoints = async (
	adapter: ioBroker.Adapter,
	input: { tags: T_TAGS_TYPE; value: boolean | number | string }[],
): Promise<void> => {
	if (!(await InfluxDBHandlerAdapter.isHealth(adapter))) return;
	if (!adapter.config.InfluxDBHandlerAdapter_active) return;
	const points: Point[] = [];
	for (const { tags, value } of input) {
		points.push(InfluxDBPointsHelper.createPointFromTags(tags, value));
	}
	_writeApi?.writePoints(points);
	try {
		await _writeApi?.flush();
		// await _writeApiBattery?.close();
	} catch (error) {
		console.error('WRITE FAILED', error);
		throw error;
	}
};

const initInfluxDB = async (adapter: ioBroker.Adapter, influxName: string): Promise<void> => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_influxName = influxName;
	await InfluxDBHandlerAdapter.createBucketIfNeeded(
		adapter,
		adapter.config.BatteryChecker_bucket,
		'Created by Swissglider:TheHome Adapter for batteryStati Measurements',
	);
	_writeApi = await InfluxDBHandlerAdapter.getBucketWriteApi(adapter, adapter.config.BatteryChecker_bucket);
};

const deleteBucket = async (adapter: ioBroker.Adapter): Promise<void> => {
	await InfluxDBHandlerAdapter.deleteBucket(adapter.config.BatteryChecker_bucket);
};

const BatteryBucketHandler = {
	initInfluxDB: initInfluxDB,
	writePoints: writePoints,
	deleteBucket: deleteBucket,
};

export default BatteryBucketHandler;
