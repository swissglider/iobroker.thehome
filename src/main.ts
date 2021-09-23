/*
 * Created with @iobroker/create-adapter v1.34.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import { InfluxDB } from '@influxdata/influxdb-client';
import { DeleteAPI } from '@influxdata/influxdb-client-apis';
import * as utils from '@iobroker/adapter-core';
import ConfigAdapter from './adapters/configAdapter';
import ConfigChangeListener from './listener/configChangeListener';

// Load your modules here, e.g.:
// import * as fs from "fs";

class Thehome extends utils.Adapter {
	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			...options,
			name: 'thehome',
		});
		// try {
		this.on('message', this.onMessage.bind(this));

		this.on('ready', this.onReady.bind(this));
		ConfigChangeListener.init(this);
		ConfigAdapter.init(this);
		// } catch (err: any) {
		// 	// TODO ERRORHANDLING
		// 	this.log.error('***********************');
		// 	this.log.error('ERROR !!!!!');
		// 	this.log.error(err.message);
		// 	this.log.error(err.name);
		// 	this.log.error(err.stack);
		// 	this.log.error('***********************');
		// }
		// this.on('stateChange', this.onStateChange.bind(this));
		// this.on('objectChange', this.onObjectChange.bind(this));
		// this.on('unload', this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	private async onReady(): Promise<void> {
		this.subscribeForeignObjects('*', 'state');
		this.subscribeForeignObjects('*', 'channel');
		this.subscribeForeignObjects('*', 'device');
		this.test();

		// The adapters config (in the instance object everything under the attribute "native") is accessible via
		// this.config:
		// this.log.info('config option1: ' + this.config.option1);
		// this.log.info('config option2: ' + this.config.option2);

		/*
		For every state in the system there has to be also an object of type state
		Here a simple template for a boolean variable named "testVariable"
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/
		// await this.setObjectNotExistsAsync('testVariable', {
		// 	type: 'state',
		// 	common: {
		// 		name: 'testVariable',
		// 		type: 'boolean',
		// 		role: 'indicator',
		// 		read: true,
		// 		write: true,
		// 	},
		// 	native: {},
		// });

		// In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
		// this.subscribeStates('testVariable');
		// You can also add a subscription for multiple states. The following line watches all states starting with "lights."
		// this.subscribeStates('lights.*');
		// Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
		// this.subscribeStates('*');

		/*
			setState examples
			you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
		*/
		// the variable testVariable is set to true as command (ack=false)
		// await this.setStateAsync('testVariable', true);

		// same thing, but the value is flagged "ack"
		// ack should be always set to true if the value is received from or acknowledged from the target system
		// await this.setStateAsync('testVariable', { val: true, ack: true });

		// same thing, but the state is deleted after 30s (getState will return null afterwards)
		// await this.setStateAsync('testVariable', { val: true, ack: true, expire: 30 });

		// examples for the checkPassword/checkGroup functions
		// let result = await this.checkPasswordAsync('admin', 'iobroker');
		// this.log.info('check user admin pw iobroker: ' + result);

		// result = await this.checkGroupAsync('admin', 'admin');
		// this.log.info('check group user admin group admin: ' + result);
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 */
	private onUnload(callback: () => void): void {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			// clearTimeout(timeout1);
			// clearTimeout(timeout2);
			// ...
			// clearInterval(interval1);

			callback();
		} catch (e) {
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  */
	private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
		this.log.silly('Main::onObjectChange');
		console.log('Main::onObjectChange');
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
		if (typeof obj === 'object') {
			if (obj.command === 'getObjectWithEnums') {
				if (obj.callback && typeof obj.message !== 'string' && 'id' in obj.message) {
					const en = await this.getForeignObjectsAsync(obj.message.id, 'state', ['rooms', 'functions']);
					this.sendTo(obj.from, obj.command, Object.values(en)[0], obj.callback);
				}
			}
			if (obj.command == 'getObjectWithoutEnums') {
				if (obj.callback && typeof obj.message !== 'string' && 'id' in obj.message) {
					const en = await this.getForeignObjectsAsync(obj.message.id, 'state');
					this.sendTo(obj.from, obj.command, Object.values(en)[0], obj.callback);
				}
			}
		}
		// if (typeof obj === 'object' && obj.message) {
		// 	if (obj.command === 'send') {
		// 		// e.g. send email or pushover or whatever
		// 		this.log.info('send command');

		// 		// Send response in callback if required
		// 		if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
		// 	}
		// }
	}
	private async test(): Promise<void> {
		// const stri = `--bucket iobroker --predicate '_measurement="netatmo.0.Zuhaus-(Weather-Station).Outdoor-Module.Temperature.Temperature"' --start "1970-08-16T08:00:00Z" --stop "2023-08-17T08:00:00Z"`;
		const influxDB = new InfluxDB({
			url: 'http://localhost:8086',
			token: 'OfpG3jYuCZ2LAuzx0YIqlgEfYfQya3sTNzFIBU7Ofsqx87A3WojOKT_mcOhrjcyotwheUtpZLpmi0n2Hks2Sfg==',
		});
		const queryApi = influxDB.getQueryApi('swissglider');
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

		const deleteAPI = new DeleteAPI(influxDB);
		try {
			const now = new Date();
			await deleteAPI.postDelete({
				body: {
					start: '1970-08-16T08:00:00Z',
					stop: now.toISOString(),
					// predicate: `_measurement="netatmo.0.Zuhaus-(Weather-Station).Outdoor-Module.Temperature.Temperature"`,
					predicate: `_measurement="test##test##test=1"`,
				},
				org: 'swissglider',
				bucket: 'iobroker',
			});
			// await deleteAPI.postDelete({
			// 	body: {
			// 		start: '1970-08-16T08:00:00Z',
			// 		stop: now.toISOString(),
			// 		predicate: `_measurement="__test"`,
			// 	},
			// 	org: 'swissglider',
			// 	bucket: 'iobroker',
			// });
		} catch (e) {
			console.error(e);
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
