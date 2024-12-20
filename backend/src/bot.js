const { Telegraf } = require('telegraf');
const { BOT_TOKEN } = require('./config');
const { loadData, saveData } = require('./utils/dataStore');

const bot = new Telegraf(BOT_TOKEN);
const data = loadData(); // Загружаем сохранённые данные

// Команда /start
bot.start((ctx) => {
  const userId = ctx.from.id;
  if (!data[userId]) data[userId] = { channels: [] }; // Инициализация данных пользователя
  ctx.reply(
    'Привет! Я помогу вам получать посты из Telegram-каналов. Используйте команды:\n' +
      '/add_channel - добавить канал\n' +
      '/get_posts - получить последние посты из добавленных каналов\n' +
      '/my_channels - список добавленных каналов'
  );
  saveData(data); // Сохраняем данные
});

// Команда /add_channel для добавления канала
bot.command('add_channel', async (ctx) => {
  const userId = ctx.from.id;
  ctx.reply('Введите @username или ссылку на канал:');

  bot.on('text', async (msgCtx) => {
    const channel = msgCtx.message.text; // Имя или ссылка на канал
    if (!data[userId]) data[userId] = { channels: [] };

    try {
      const chat = await bot.telegram.getChat(channel); // Проверяем, существует ли канал
      if (!data[userId].channels.some((ch) => ch.id === chat.id)) {
        data[userId].channels.push({
          id: chat.id,
          username: chat.username || null,
        });
        saveData(data); // Сохраняем данные
        msgCtx.reply(`Канал "${chat.title}" добавлен!`);
      } else {
        msgCtx.reply('Этот канал уже добавлен.');
      }
    } catch (error) {
      console.error(error);
      msgCtx.reply('Не удалось найти канал. Проверьте правильность ссылки или username.');
    }
  });
});

// Команда /my_channels для отображения добавленных каналов
bot.command('my_channels', (ctx) => {
  const userId = ctx.from.id;
  const userChannels = data[userId]?.channels || [];

  if (userChannels.length === 0) {
    ctx.reply('Вы ещё не добавили ни одного канала.');
  } else {
    const channelList = userChannels
      .map((channel) => `- ${channel.username || `ID: ${channel.id}`}`)
      .join('\n');
    ctx.reply(`Ваши добавленные каналы:\n${channelList}`);
  }
});

// Команда /get_posts для получения последних сообщений
bot.command('get_posts', async (ctx) => {
  const userId = ctx.from.id;
  const userChannels = data[userId]?.channels || [];

  if (!userChannels.length) {
    return ctx.reply('Вы ещё не добавили ни одного канала.');
  }

  for (const channel of userChannels) {
    try {
      const chat = await bot.telegram.getChat(channel.id);
      const history = await bot.telegram.getChatHistory(chat.id, { limit: 5 }); // Получаем последние 5 сообщений

      ctx.reply(`📢 Последние посты из канала "${chat.title}":`);
      for (const message of history) {
        const content = message.text || 'Медиа или другой контент';
        ctx.reply(content);
      }
    } catch (error) {
      console.error(error);
      ctx.reply(`Не удалось получить посты из канала ${channel.username || channel.id}`);
    }
  }
});

// Запуск бота
bot.launch().then(() => console.log('Бот запущен!'));
