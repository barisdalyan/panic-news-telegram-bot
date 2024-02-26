import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';
import * as dotenv from 'dotenv';
import {DatabaseClient} from './lib/database/DatabaseClient.js';
import {DateTime} from './lib/date/DateTime.js';
import {FetchData} from './lib/fetch/FetchData.js';

dotenv.config();

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const CRYPTOPANIC_API_KEY = process.env.CRYPTOPANIC_API_KEY;
const MONGO_USERNAME = encodeURIComponent(process.env.MONGO_INITDB_ROOT_USERNAME);
const MONGO_PASSWORD = encodeURIComponent(process.env.MONGO_INITDB_ROOT_PASSWORD);
const MONGO_URI = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@mongodb:27017/?authMechanism=DEFAULT`;
const bot = new TelegramBot(TELEGRAM_TOKEN, {polling: false});
const fetch = new FetchData();
const newsDbClient = new DatabaseClient(MONGO_URI, 'panicnewsdb', 'cryptoNews');
const dateTime = new DateTime();

async function sendMessage(news) {
	try {
		const sourceDomain = news.domain;
		const sourceUrl = news.url;
		const urlMessage = '<a href ="' + sourceUrl + '">' + '[' + sourceDomain + ']' + '</a>';
		await bot.sendMessage(TELEGRAM_CHAT_ID, urlMessage, {'parse_mode': 'HTML', 'disable_web_page_preview': false});	
	} catch (error) {
		console.error(error);
	}
}

async function getDailyCloseTime() {
	const currentTime = await dateTime.getUnixtime(), DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;
	return currentTime - (currentTime % DAY_IN_MILLISECONDS);
}

async function collectDailyNews(newsUrl) {
	try {
		const newsCollection = [];
		const dailyCloseTime = await getDailyCloseTime();
		let newsDate;
	
		while (newsUrl !== null) {
			let newsObj;
			newsObj = await fetch.get(newsUrl);
			newsUrl = newsObj.data.next;
			const results = newsObj.data.results;
		
			for (const element of results) {
				newsDate = element.created_at;
				newsDate = await dateTime.convertToUnixTimestamp(newsDate);
	
				if (newsDate >= dailyCloseTime) {
					newsCollection.push(element);
				} else {
					break;
				}
			}
			await dateTime.sleep(1000);
		}
		return newsCollection;
	} catch (error) {
		console.error(error);
	}
}

function checkDifferentNews(tempNewsArray, newsArray) {
	const lastNews = [];
	let isDifferentNews = false;

	for (const tempNews of tempNewsArray) {
		for (const news of newsArray) {
			if (news.title.trim() === tempNews.title.trim()) {
				isDifferentNews = false;
				break;
			} else {
				isDifferentNews = true;
			}
		}
		if (isDifferentNews) {
			lastNews.push(tempNews);
		}
	}
	return lastNews;
}

async function deleteNewsHistory() {
	await newsDbClient.deleteDocument({keyword: 'news-history'});
}

async function startNewsBot() {
	try {
		const start = await dateTime.getUnixtime();
		const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${CRYPTOPANIC_API_KEY}` +
			'&public=true&kind=news&filter=rising&regions=en';
		const newsObject = await newsDbClient.getDocument({keyword: 'news-history'});
		const tempNewsArray = await collectDailyNews(url);
	
		if (newsObject !== null) {
			const lastNews = checkDifferentNews(tempNewsArray, newsObject.data);
			if (lastNews !== undefined) {
				await newsDbClient.addDocument(
					{keyword: 'news-history'},
					{
						keyword: 'news-history',
						data: tempNewsArray
					});
					
				for (const news of lastNews) {
					await sendMessage(news);
					await dateTime.sleep(1000);
				}
			}
		} else {
			await newsDbClient.addDocument(
				{keyword: 'news-history'},
				{
					keyword: 'news-history',
					data: tempNewsArray
				});
		}
		const finish = await dateTime.getUnixtime();
		const elapsedTime = ((finish - start) / 60000).toFixed(2);
		console.log(`Total elapsed time: ${elapsedTime}m.`);
	} catch (error) {
		console.error(error);
	}
}

const signalFor1M = cron.schedule('0 */1 * * * *', async () => {
	await startNewsBot();
}, {
	scheduled: false,
	timezone: 'Europe/London'
});
const signalFor1D = cron.schedule('0 * * */1 * *', async () => {
	await deleteNewsHistory();
}, {
	scheduled: false,
	timezone: 'Europe/London'
});

signalFor1M.start();
signalFor1D.start();