import { statesConfigDownload } from './ConfigDownloader';
import { statesConfigUpload } from './ConfigUploader';
import { singleStateConfigUpload } from './SingleUploader';

const ConfigAdapterUseCases = {
	statesConfigDownload: statesConfigDownload,
	statesConfigUpload: statesConfigUpload,
	singleStateConfigUpload: singleStateConfigUpload,
};

export default ConfigAdapterUseCases;
