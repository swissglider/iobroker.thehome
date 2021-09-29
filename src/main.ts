/*
 * Created with @iobroker/create-adapter v1.34.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter

import * as utils from '@iobroker/adapter-core';
import ConfigAdapter from './adapters/configAdapter';
import InfluxDBHandlerAdapter from './adapters/influxDBHandlerAdapter';
import ConfigChangeListener from './listener/configChangeListener';

class Thehome extends utils.Adapter {
	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			...options,
			name: 'thehome',
		});
		this.on('message', this.onMessage.bind(this));

		this.on('ready', this.onReady.bind(this));
		ConfigChangeListener.init(this);
		ConfigAdapter.init(this);
		InfluxDBHandlerAdapter.init(this);
		this.on('unload', this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	private async onReady(): Promise<void> {
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
	}
}

if (require.main !== module) {
	// Export the constructor in compact mode
	module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new Thehome(options);
} else {
	// otherwise start the instance directly
	(() => new Thehome())();
}
