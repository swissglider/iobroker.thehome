import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorkerRegistration';

console.log(process.env.NODE_ENV)

ReactDOM.render(
	<React.StrictMode>
		{/* <App adapterName="thehome" socket={{ port: 8082 }} /> */
			<App adapterName="thehome" socket={{ port: 8082 }} />}
	</React.StrictMode>,
	document.getElementById('root'),
);

serviceWorker.register();
