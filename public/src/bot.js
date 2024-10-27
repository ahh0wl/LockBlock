const { Telegraf } = require('telegraf');
const token = '****';
const bot = new Telegraf(token);

const url = 'https://finer-colt-tolerant.ngrok-free.app'; // Ensure this URL is correct and reachable
//bot.telegram.setWebhook(`${url}`);

/*bot.use((ctx, next) => {
  const messageTimestamp = ctx.message.date * 1000; // Get message timestamp in milliseconds
  const lastActivation = Date.now(); // Get current time as bot activation time

  if (messageTimestamp && messageTimestamp < lastActivation) {
    console.log('Ignoring message sent before bot activation.');
    return; // Skip processing message sent before bot activation
  }

  return next();r
});*/

// Commands
bot.start((ctx) => {
  ctx.reply('Hello, Welcome to LockBlock!\nLockBlock is a platform game where everybody can add new elements to the level, making it infinite!');
});

bot.help((ctx) => {
  ctx.reply('these is the list of commands:\n /playlink - allows you to play in a browser\n /playapp - allows you to play integrated with telegram (only mobile)');
});

bot.command('playlink', (ctx) => {
  const gameUrl = url;
  ctx.reply(`Click to play: [Play Game on Browser](${gameUrl})`, { parse_mode: 'MarkdownV2' });
});

bot.command('play', (ctx) => {
    ctx.reply("Click and start playing!",{
      reply_markup: {
        remove_keyboard : true,
        inline_keyboard: [[{text: "Play!", web_app: {url: url}}]],
      },
    });
});

// Start the bot
bot.launch();

// Export the bot instance
//module.exports = { bot };
