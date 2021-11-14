/*
 * Created with @iobroker/create-adapter v1.34.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter

import * as utils from '@iobroker/adapter-core';
import ConfigAdapter from './adapters/configAdapter';
import BatteryChecker from './checker/batteryChecker';
import ConnectionChecker from './checker/connectionChecker';
import DasWetterAdapter from './iobAdapterHandler/dasWetterAdapter';
import HMIPAdapter from './iobAdapterHandler/hmipAdapter';
import HueAdapter from './iobAdapterHandler/hueAdapter';
import InfluxDBHandlerAdapter from './iobAdapterHandler/influxDBHandlerAdapter';
import JeelinkAdapter from './iobAdapterHandler/jeelinkAdapter';
import MiNameAdapter from './iobAdapterHandler/miNameAdapter';
import NetatmoAdapter from './iobAdapterHandler/netatmoAdapter';
import ShellyAdapter from './iobAdapterHandler/shellyAdapter';
import SonoffAdapter from './iobAdapterHandler/sonoffAdapter';
import SwissWeahterApiAdapter from './iobAdapterHandler/swissWeahterApiAdapter';
import WeatherundergroundAdapter from './iobAdapterHandler/weatherUndergroundAdapter';
import ConfigChangeListener from './listener/configChangeListener';
import AdapterUtilsFunctions from './utils/adapterUtils/adapterUtilsFunctions';
import { T_IOBAdapter_Handler } from './utils/types/T_IOBAdapter_Handler';
import { T_SubAdapter } from './utils/types/T_SubAdapter';

const errMsgNoAdaptName = { error: 'no adapter mentioned' };
const errMsgAdaptNotInit = { error: 'adapter not correct initialized' };
const errMsgStringAndID = { error: 'config must be a id on the object' };

const iobAdapterHandler: Record<string, T_IOBAdapter_Handler> = {
	[InfluxDBHandlerAdapter.name]: InfluxDBHandlerAdapter,
	[MiNameAdapter.name]: MiNameAdapter,
	[NetatmoAdapter.name]: NetatmoAdapter,
	[HMIPAdapter.name]: HMIPAdapter,
	[ShellyAdapter.name]: ShellyAdapter,
	[SonoffAdapter.name]: SonoffAdapter,
	[WeatherundergroundAdapter.name]: WeatherundergroundAdapter,
	[SwissWeahterApiAdapter.name]: SwissWeahterApiAdapter,
	[DasWetterAdapter.name]: DasWetterAdapter,
	[JeelinkAdapter.name]: JeelinkAdapter,
	[HueAdapter.name]: HueAdapter,
};

const subAdapters: Record<string, T_SubAdapter> = {
	[ConfigChangeListener.name]: ConfigChangeListener,
	[ConfigAdapter.name]: ConfigAdapter,
	[BatteryChecker.name]: BatteryChecker,
	[ConnectionChecker.name]: ConnectionChecker,
};

class Thehome extends utils.Adapter {
	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			...options,
			name: 'thehome',
		});
		this.on('message', this.onMessage.bind(this));
		this.on('ready', this.onReady.bind(this));
		this.on('unload', this.onUnload.bind(this));

		// init all the subAdapters
		for (const subAdapter of Object.values(subAdapters)) {
			if (subAdapter.init) {
				subAdapter.init(this);
			}
		}
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	private async onReady(): Promise<void> {
		await AdapterUtilsFunctions.checkIFStartable(this);
		for (const adapt of Object.values(iobAdapterHandler)) {
			if (adapt.init) {
				await adapt.init(this);
			}
		}
		this.subscribeForeignObjects('*', 'state');
		this.subscribeForeignObjects('*', 'channel');
		this.subscribeForeignObjects('*', 'device');
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 */
	private async onUnload(): Promise<void> {
		this.unsubscribeForeignObjects('*', 'state');
		this.unsubscribeForeignObjects('*', 'channel');
		this.unsubscribeForeignObjects('*', 'device');
		for (const adapt of Object.values(iobAdapterHandler)) {
			if (adapt.destroy) {
				await adapt.destroy(this);
			}
		}
		// this.terminate ? this.terminate() : process.exit();
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  */
	private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
		this.log.silly('Main::onObjectChange');
		if (obj) {
			// The object was changed
			this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
		} else {
			// The object was deleted
			this.log.info(`object ${id} deleted`);
		}
	}

	/**
	 * Is called if a subscribed state changes
	 */
	private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	/**
	 * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	 * Using this method requires "common.messagebox" property to be set to true in io-package.json
	 */
	private async onMessage(obj: ioBroker.Message): Promise<void> {
		const checkStringAndMsgID = (): void => {
			if (!(typeof obj.message !== 'string' && 'id' in obj.message)) {
				this.sendTo(obj.from, obj.command, errMsgStringAndID, obj.callback);
			}
		};
		const proceedStandardBooleanAndEndAdapterFunction = async (func: any): Promise<void> => {
			if (typeof obj.message !== 'string' && 'adapterName' in obj.message) {
				const result = await func(this, obj.message.adapterName, obj.message);
				this.sendTo(obj.from, obj.command, result ? 'ok' : 'nok', obj.callback);
			} else {
				this.sendTo(obj.from, obj.command, errMsgNoAdaptName, obj.callback);
			}
		};
		const handleError = (error: any): void => {
			let errorMsg = '';
			if ((error as any).message) {
				errorMsg = (error as any).message;
			} else {
				errorMsg = `${error}`;
			}
			this.sendTo(obj.from, obj.command, { error: errorMsg }, obj.callback);
		};

		const msg = obj.message as any;
		if (typeof obj === 'object') {
			try {
				switch (obj.command) {
					case 'init':
						this.sendTo(obj.from, obj.command, { error: 'init not allowed' }, obj.callback);
						break;
					case 'getObjectWithEnums':
						checkStringAndMsgID();
						const en = await this.getForeignObjectsAsync(msg.id, 'state', ['rooms', 'functions']);
						this.sendTo(obj.from, obj.command, Object.values(en)[0], obj.callback);
						break;
					case 'getObjectWithoutEnums':
						checkStringAndMsgID();
						const en1 = await this.getForeignObjectsAsync(msg.id, 'state');
						this.sendTo(obj.from, obj.command, Object.values(en1)[0], obj.callback);
						break;
					case 'isAdapterInstalled':
						await proceedStandardBooleanAndEndAdapterFunction(AdapterUtilsFunctions.isAdapterInstalled);
						break;
					case 'isAdapterRunning':
						await proceedStandardBooleanAndEndAdapterFunction(AdapterUtilsFunctions.isAdapterRunning);
						break;
					case 'isAdapterConnected':
						await proceedStandardBooleanAndEndAdapterFunction(AdapterUtilsFunctions.isAdapterConnected);
						break;
					default:
						if (typeof obj.message !== 'string' && 'adapterName' in obj.message) {
							const adaptName = msg.adapterName;
							const adpater = iobAdapterHandler[adaptName];
							if (adpater && adpater.onMessageFunc && obj.command in adpater.onMessageFunc) {
								try {
									const returnResult = await adpater.onMessageFunc[obj.command](this, msg);
									this.sendTo(obj.from, obj.command, returnResult, obj.callback);
								} catch (error) {
									handleError(error);
								}
							} else {
								this.sendTo(obj.from, obj.command, errMsgAdaptNotInit, obj.callback);
							}
						} else {
							this.sendTo(obj.from, obj.command, errMsgNoAdaptName, obj.callback);
						}
				}
			} catch (error) {
				this.log.error(`${error}`);
				this.sendTo(obj.from, obj.command, { error: `${error}` }, obj.callback);
			}
		}
	}
}

if (require.main !== module) {
	// Export the constructor in compact mode
	module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new Thehome(options);
} else {
	// otherwise start the instance directly
	(() => new Thehome())();
}
