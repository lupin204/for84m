const TelegramBot = require('node-telegram-bot-api');
const Moment = require('moment');
require('dotenv').config();


// replace the value below with the Telegram token you receive from @BotFather
// coinbox_testbot
const token = process.env.TELEGRAM_TOKEN;
//const token = process.env.TELEGRAM_TOKEN_TEST;

// test channel
const channedId_lupin204 = '@lupin204';   // mybitlocal
// usdt channel
const channedId_lupin204usdt = '@lupin204usdt';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const reqMsg = msg.text.toString().toLowerCase();

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, '[Echo] ' + msg.text);


});

module.exports = {
    'telegrambot' : bot,
    'channedId_lupin204' : channedId_lupin204,
    'channedId_lupin204usdt' : channedId_lupin204usdt
}