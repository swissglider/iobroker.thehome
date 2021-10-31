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
exports.singleStateConfigUpload = void 0;
const E = __importStar(require("fp-ts/Either"));
const batteryChecker_1 = __importDefault(require("../../../checker/batteryChecker"));
const connectionChecker_1 = __importDefault(require("../../../checker/connectionChecker"));
const enumHandler_1 = __importDefault(require("../../../utils/adapterUtils/enumHandler"));
const ioBrokerObjectHanlder_Name_Custom_1 = __importDefault(require("../../../utils/adapterUtils/ioBrokerObjectHanlder_Name_Custom"));
const I_StateInformation_1 = require("../interfaces/I_StateInformation");
const singleStateConfigUpload = async (adapter, stateConfig) => {
    // check config
    const decodedConfig = I_StateInformation_1.stateInformation.decode(stateConfig);
    if (E.isLeft(decodedConfig))
        return 'Wrong configuration, please check the input !';
    // ==== pre work
    // = stop Battery Checker
    // = stop Connection Checker
    // = remove state from all function and room enum
    try {
        await Promise.all([
            batteryChecker_1.default.stopBatteryChecker(),
            connectionChecker_1.default.stopConnectionChecker(),
            enumHandler_1.default.removeStateFromAllRoomFunctionEnums(adapter, stateConfig.stateID),
        ]);
    }
    catch (error) {
        return `unknown error while stopping connection or battery checker / deleting all enums with state: ${error}`;
    }
    // ==== set new config
    // = add state To Enums
    try {
        await enumHandler_1.default.addStateToEnums(adapter, stateConfig);
    }
    catch (error) {
        return `unknown error while adding the state to the enums: ${error}`;
    }
    // = change name and store2DB on Object
    try {
        await ioBrokerObjectHanlder_Name_Custom_1.default.changeStateNameAndInfluxCustom(adapter, stateConfig);
    }
    catch (error) {
        return `unknown error while setting config name or store2DB: ${error}`;
    }
    // ==== set new config
    // = new init BatteryChecker
    // = new init ConnectionChecker
    try {
        await Promise.all([batteryChecker_1.default.initBatteryChecker(), connectionChecker_1.default.initConnectionChecker()]);
    }
    catch (error) {
        return `unknown error while init connection or battery checker: ${error}`;
    }
    // ==== result
    // return result
    return 'ok';
};
exports.singleStateConfigUpload = singleStateConfigUpload;
//# sourceMappingURL=SingleUploader.js.map