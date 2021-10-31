import { Point } from '@influxdata/influxdb-client';
import InfluxDBHandlerAdapter from '../../adapters/influxDBHandlerAdapter';
import { T_Object_Parent_Names } from '../types/T_Object_Parent_Names';
import { T_TAGS_TYPE } from '../types/T_TAGS_TYPE';
import NameHelper from './nameHelper';

const createTagType = async (adapter: ioBroker.Adapter, obj: ioBroker.Object): Promise<T_TAGS_TYPE> => {
	if (!(await InfluxDBHandlerAdapter.isHealth(adapter))) Promise.reject;
	if (!adapter.config.InfluxDBHandlerAdapter_active) Promise.reject;
	const parentNames: T_Object_Parent_Names = await NameHelper.getObjectParentNames(adapter, obj._id);
	const tags: T_TAGS_TYPE = {
		id: obj._id,
		name: NameHelper.getName(obj.common?.name ?? '', adapter.systemConfig?.language ?? 'de'),
		channelName: parentNames.channelName ?? '-',
		deviceName: parentNames.deviceName ?? '-',
		adapterName: parentNames.adapterName,
		instanceNumber: parentNames.instanceNumber,
		role: obj.common.role as string,
		unit: obj.common.unit as string,
		value_type: obj.common.type as string,
		function: NameHelper.getEnumNameFromObject(adapter, obj.enums, '.functions.', '-') as string,
		room: NameHelper.getEnumNameFromObject(adapter, obj.enums, '.rooms.', '-') as string,
	};
	for (const key of Object.keys(tags)) {
		tags[key as keyof T_TAGS_TYPE] = tags[key as keyof T_TAGS_TYPE] ?? '-';
		tags[key as keyof T_TAGS_TYPE] = (tags[key as keyof T_TAGS_TYPE] as string).replace(/\s/g, '_');
	}
	return tags;
};

const createPointFromTags = (tags: T_TAGS_TYPE, value: boolean | number | string): Point => {
	const point = new Point(tags.id)
		.tag('id', tags.id)
		.tag('name', tags.name)
		.tag('channelName', tags.channelName)
		.tag('deviceName', tags.deviceName)
		.tag('instanceNumber', tags.instanceNumber)
		.tag('adapterName', tags.adapterName)
		.tag('role', tags.role)
		.tag('unit', tags.unit)
		.tag('value_type', tags.value_type)
		.tag('function', tags.function)
		.tag('room', tags.room);
	switch (typeof value) {
		case 'boolean':
			point.booleanField('value', value);
			break;
		case 'number':
			point.floatField('value', value);
			break;
		case 'string':
		default:
			point.stringField('value', value);
			break;
	}
	return point;
};

const InfluxDBPointsHelper = {
	createTagType: createTagType,
	createPointFromTags: createPointFromTags,
};

export default InfluxDBPointsHelper;
