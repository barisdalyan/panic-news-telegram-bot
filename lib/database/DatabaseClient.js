import { MongoClient } from 'mongodb';
import { DateTime } from '../date/DateTime.js';

export class DatabaseClient {
	#uri;
	#dbName;
	#collectionName;

	constructor(uri, dbName, collectionName) {
		this.#uri = uri;
		this.#dbName = dbName;
		this.#collectionName = collectionName;
	}

	get databaseName() {
		return this.#dbName;
	}
	
	set databaseName(dbName) {
		this.#dbName = dbName;
	}
	
	get databaseCollectionName() {
		return this.#collectionName;
	}
	
	set databaseCollectionName(collectionName) {
		this.#collectionName = collectionName;
	}

	async #connectDb() {
		try {
			const client = new MongoClient(this.#uri);
			const time = new DateTime();
			const currentTime = await time.getDateTime();
			console.log(`Connected to database at: ${currentTime}`);
			return client;
		} catch (error) {
			console.error(error);
		}
	}

	async #disconnectDb(client) {
		try {
			await client.close();
			const time = new DateTime();
			const currentTime = await time.getDateTime();
			console.log(`Database connection is closed at: ${currentTime}`);
		} catch (error) {
			console.error(error);
		}
	}

	async checkDocument(filter) {
		try {
			const result = await this.getDocument(filter);
			return result !== null;
		} catch (error) {
			console.error(error);
		}
	}

	async addDocument(filter, document) {
		const isMatched = await this.checkDocument(filter);
		if (isMatched) {
			await this.updateDocument(filter, document);
		} else {
			let currentTime, client = await this.#connectDb();
			try {
				const database = client.db(this.#dbName);
				const collection = database.collection(this.#collectionName);
				const time = new DateTime();
				currentTime = await time.getDateTime();
				document.createdAt = currentTime;
				await collection.insertOne(document);
				console.log(`Document successfully saved at: ${currentTime}`);
			} catch (error) {
				console.error(error);
			} finally {
				await this.#disconnectDb(client);
			}
		}
	}

	async getDocument(filter) {
		const client = await this.#connectDb();
		try {
			const database = client.db(this.#dbName);
			const collection = database.collection(this.#collectionName);
			const time = new DateTime();
			const currentTime = await time.getDateTime();
			console.log(`Document is successfully fetched at: ${currentTime}`);
			return await collection.findOne(filter);
		} catch (error) {
			console.error(error);
		} finally {
			await this.#disconnectDb(client);
		}
	}

	async updateDocument(filter, dbDocument) {
		const client = await this.#connectDb();
		try {
			const database = client.db(this.#dbName);
			const collection = database.collection(this.#collectionName);
			const time = new DateTime();
			const currentTime = await time.getDateTime();
			dbDocument.updatedAt = currentTime;
			const updateDocument = {
				$set: dbDocument
			};
			await collection.updateOne(filter, updateDocument);
			console.log(`Document is successfully updated at: ${currentTime}`);
		} catch (error) {
			console.error(error);
		} finally {
			await this.#disconnectDb(client);
		}
	}

	async deleteDocument(filter) {
		const client = await this.#connectDb();
		try {
			const database = client.db(this.#dbName);
			const collection = database.collection(this.#collectionName);
			const time = new DateTime();
			const currentTime = await time.getDateTime();
			console.log(`Document is successfully deleted at: ${currentTime}`);
			return await collection.deleteOne(filter);
		} catch (error) {
			console.error(error);
		} finally {
			await this.#disconnectDb(client);
		}
	}
}