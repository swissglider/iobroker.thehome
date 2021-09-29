"use strict";
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
exports.statesConfigUpload = void 0;
const E = __importStar(require("fp-ts/Either"));
const batteryChecker_1 = __importDefault(require("../../../checker/batteryChecker"));
const connectionChecker_1 = __importDefault(require("../../../checker/connectionChecker"));
const enumHandler_1 = __importDefault(require("../../../utils/adapterUtils/enumHandler"));
const nameHelper_1 = __importDefault(require("../../../utils/adapterUtils/nameHelper"));
const I_StateInformation_1 = require("../interfaces/I_StateInformation");
const statesConfigUpload = async (adapter, config) => {
    // check config
    const decodedConfig = I_StateInformation_1.stateInformations.decode(config);
    if (E.isLeft(decodedConfig))
        return 'Wrong configuration, please check the file !';
    // ==== pre work
    // = stop Battery Checker
    // = stop Connection Checker
    // = stop Config Change Listener
    // = remove states from all function and room enum
    try {
        await Promise.all([
            batteryChecker_1.default.stopBatteryChecker(adapter),
            connectionChecker_1.default.stopConnectionChecker(adapter),
            enumHandler_1.default.removeAllStatesFromAllRoomFunctionEnums(adapter),
        ]);
    }
    catch (error) {
        return `unknown error while stopping connection/battery checker or configChange listener / deleting all enums with state: ${error}`;
    }
    // ==== set new Config
    // = add all states to enums (functions/rooms) and create the enum if needed
    // = change name and store2DB on all Objects
    try {
        await Promise.all([
            enumHandler_1.default.addAllStatesToEnums(adapter, config),
            nameHelper_1.default.changeAllStateNameAndStore2DBs(adapter, config),
        ]);
    }
    catch (error) {
        console.log(error.stack);
        return `unknown error while setting name or Store2DB Parameters: ${error}`;
    }
    // ==== set new config
    // = new init ConfigChangeListener (includes new init of DB)
    // = new init BatteryChecker
    // = new init ConnectionChecker
    try {
        await Promise.all([
            batteryChecker_1.default.initBatteryChecker(adapter),
            connectionChecker_1.default.initConnectionChecker(adapter),
        ]);
    }
    catch (error) {
        return `unknown error while init connection or battery checker: ${error}`;
    }
    // ==== result
    // return result
    return 'ok';
};
exports.statesConfigUpload = statesConfigUpload;
//# sourceMappingURL=ConfigUploader.js.map