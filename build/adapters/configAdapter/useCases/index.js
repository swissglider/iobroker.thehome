"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConfigDownloader_1 = require("./ConfigDownloader");
const ConfigUploader_1 = require("./ConfigUploader");
const SingleUploader_1 = require("./SingleUploader");
const ConfigAdapterUseCases = {
    statesConfigDownload: ConfigDownloader_1.statesConfigDownload,
    statesConfigUpload: ConfigUploader_1.statesConfigUpload,
    singleStateConfigUpload: SingleUploader_1.singleStateConfigUpload,
};
exports.default = ConfigAdapterUseCases;
//# sourceMappingURL=index.js.map