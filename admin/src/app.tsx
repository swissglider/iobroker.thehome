import React from 'react';
import { Theme, withStyles } from '@material-ui/core/styles';

import GenericApp from '@iobroker/adapter-react/GenericApp';
import Settings from './components/settings';
import { GenericAppProps, GenericAppSettings } from '@iobroker/adapter-react/types';
import { StyleRules } from '@material-ui/core/styles';
import YAML from 'yaml';

const styles = (_theme: Theme): StyleRules => ({
	root: {},
});

class App extends GenericApp {
	constructor(props: GenericAppProps) {
		const extendedProps: GenericAppSettings = {
			...props,
			encryptedFields: [],
			translations: {
				en: require('./i18n/en.json'),
				de: require('./i18n/de.json'),
				ru: require('./i18n/ru.json'),
				pt: require('./i18n/pt.json'),
				nl: require('./i18n/nl.json'),
				fr: require('./i18n/fr.json'),
				it: require('./i18n/it.json'),
				es: require('./i18n/es.json'),
				pl: require('./i18n/pl.json'),
				'zh-cn': require('./i18n/zh-cn.json'),
			},
		};
		super(props, extendedProps);
	}

	onConnectionReady(): void {
		// executed when connection is ready
	}

	getConfiguration(type: 'json' | 'yaml'): void {
		this.socket
			.sendTo('thehome.0', 'ConfigAdapter:configDownload', { type: type })
			.then((result: ioBroker.Message | undefined) => {
				const a = document.createElement('a');
				if (typeof result == 'string') {
					switch (type) {
						case 'json':
							const blob1 = new Blob([result], { type: 'application/json' });
							a.download = 'BackupConfig.json';
							a.href = URL.createObjectURL(blob1);
							break;
						case 'yaml':
							const blob2 = new Blob([YAML.stringify(JSON.parse(result))], {
								type: 'application/x-yaml',
							});
							a.download = 'BackupConfig.yaml';
							a.href = URL.createObjectURL(blob2);
							break;
					}
				}
				a.addEventListener('click', () => {
					setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
				});
				a.click();
			});
	}

	onChangeHandler(event): void {
		const GetFile = new FileReader();
		const type = event.target.files[0].type;
		const socket = this.socket;
		GetFile.onload = function () {
			// DO Somthing
			let config: any;
			if (typeof GetFile.result === 'string') {
				switch (type) {
					case 'application/x-yaml':
						config = YAML.parse(GetFile.result);
						break;
					case 'application/json':
						config = JSON.parse(GetFile.result);
						break;
					default:
						return;
				}
				socket
					.sendTo('thehome.0', 'ConfigAdapter:configUpload', { type: type, config: config })
					.then((result: ioBroker.Message | undefined) => {
						console.log(result);
					});
			}
		};
		GetFile.readAsText(event.target.files[0]);
	}

	render() {
		if (!this.state.loaded) {
			return super.render();
		}
		return (
			<div className="App">
				<div>Hallo Guido1</div>
				<button onClick={() => this.getConfiguration('json')}>Download Configuration as JSON</button>
				<button onClick={() => this.getConfiguration('yaml')}>Download Configuration as YAML</button>
				<div>
					<input type="file" name="file" onChange={(e) => this.onChangeHandler(e)} />
				</div>
				<Settings native={this.state.native} onChange={(attr, value) => this.updateNativeValue(attr, value)} />
				{this.renderError()}
				{this.renderToast()}
				{this.renderSaveCloseButtons()}
			</div>
		);
	}
}

export default withStyles(styles)(App);
