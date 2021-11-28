"use strict";
exports.__esModule = true;
var ConfigDownloader_1 = require("./ConfigDownloader");
var ConfigUploader_1 = require("./ConfigUploader");
var SingleUploader_1 = require("./SingleUploader");
var ConfigAdapterUseCases = {
    statesConfigDownload: ConfigDownloader_1.statesConfigDownload,
    statesConfigUpload: ConfigUploader_1.statesConfigUpload,
    singleStateConfigUpload: SingleUploader_1.singleStateConfigUpload
};
exports["default"] = ConfigAdapterUseCases;
