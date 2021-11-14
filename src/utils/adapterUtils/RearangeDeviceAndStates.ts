import InfluxDBHandlerAdapter from '../../iobAdapterHandler/influxDBHandlerAdapter';
import { T_RearangeDeviceAndStates_Props } from '../types/T_IOBAdapter_Handler';
import EnumHandler from './enumHandler';
import IOBrokerObjectHanlder_Name_Custom from './ioBrokerObjectHanlder_Name_Custom';

export const rearangeDeviceAndStates = async (
	adapter: ioBroker.Adapter,
	isHealth: (adapter: ioBroker.Adapter) => Promise<boolean>,
	rootLevelElementsCreator: (adapter: ioBroker.Adapter) => Promise<T_RearangeDeviceAndStates_Props[]>,
): Promise<string | { error: string }> => {
	try {
		// check if influxdb adapter is installed running connected and ready
		const statiInfluxdb = await InfluxDBHandlerAdapter.influxDBExportFunc.getHealthStati(adapter);
		if (Object.values(statiInfluxdb).some((e) => !e)) return { error: 'influxdb not fully running' };

		// check if local adapter is installed running connected and ready
		const adapterStati = await isHealth(adapter);
		if (!adapterStati) return { error: 'adapter not fully running' };

		// rename
		const rootLevelElemets = await rootLevelElementsCreator(adapter);
		for (const { deviceType, room, additionalNames, rootObj, funcID2NameMap } of rootLevelElemets) {
			// await rearangeDeviceAndStates(rootLevelElemen);
			const elementInfos = { deviceType, room, additionalNames: additionalNames ?? [] };

			const newName = [elementInfos.deviceType, elementInfos.room, ...elementInfos.additionalNames].join(' ');
			rootObj.common.name = newName;
			if (!rootObj.native || typeof rootObj.native !== 'object') {
				rootObj.native = {};
			}
			if (!rootObj.native.swissglider || typeof rootObj.native.swissglider !== 'object') {
				rootObj.native.swissglider = {};
			}
			rootObj.native.swissglider.stateName = newName;
			rootObj.native.swissglider.deviceType = elementInfos.deviceType;
			rootObj.native.swissglider.room = elementInfos.room;
			delete rootObj.enums;
			await adapter.setForeignObjectAsync(rootObj._id, rootObj);

			// rename substates
			const objs = await adapter.getForeignObjectsAsync(rootObj._id + '*', 'state');
			const configMapping = adapter.config.DeviceTypeFunctionMappings;
			for (const obj of Object.values(objs)) {
				const obj_id_name = obj._id.substr(obj._id.lastIndexOf('.') + 1);
				const tempStartWildCard = configMapping[elementInfos.deviceType]
					? Object.keys(configMapping[elementInfos.deviceType])
							.filter((e) => e.startsWith('*'))
							.map((e) => e.slice(1))
							.find((e) => obj_id_name.endsWith(e))
					: undefined;
				const tempEndWildCard = configMapping[elementInfos.deviceType]
					? Object.keys(configMapping[elementInfos.deviceType])
							.filter((e) => e.endsWith('*'))
							.map((e) => e.slice(0, -1))
							.find((e) => obj_id_name.startsWith(e))
					: undefined;
				if (configMapping[elementInfos.deviceType]) {
					Object.keys(configMapping[elementInfos.deviceType])
						.filter((e) => e.endsWith('*'))
						.map((e) => e.slice(0, -1))
						.find((e) => obj_id_name.startsWith(e));
				}
				const deviceTypeObjecIdName = tempStartWildCard
					? tempStartWildCard + '*'
					: tempEndWildCard
					? tempEndWildCard + '*'
					: obj_id_name;
				if (
					elementInfos.deviceType &&
					elementInfos.deviceType !== '' &&
					configMapping[elementInfos.deviceType] &&
					configMapping[elementInfos.deviceType][deviceTypeObjecIdName]
				) {
					const func = configMapping[elementInfos.deviceType][deviceTypeObjecIdName].functionID;
					const func_name = func.substr(func.lastIndexOf('.') + 1);
					const state_name =
						funcID2NameMap && funcID2NameMap[obj_id_name]
							? funcID2NameMap[obj_id_name]
							: newName + ' ' + func_name;
					obj.common.name = state_name;
					if (!obj.native || typeof obj.native !== 'object') {
						obj.native = {};
					}
					if (!obj.native.swissglider || typeof obj.native.swissglider !== 'object') {
						obj.native.swissglider = {};
					}
					obj.native.swissglider.stateName = state_name;
					obj.native.swissglider.deviceType = elementInfos.deviceType;
					obj.native.swissglider.room = elementInfos.room;
					obj.native.swissglider.funct = func_name;
					delete obj.enums;
					await adapter.setForeignObjectAsync(obj._id, obj);
					if (func) {
						await EnumHandler.chechAndCreateIfNeededNewEnum(adapter, func);
						await EnumHandler.addStateIDToEnum(adapter, func, obj._id);
					}
					if (elementInfos.room && elementInfos.room !== '') {
						const roomEnumID = 'enum.rooms.' + elementInfos.room;
						await EnumHandler.chechAndCreateIfNeededNewEnum(adapter, roomEnumID, elementInfos.room);
						await EnumHandler.addStateIDToEnum(adapter, roomEnumID, obj._id);
					}
					const toDB = configMapping[elementInfos.deviceType][deviceTypeObjecIdName].toInfluxDB;
					if (toDB) {
						await IOBrokerObjectHanlder_Name_Custom.setInfluxCustom(adapter, obj._id, true);
					}
				}
			}
		}
		return 'ok';
	} catch (error) {
		return { error: `${error}` };
	}
};
