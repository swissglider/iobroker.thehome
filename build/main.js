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
const batteryChecker_1 = __importDefault(require("./checker/batteryChecker"));
const connectionChecker_1 = __importDefault(require("./checker/connectionChecker"));
const configChangeListener_1 = __importDefault(require("./listener/configChangeListener"));
const hmipAdapter_1 = __importDefault(require("./renameAdapter/hmipAdapter"));
const miNameAdapter_1 = __importDefault(require("./renameAdapter/miNameAdapter"));
const netatmoAdapter_1 = __importDefault(require("./renameAdapter/netatmoAdapter"));
const shellyAdapter_1 = __importDefault(require("./renameAdapter/shellyAdapter"));
const sonoffAdapter_1 = __importDefault(require("./renameAdapter/sonoffAdapter"));
const adapterUtilsFunctions_1 = __importDefault(require("./utils/adapterUtils/adapterUtilsFunctions"));
const errMsgNoAdaptName = { error: 'no adapter mentioned' };
const errMsgAdaptNotInit = { error: 'adapter not correct initialized' };
const errMsgStringAndID = { error: 'config must be a id on the object' };
const renameAdapters = {
    [influxDBHandlerAdapter_1.default.name]: influxDBHandlerAdapter_1.default,
    [miNameAdapter_1.default.name]: miNameAdapter_1.default,
    [netatmoAdapter_1.default.name]: netatmoAdapter_1.default,
    [hmipAdapter_1.default.name]: hmipAdapter_1.default,
    [shellyAdapter_1.default.name]: shellyAdapter_1.default,
    [sonoffAdapter_1.default.name]: sonoffAdapter_1.default,
};
const subAdapters = {
    [configChangeListener_1.default.name]: configChangeListener_1.default,
    [configAdapter_1.default.name]: configAdapter_1.default,
    [batteryChecker_1.default.name]: batteryChecker_1.default,
    [connectionChecker_1.default.name]: connectionChecker_1.default,
};
class Thehome extends utils.Adapter {
    constructor(options = {}) {
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
        const handleError = (error) => {
            let errorMsg = '';
            if (error.message) {
                errorMsg = error.message;
            }
            else {
                errorMsg = `${error}`;
            }
            this.sendTo(obj.from, obj.command, { error: errorMsg }, obj.callback);
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
                            if (adpater && adpater.onMessageFunc && obj.command in adpater.onMessageFunc) {
                                try {
                                    const returnResult = await adpater.onMessageFunc[obj.command](this, msg);
                                    this.sendTo(obj.from, obj.command, returnResult, obj.callback);
                                }
                                catch (error) {
                                    handleError(error);
                                }
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
                this.log.error(`${error}`);
                this.sendTo(obj.from, obj.command, { error: `${error}` }, obj.callback);
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