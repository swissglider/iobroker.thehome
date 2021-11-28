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
exports.translateText = exports.isArray = exports.isObject = void 0;
var axios_1 = require("axios");
/**
 * Tests whether the given variable is a real object and not an Array
 * @param it The variable to test
 */
function isObject(it) {
    // This is necessary because:
    // typeof null === 'object'
    // typeof [] === 'object'
    // [] instanceof Object === true
    return Object.prototype.toString.call(it) === '[object Object]';
}
exports.isObject = isObject;
/**
 * Tests whether the given variable is really an Array
 * @param it The variable to test
 */
function isArray(it) {
    if (Array.isArray != null)
        return Array.isArray(it);
    return Object.prototype.toString.call(it) === '[object Array]';
}
exports.isArray = isArray;
/**
 * Translates text using the Google Translate API
 * @param text The text to translate
 * @param targetLang The target languate
 * @param yandexApiKey The yandex API key. You can create one for free at https://translate.yandex.com/developers
 */
function translateText(text, targetLang, yandexApiKey) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (targetLang === 'en') {
                return [2 /*return*/, text];
            }
            else if (!text) {
                return [2 /*return*/, ''];
            }
            if (yandexApiKey) {
                return [2 /*return*/, translateYandex(text, targetLang, yandexApiKey)];
            }
            else {
                return [2 /*return*/, translateGoogle(text, targetLang)];
            }
            return [2 /*return*/];
        });
    });
}
exports.translateText = translateText;
/**
 * Translates text with Yandex API
 * @param text The text to translate
 * @param targetLang The target languate
 * @param apiKey The yandex API key. You can create one for free at https://translate.yandex.com/developers
 */
function translateYandex(text, targetLang, apiKey) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var url, response, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (targetLang === 'zh-cn') {
                        targetLang = 'zh';
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    url = "https://translate.yandex.net/api/v1.5/tr.json/translate?key=" + apiKey + "&text=" + encodeURIComponent(text) + "&lang=en-" + targetLang;
                    return [4 /*yield*/, (0, axios_1["default"])({ url: url, timeout: 15000 })];
                case 2:
                    response = _b.sent();
                    if (isArray((_a = response.data) === null || _a === void 0 ? void 0 : _a.text)) {
                        return [2 /*return*/, response.data.text[0]];
                    }
                    throw new Error('Invalid response for translate request');
                case 3:
                    e_1 = _b.sent();
                    throw new Error("Could not translate to \"" + targetLang + "\": " + e_1);
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Translates text with Google API
 * @param text The text to translate
 * @param targetLang The target languate
 */
function translateGoogle(text, targetLang) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var url, response, e_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    url = "http://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=" + targetLang + "&dt=t&q=" + encodeURIComponent(text) + "&ie=UTF-8&oe=UTF-8";
                    return [4 /*yield*/, (0, axios_1["default"])({ url: url, timeout: 15000 })];
                case 1:
                    response = _b.sent();
                    if (isArray(response.data)) {
                        // we got a valid response
                        return [2 /*return*/, response.data[0][0][0]];
                    }
                    throw new Error('Invalid response for translate request');
                case 2:
                    e_2 = _b.sent();
                    if (((_a = e_2.response) === null || _a === void 0 ? void 0 : _a.status) === 429) {
                        throw new Error("Could not translate to \"" + targetLang + "\": Rate-limited by Google Translate");
                    }
                    else {
                        throw new Error("Could not translate to \"" + targetLang + "\": " + e_2);
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
