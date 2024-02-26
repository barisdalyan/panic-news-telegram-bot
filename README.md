
# Panic News Telegram Bot

The bot broadcasts noteworthy cryptocurrency market news to users on the Telegram platform daily, using the [CryptoPanic](https://cryptopanic.com/) API. It removes the news from the previous day after the daily close time to save storage.

## How to use

- Clone the repository and fill in the relevant places in the `.env` file.

```
TELEGRAM_TOKEN=
CRYPTOPANIC_API_KEY=
TELEGRAM_CHAT_ID=
MONGO_INITDB_ROOT_USERNAME=
MONGO_INITDB_ROOT_PASSWORD=
```

- Use same values for environment variables in `docker-compose.yml` file.

```
environment:
      MONGO_INITDB_ROOT_USERNAME:
      MONGO_INITDB_ROOT_PASSWORD:
```

- Run the following command:

```
docker-compose up
```

## Screenshot

<p  align="left">

<img src="screenshot/panic-news-channel.jpeg" alt="Panic News Telegram channel" height= "600" width="300">

</p>

## License

This project is released under the MIT License.
