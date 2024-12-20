const { Telegraf } = require('telegraf');
const { BOT_TOKEN } = require('./config');
const { loadData, saveData } = require('./utils/dataStore');
const { connectTelegramClient, getChannelMessages } = require('./telegramClient');

const bot = new Telegraf(BOT_TOKEN);
const data = loadData();

// Подключение к Telegram Client при запуске
connectTelegramClient()
  .then(() => console.log('Telegram Client подключён'))
  .catch((err) => console.error('Ошибка подключения к Telegram Client:', err.message));

// Команда /start
bot.start((ctx) => {
  const userId = ctx.from.id;
  if (!data[userId]) data[userId] = { channels: [] };
  ctx.reply(
    'Привет! Я помогу вам получать посты из Telegram-каналов. Используйте команды:\n' +
      '/add_channel - добавить канал\n' +
      '/get_posts - получить последние посты из добавленных каналов\n' +
      '/my_channels - список добавленных каналов'
  );
  saveData(data);
});

// Команда /add_channel
bot.command('add_channel', async (ctx) => {
  const userId = ctx.from.id;
  ctx.reply('Введите @username или ссылку на канал:');

  bot.on('text', async (msgCtx) => {
    const channel = msgCtx.message.text;

    if (!data[userId]) data[userId] = { channels: [] };

    if (!data[userId].channels.some((ch) => ch === channel)) {
      data[userId].channels.push(channel);
      saveData(data);
      msgCtx.reply(`Канал "${channel}" добавлен!`);
    } else {
      msgCtx.reply('Этот канал уже добавлен.');
    }
  });
});

// Команда /get_posts
bot.command('get_posts', async (ctx) => {
  const userId = ctx.from.id;
  const userChannels = data[userId]?.channels || [];

  if (!userChannels.length) {
    return ctx.reply('Вы ещё не добавили ни одного канала.');
  }

  for (const channel of userChannels) {
    try {
      const messages = await getChannelMessages(channel);
      ctx.reply(`📢 Последние посты из канала "${channel}":`);

      messages.forEach((msg) => {
        ctx.reply(`${msg.date}: ${msg.text}`);
      });
    } catch (err) {
      console.error('Ошибка при получении постов:', err.message);
      ctx.reply(`Не удалось получить сообщения из канала "${channel}".`);
    }
  }
});

// Запуск бота
bot.launch().then(() => console.log('Бот запущен!'));
