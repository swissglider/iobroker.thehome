"use strict";
exports.__esModule = true;
exports.stateInformations = exports.stateInformation = void 0;
var pipeable_1 = require("fp-ts/lib/pipeable");
var D = require("io-ts/Decoder");
exports.stateInformation = (0, pipeable_1.pipe)(D.type({
    stateID: D.string,
    stateName: D.string,
    store2DB: D.boolean
}), D.intersect(D.partial({
    functions: D.string,
    rooms: D.string
})));
exports.stateInformations = D.array(exports.stateInformation);
