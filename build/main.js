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
const miNameAdapter_1 = __importDefault(require("./adapters/miNameAdapter"));
const netatmoAdapter_1 = __importDefault(require("./adapters/netatmoAdapter"));
const batteryChecker_1 = __importDefault(require("./checker/batteryChecker"));
const connectionChecker_1 = __importDefault(require("./checker/connectionChecker"));
const configChangeListener_1 = __importDefault(require("./listener/configChangeListener"));
const adapterUtilsFunctions_1 = __importDefault(require("./utils/adapterUtils/adapterUtilsFunctions"));
const errMsgNoAdaptName = { error: 'no adapter mentioned' };
const errMsgAdaptNotInit = { error: 'adapter not correct initialized' };
const errMsgStringAndID = { error: 'config must be a id on the object' };
const renameAdapters = {
    [influxDBHandlerAdapter_1.default.name]: influxDBHandlerAdapter_1.default,
    [miNameAdapter_1.default.name]: miNameAdapter_1.default,
    [netatmoAdapter_1.default.name]: netatmoAdapter_1.default,
};
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
        batteryChecker_1.default.init(this);
        connectionChecker_1.default.init(this);
        this.on('unload', this.onUnload.bind(this));
    }
    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        await adapterUtilsFunctions_1.default.checkIFStartable(this);
        for (const adapt of Object.values(renameAdapters)) {
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
    async onUnload() {
        this.unsubscribeForeignObjects('*', 'state');
        this.unsubscribeForeignObjects('*', 'channel');
        this.unsubscribeForeignObjects('*', 'device');
        for (const adapt of Object.values(renameAdapters)) {
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
        const checkStringAndMsgID = () => {
            if (!(typeof obj.message !== 'string' && 'id' in obj.message)) {
                this.sendTo(obj.from, obj.command, errMsgStringAndID, obj.callback);
            }
        };
        const proceedStandardBooleanAndEndAdapterFunction = async (func) => {
            if (typeof obj.message !== 'string' && 'adapterName' in obj.message) {
                const result = await func(this, obj.message.adapterName, obj.message);
                this.sendTo(obj.from, obj.command, result ? 'ok' : 'nok', obj.callback);
            }
            else {
                this.sendTo(obj.from, obj.command, errMsgNoAdaptName, obj.callback);
            }
        };
        const msg = obj.message;
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
                        await proceedStandardBooleanAndEndAdapterFunction(adapterUtilsFunctions_1.default.isAdapterInstalled);
                        break;
                    case 'isAdapterRunning':
                        await proceedStandardBooleanAndEndAdapterFunction(adapterUtilsFunctions_1.default.isAdapterRunning);
                        break;
                    case 'isAdapterConnected':
                        await proceedStandardBooleanAndEndAdapterFunction(adapterUtilsFunctions_1.default.isAdapterConnected);
                        break;
                    default:
                        if (typeof obj.message !== 'string' && 'adapterName' in obj.message) {
                            const adaptName = msg.adapterName;
                            const adpater = renameAdapters[adaptName];
                            if (adpater && obj.command in adpater) {
                                const returnResult = await adpater[obj.command](this, msg);
                                this.sendTo(obj.from, obj.command, returnResult, obj.callback);
                            }
                            else {
                                this.sendTo(obj.from, obj.command, errMsgAdaptNotInit, obj.callback);
                            }
                        }
                        else {
                            this.sendTo(obj.from, obj.command, errMsgNoAdaptName, obj.callback);
                        }
                }
            }
            catch (error) {
                console.error(`${error}`);
                this.log.error(`${error}`);
                this.sendTo(obj.from, obj.command, `${error}`, obj.callback);
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