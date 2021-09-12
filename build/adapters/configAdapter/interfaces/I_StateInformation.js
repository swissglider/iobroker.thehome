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
Object.defineProperty(exports, "__esModule", { value: true });
exports.stateInformations = exports.stateInformation = void 0;
const pipeable_1 = require("fp-ts/lib/pipeable");
const D = __importStar(require("io-ts/Decoder"));
exports.stateInformation = (0, pipeable_1.pipe)(D.type({
    stateID: D.string,
    stateName: D.string,
    store2DB: D.boolean,
}), D.intersect(D.partial({
    functions: D.string,
    rooms: D.string,
})));
exports.stateInformations = D.array(exports.stateInformation);
//# sourceMappingURL=I_StateInformation.js.map