import { Point } from '@influxdata/influxdb-client';
import InfluxDBHandlerAdapter from '..';
import InfluxDBPointsHelper from '../../../utils/adapterUtils/InfluxDBPointsHelper';
import { T_STATUS } from '../../../utils/types/T_IOBAdapter_Handler';
import { T_TAGS_TYPE } from '../../../utils/types/T_TAGS_TYPE';

const _STATUS: T_STATUS = {
	writeApi: undefined,
	influxName: '',
	_isReady: 'nok',
	_name: 'BatteryBucketHandler',
};

const writePoints = async (
	adapter: ioBroker.Adapter,
	input: { tags: T_TAGS_TYPE; value: boolean | number | string }[],
): Promise<void> => {
	await InfluxDBHandlerAdapter.influxDBExportFunc.checkInitReady(adapter);
	if (!(await InfluxDBHandlerAdapter.isHealth(adapter))) return;
	if (!adapter.config.InfluxDBHandlerAdapter_active) return;
	const points: Point[] = [];
	for (const { tags, value } of input) {
		points.push(InfluxDBPointsHelper.createPointFromTags(tags, value));
	}
	_STATUS.writeApi?.writePoints(points);
	try {
		await _STATUS.writeApi?.flush();
		// await _writeApiBattery?.close();
	} catch (error) {
		console.error('WRITE FAILED', error);
		throw error;
	}
};

const initInfluxDB = async (adapter: ioBroker.Adapter, influxName: string): Promise<void> => {
	_STATUS._isReady = 'processing';
	_STATUS.influxName = influxName;
	await InfluxDBHandlerAdapter.influxDBExportFunc.createBucketIfNeeded(
		adapter,
		adapter.config.BatteryChecker_bucket,
		'Created by Swissglider:TheHome Adapter for batteryStati Measurements',
	);
	_STATUS.writeApi = await InfluxDBHandlerAdapter.influxDBExportFunc.getBucketWriteApi(
		adapter,
		adapter.config.BatteryChecker_bucket,
	);
	_STATUS._isReady = 'ok';
};

const deleteBucket = async (adapter: ioBroker.Adapter): Promise<void> => {
	await InfluxDBHandlerAdapter.influxDBExportFunc.checkInitReady(adapter);
	await InfluxDBHandlerAdapter.influxDBExportFunc.deleteBucket(adapter.config.BatteryChecker_bucket);
};

const BatteryBucketHandler = {
	initInfluxDB: initInfluxDB,
	writePoints: writePoints,
	deleteBucket: deleteBucket,
};

export default BatteryBucketHandler;
