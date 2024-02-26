import axios from 'axios';
import axiosRetry from 'axios-retry';
import { DateTime } from '../date/DateTime.js';
import HttpsProxyAgent from 'https-proxy-agent';
import AbortController from 'abort-controller';

export class FetchData {
	constructor() {}

	async getOverProxy(url, proxyConfig, timeout) {
		const startTime = await new DateTime().getUnixtime();
		const httpsAgent = new HttpsProxyAgent({
			host: proxyConfig.host,
			port: proxyConfig.port,
			auth: proxyConfig.username + ':' + proxyConfig.password
		});
		const controller = new AbortController();
		try {
			setTimeout(() => {
				controller.abort();
			}, timeout);
			const response = await axios.get(url, { httpsAgent, signal: controller.signal });
			const endTime = await new DateTime().getUnixtime();
			console.log('---> Fetch Func Elapsed Time: ' + (endTime - startTime));
			return response;
		} catch (error) {
			console.error(error);
		}
	}

	async get(url) {
		const startTime = await new DateTime().getUnixtime();
		try {
			axiosRetry(axios, { retries: 3 });
			const response = await axios.get(url);
			const endTime = await new DateTime().getUnixtime();
			console.log('---> Fetch Func Elapsed Time: ' + (endTime - startTime));
			return response;
		} catch (error) {
			const currentTime = await new DateTime().getDateTime();
			console.error('\nError Code: ' + error.code + '\nError Message: ' +
                error.message + '\nDate-Time: ' + currentTime);
		}
	}
}