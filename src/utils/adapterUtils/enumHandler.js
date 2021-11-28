"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var chechAndCreateIfNeededNewEnum = function (adapter, enumID, enumName, enumIcon, enumDescription, enumColor) { return __awaiter(void 0, void 0, void 0, function () {
    var enumObject;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(adapter && enumID)) return [3 /*break*/, 2];
                enumObject = {};
                enumObject.type = 'enum';
                enumObject.common = {};
                enumObject.common.name = enumName ? enumName : enumID.substr(enumID.lastIndexOf('.') + 1);
                enumObject.common.enabled = true;
                if (enumColor)
                    enumObject.common.color = enumColor;
                if (enumDescription)
                    enumObject.common.desc = enumDescription;
                if (enumIcon)
                    enumObject.common.icon = enumIcon;
                enumObject.common.members = [];
                enumObject.natice = {};
                enumObject._id = enumID;
                enumObject.from = 'system.adapter.admin.0';
                enumObject.user = 'system.user.admin';
                delete enumObject.enums;
                return [4 /*yield*/, adapter.setForeignObjectNotExistsAsync(enumID, enumObject)];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); };
var addStateIDToEnum = function (_adapter, enumID, stateID) { return __awaiter(void 0, void 0, void 0, function () {
    var en;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, _adapter.getForeignObjectAsync(enumID, 'enum')];
            case 1:
                en = _a.sent();
                if (!(en && en.common.members && !en.common.members.includes(stateID))) return [3 /*break*/, 3];
                en.common.members.push(stateID);
                delete en.enums;
                return [4 /*yield*/, _adapter.setForeignObjectAsync(enumID, en)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Creates and returns an array of ioBroker.Objects with all states that contains function and/or room enums
 * @param adapter adapter Object
 * @param mandatoryEnums 0 = functions + rooms mandatory / 1 = function mandatory / 2 = rooms mandatory / 3 = rooms or functions
 * @returns
 */
var getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject = function (adapter, mandatoryEnums) {
    if (mandatoryEnums === void 0) { mandatoryEnums = 3; }
    return __awaiter(void 0, void 0, void 0, function () {
        var allStates, filteredStates;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, adapter.getForeignObjectsAsync('*', 'state', ['rooms', 'functions'])];
                case 1:
                    allStates = _a.sent();
                    filteredStates = Object.values(allStates).filter(function (state) {
                        var mainFilter = state.enums && Object.keys(state.enums).length > 0;
                        var mandatoryEnumFilter = mandatoryEnums == 0
                            ? state.enums &&
                                Object.keys(state.enums).some(function (e) { return e.startsWith('enum.rooms.'); }) &&
                                Object.keys(state.enums).some(function (e) { return e.startsWith('enum.functions.'); })
                            : mandatoryEnums == 1
                                ? state.enums && Object.keys(state.enums).some(function (e) { return e.startsWith('enum.functions.'); })
                                : mandatoryEnums == 2
                                    ? state.enums && Object.keys(state.enums).some(function (e) { return e.startsWith('enum.rooms.'); })
                                    : mandatoryEnums == 3
                                        ? state.enums &&
                                            (Object.keys(state.enums).some(function (e) { return e.startsWith('enum.rooms.'); }) ||
                                                Object.keys(state.enums).some(function (e) { return e.startsWith('enum.functions.'); }))
                                        : false;
                        return mainFilter && mandatoryEnumFilter;
                    });
                    return [2 /*return*/, filteredStates];
            }
        });
    });
};
var removeStateFromAllRoomFunctionEnums = function (adapter, stateID) { return __awaiter(void 0, void 0, void 0, function () {
    var stateObjects, stateObject, _i, _a, enumID, en, members;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, adapter.getForeignObjectsAsync(stateID, 'state', ['rooms', 'functions'])];
            case 1:
                stateObjects = _b.sent();
                stateObject = Object.values(stateObjects)[0];
                if (!(stateObject && stateObject.enums)) return [3 /*break*/, 6];
                _i = 0, _a = Object.keys(stateObject.enums);
                _b.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 6];
                enumID = _a[_i];
                if (!(enumID.startsWith('enum.rooms.') || enumID.startsWith('enum.functions.'))) return [3 /*break*/, 5];
                return [4 /*yield*/, adapter.getForeignObjectAsync(enumID, 'enum')];
            case 3:
                en = _b.sent();
                if (!(en && en.common.members)) return [3 /*break*/, 5];
                members = en.common.members.filter(function (e) { return e !== stateObject._id; });
                en.common.members = members;
                delete en.enums;
                return [4 /*yield*/, adapter.setForeignObjectAsync(enumID, en)];
            case 4:
                _b.sent();
                _b.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 2];
            case 6: return [2 /*return*/];
        }
    });
}); };
var removeAllStatesFromAllRoomFunctionEnums = function (adapter) { return __awaiter(void 0, void 0, void 0, function () {
    var stateObjects, _i, stateObjects_1, stateObject;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject(adapter)];
            case 1:
                stateObjects = _a.sent();
                _i = 0, stateObjects_1 = stateObjects;
                _a.label = 2;
            case 2:
                if (!(_i < stateObjects_1.length)) return [3 /*break*/, 5];
                stateObject = stateObjects_1[_i];
                return [4 /*yield*/, removeStateFromAllRoomFunctionEnums(adapter, stateObject._id)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/];
        }
    });
}); };
var addStateToEnums = function (adapter, stateConfig) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(stateConfig.stateID && stateConfig.functions)) return [3 /*break*/, 3];
                // check and create if needed new enum
                return [4 /*yield*/, chechAndCreateIfNeededNewEnum(adapter, stateConfig.functions)];
            case 1:
                // check and create if needed new enum
                _a.sent();
                // add state to function enum from config
                return [4 /*yield*/, addStateIDToEnum(adapter, stateConfig.functions, stateConfig.stateID)];
            case 2:
                // add state to function enum from config
                _a.sent();
                _a.label = 3;
            case 3:
                if (!(stateConfig.stateID && stateConfig.rooms)) return [3 /*break*/, 6];
                // check and create if needed new enum
                return [4 /*yield*/, chechAndCreateIfNeededNewEnum(adapter, stateConfig.rooms)];
            case 4:
                // check and create if needed new enum
                _a.sent();
                // add state to room enum from config
                return [4 /*yield*/, addStateIDToEnum(adapter, stateConfig.rooms, stateConfig.stateID)];
            case 5:
                // add state to room enum from config
                _a.sent();
                _a.label = 6;
            case 6: return [2 /*return*/];
        }
    });
}); };
var addAllStatesToEnums = function (adapter, config) { return __awaiter(void 0, void 0, void 0, function () {
    var _i, config_1, stateConfig;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _i = 0, config_1 = config;
                _a.label = 1;
            case 1:
                if (!(_i < config_1.length)) return [3 /*break*/, 4];
                stateConfig = config_1[_i];
                return [4 /*yield*/, addStateToEnums(adapter, stateConfig)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); };
var EnumHandler = {
    getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject: getAllStatesWithFunctionAndOrRoomEnumsAsIoBObject,
    removeStateFromAllRoomFunctionEnums: removeStateFromAllRoomFunctionEnums,
    removeAllStatesFromAllRoomFunctionEnums: removeAllStatesFromAllRoomFunctionEnums,
    addStateToEnums: addStateToEnums,
    chechAndCreateIfNeededNewEnum: chechAndCreateIfNeededNewEnum,
    addStateIDToEnum: addStateIDToEnum,
    addAllStatesToEnums: addAllStatesToEnums
};
exports["default"] = EnumHandler;
