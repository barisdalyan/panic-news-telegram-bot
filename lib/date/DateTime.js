export class DateTime {
	constructor() {}

	getUnixtime() {
		return Promise.resolve(new Date().getTime());
	}

	getDateTime() {
		return Promise.resolve(new Date());
	}

	getLocalDateTime() {
		return Promise.resolve(new Date().toLocaleString());
	}

	convertUnixTimestampToLocal(value) {
		return Promise.resolve(new Date(value).toLocaleString());
	}

	convertToUnixTimestamp(time) {
		return Promise.resolve(new Date(time).getTime());
	}

	sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}