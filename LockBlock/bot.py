from typing import Final
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

TOKEN: Final  = '7228557091:AAHO9jcu6wAgezrmm7UflyYgWrB8q2haujM'
BOT_USERNAME: Final = '@lock_block_bot'
GAME_SHORT_NAME: Final = 'lockblockgame'

#Commands

async def start_command(update: Update, context : ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text('hello!')

async def help_command(update: Update, context : ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text('cant help')

async def play_command(update: Update, context : ContextTypes.DEFAULT_TYPE):
    url ='http://10.18.240.4/lockblock/Game.html'
    await update.message.reply_text(f'Click to play: [Play Game]({url})', parse_mode='MarkdownV2')
#Responses

def handle_response(text: str) -> str:
    processed: str = text.lower()
    if 'hello' in processed:
        return 'hi' 
    return 'response not handled'

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    message_type: str = update.message.chat.type
    text: str = update.message.text
    response: str = ''
    print(f'User ({update.message.chat.id}) in {message_type}: "{text}"')

    #message_type is the type of chat, so private or group
    if (message_type == 'group' or message_type == 'supergroup'):
        if BOT_USERNAME in text:
            new_text: str = text.replace(BOT_USERNAME, '').strip()
            response = handle_response(new_text)
    else:
        response = handle_response(text)
    
    if response:
        print('Bot:', response)
        await update.message.reply_text(response)

#Errors

async def errors(update: Update, context: ContextTypes.DEFAULT_TYPE):
    print(f'Update {update} caused error {context.error}')

if __name__ == '__main__':
    print('starting bot...')
    app = Application.builder().token(TOKEN).build()

    #Commands
    app.add_handler(CommandHandler('start', start_command))
    app.add_handler(CommandHandler('help', help_command))
    app.add_handler(CommandHandler('play', play_command))

    #Messages
    app.add_handler(MessageHandler(filters.TEXT, handle_message))

    #Errors
    app.add_error_handler(errors)

    #Polls the bot (check for messages)
    print('polling...')
    app.run_polling(poll_interval=3)