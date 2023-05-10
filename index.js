const https = require('https');
const TelegramBot = require('node-telegram-bot-api');
const {startOption} = require('./config/bot_options')
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config/config.json', 'utf8'));
const UserModel = require('./database/db_models')
const sequelize = require('./database/db_config')
let favoriteCrypto = false;
let deleteCrypto = false;
const bot = new TelegramBot(config.telegramBotToken, {polling: true});
const start = async () => {
     await bot.setMyCommands([
        {command: '/start', description: 'Hi! I crypto currency bot!'},
        {command: '/add_favorite', description: 'Add favorite coin'},
        {command: '/show_favorite', description: 'Show favorite coins'},
        {command: '/delete_favorite', description: 'Delete your favorite coin'},
        {command: '/info', description: 'Info'}]
    )
    try {
        await sequelize.authenticate();
        await sequelize.sync();
    } catch (e) {
        console.log("DataBase auth error" + e);
    }
}

bot.onText(/\/add_favorite/, (msg) => {
    const chatId = msg.chat.id;
    favoriteCrypto = true;
    bot.sendMessage(chatId, 'Write the cryptocurrency you want to add:');
});
bot.onText(/\/delete_favorite/, (msg) => {
    const chatId = msg.chat.id;
    deleteCrypto = true;
    bot.sendMessage(chatId, 'Write the cryptocurrency you want to delete:');
})

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    try {
        if (text === '/start') {
            await UserModel.create({chatId});
            await bot.sendMessage(chatId, `Welcome! ${msg.chat.first_name}`, startOption)
        }
        if (text === '/info') {
            await bot.sendMessage(chatId, 'If you want ')
        }
        if (favoriteCrypto) {
            const crypto = msg.text;
            let favorites = [];

            await UserModel.findOne({chatId})
                .then(async (foundUser) => {
                    if (crypto.length !== 3) {
                        bot.sendMessage(chatId, 'Error! Please write correctly');
                    } else {
                        if (foundUser.favorite && foundUser.favorite.length > 0) {
                            favorites = JSON.parse(foundUser.favorite);
                        }
                        if (!favorites.includes(crypto)) {
                            favorites.push(crypto);
                            await foundUser.update({favorite: JSON.stringify(favorites)});
                            console.log(`${chatId} added ${crypto}`);
                            bot.sendMessage(chatId, `You added ${crypto}`);
                        } else {
                            bot.sendMessage(chatId,`This coin ${crypto} has already been added `)
                        }
                    }
                });
            favoriteCrypto = false;
        }

        if (deleteCrypto) {
            let favorites = [];
            const crypto = msg.text;
            await UserModel.findOne({chatId})
                .then(async (foundUser) => {
                    if (crypto.length !== 3) {
                        bot.sendMessage(chatId, 'Error! Please write correctly');
                    } else {
                        if (foundUser.favorite && foundUser.favorite.length > 0) {
                            favorites = JSON.parse(foundUser.favorite);
                        }
                        if (favorites.includes(crypto)) {
                            favorites = favorites.filter(favCrypto => favCrypto !== crypto);
                            await foundUser.update({favorite: JSON.stringify(favorites)});
                            console.log(`${chatId} remove ${crypto}`);
                            bot.sendMessage(chatId, `You removed ${crypto}`);
                        } else {
                            console.log('This coin is not in your favorites');
                        }
                    }
                });
            deleteCrypto = false;
        }

        if (text === '/show_favorite') {
            const foundUser = await UserModel.findOne({chatId});
            if (foundUser && foundUser.favorite) {
                const favorites = JSON.parse(foundUser.favorite);
                const buttons = favorites.map(favorite => {
                    return [{
                        text: favorite,
                        callback_data: `${favorite}`
                    }]
                });
                const keyboard = {
                    inline_keyboard: buttons
                };
                bot.sendMessage(chatId, `Your favorite list:`, {reply_markup: keyboard})
            }
        }
    } catch (e) {
        console.error(`DataBase error ${e}`)
    }
});

bot.on('callback_query', async msg => {
    const dataInfo = msg.data;
    const chatId = msg.message.chat.id;

    let options = {
        "method": "GET",
        "hostname": "rest.coinapi.io",
        "path": `/v1/exchangerate/${dataInfo.toUpperCase()}/USD`,
        "headers": {'X-CoinAPI-Key': `${config.coinAPIKey}`}
    };

    let request = https.request(options, function (response) {
        let chunks = [];
        response.on("data", function (chunk) {
            chunks.push(chunk);
        });

        response.on("end", function () {
            let body = Buffer.concat(chunks);
            let data = JSON.parse(body);
            if (data.rate !== undefined) {
                let rate = data.rate.toFixed(2);
                bot.sendMessage(chatId, `Currency ${dataInfo}/USD: ${rate}`);
            } else {
                console.error("Error in callback")
            }

        });
        response.on("error", function (error) {
            console.error(error);
        });
    });
    request.end();
})


start()
