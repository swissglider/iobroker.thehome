import InfluxDBHandlerAdapter from '../../adapters/influxDBHandlerAdapter';
import { T_RearangeDeviceAndStates_Props } from '../types/T_Rename_Adapter';
import EnumHandler from './enumHandler';
import IOBrokerObjectHanlder_Name_Custom from './ioBrokerObjectHanlder_Name_Custom';

export const rearangeDeviceAndStates = async (
	adapter: ioBroker.Adapter,
	isHealth: (adapter: ioBroker.Adapter) => Promise<boolean>,
	configMapping: Record<string, Record<string, Record<string, any>>>,
	rootLevelElementsCreator: (adapter: ioBroker.Adapter) => Promise<T_RearangeDeviceAndStates_Props[]>,
): Promise<string | { error: string }> => {
	try {
		// check if influxdb adapter is installed running connected and ready
		const statiInfluxdb = await InfluxDBHandlerAdapter.getHealthStati(adapter);
		if (Object.values(statiInfluxdb).some((e) => !e)) return { error: 'influxdb not fully running' };

		// check if local adapter is installed running connected and ready
		const adapterStati = await isHealth(adapter);
		if (!adapterStati) return { error: 'adapter not fully running' };

		// rename
		const rootLevelElemets = await rootLevelElementsCreator(adapter);
		for (const { deviceType, room, additionalNames, rootObj } of rootLevelElemets) {
			// await rearangeDeviceAndStates(rootLevelElemen);
			const elementInfos = { deviceType, room, additionalNames: additionalNames ?? [] };

			const newName = [elementInfos.deviceType, elementInfos.room, ...elementInfos.additionalNames].join(' ');
			rootObj.common.name = newName;
			delete rootObj.enums;
			await adapter.setForeignObjectAsync(rootObj._id, rootObj);

			// rename substates
			const objs = await adapter.getForeignObjectsAsync(rootObj._id + '*', 'state');
			for (const obj of Object.values(objs)) {
				const obj_id_name = obj._id.substr(obj._id.lastIndexOf('.') + 1);
				if (
					elementInfos.deviceType &&
					elementInfos.deviceType !== '' &&
					configMapping[elementInfos.deviceType] &&
					configMapping[elementInfos.deviceType][obj_id_name]
				) {
					const func = configMapping[elementInfos.deviceType][obj_id_name].functionID;
					const func_name = func.substr(func.lastIndexOf('.') + 1);
					obj.common.name = newName + ' ' + func_name;
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
					const toDB = configMapping[elementInfos.deviceType][obj_id_name].toInfluxDB;
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
