"use strict";
/*
 * Created with @iobroker/create-adapter v1.34.1
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = __importStar(require("@iobroker/adapter-core"));
const configAdapter_1 = __importDefault(require("./adapters/configAdapter"));
const influxDBHandlerAdapter_1 = __importDefault(require("./adapters/influxDBHandlerAdapter"));
const configChangeListener_1 = __importDefault(require("./listener/configChangeListener"));
class Thehome extends utils.Adapter {
    constructor(options = {}) {
        super({
            ...options,
            name: 'thehome',
        });
        this.on('message', this.onMessage.bind(this));
        this.on('ready', this.onReady.bind(this));
        configChangeListener_1.default.init(this);
        configAdapter_1.default.init(this);
        influxDBHandlerAdapter_1.default.init(this);
        this.on('unload', this.onUnload.bind(this));
    }
    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        this.subscribeForeignObjects('*', 'state');
        this.subscribeForeignObjects('*', 'channel');
        this.subscribeForeignObjects('*', 'device');
    }
    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    async onUnload() {
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
    onObjectChange(id, obj) {
        this.log.silly('Main::onObjectChange');
        if (obj) {
            // The object was changed
            this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
        }
        else {
            // The object was deleted
            this.log.info(`object ${id} deleted`);
        }
    }
    /**
     * Is called if a subscribed state changes
     */
    onStateChange(id, state) {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        }
        else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }
    // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
    /**
     * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
     * Using this method requires "common.messagebox" property to be set to true in io-package.json
     */
    async onMessage(obj) {
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
    module.exports = (options) => new Thehome(options);
}
else {
    // otherwise start the instance directly
    (() => new Thehome())();
}
//# sourceMappingURL=main.js.map