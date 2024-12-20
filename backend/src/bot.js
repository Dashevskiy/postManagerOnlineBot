const { Telegraf, Markup } = require('telegraf');
const { getData, saveData } = require('./utils/dataStore');
const { BOT_TOKEN } = require('./config');

const bot = new Telegraf(BOT_TOKEN);
const data = getData();

// Команда /start
bot.start((ctx) => {
  const userId = ctx.from.id;
  if (!data[userId]) data[userId] = { channels: [], notes: {} };

  ctx.reply(
    'Добро пожаловать! Я помогу вам управлять каналами и добавлять заметки. Используйте команды:\n' +
      '/add_channel - добавить канал\n' +
      '/get_posts - получить посты\n' +
      '/my_channels - список добавленных каналов'
  );
  saveData(data);
});

// Команда для добавления канала
bot.command('add_channel', (ctx) => {
  ctx.reply('Введите @username или ссылку на канал:');
  bot.on('text', async (msgCtx) => {
    const channel = msgCtx.message.text;
    const userId = msgCtx.from.id;

    try {
      const response = await bot.telegram.getChat(channel);
      const chat = response;

      if (!data[userId].channels.some((ch) => ch.id === chat.id)) {
        data[userId].channels.push({
          id: chat.id,
          title: chat.title,
          username: chat.username || null,
        });
        saveData(data);
        msgCtx.reply(`Канал "${chat.title}" успешно добавлен!`);
      } else {
        msgCtx.reply('Этот канал уже добавлен.');
      }
    } catch (error) {
      msgCtx.reply('Ошибка: Не удалось найти канал. Проверьте ввод.');
    }
  });
});

// Команда для получения постов
bot.command('get_posts', async (ctx) => {
  const userId = ctx.from.id;
  const userChannels = data[userId]?.channels || [];

  if (!userChannels.length) return ctx.reply('Вы ещё не добавили ни одного канала.');

  for (const channel of userChannels) {
    await ctx.reply(`📢 Посты из канала: ${channel.title}`);

    // Логика получения постов из канала (заглушка)
    const posts = [`Пример поста из канала ${channel.title}`];
    for (const post of posts) {
      await ctx.reply(post, Markup.inlineKeyboard([Markup.button.callback('Добавить заметку', `note_${channel.id}`)]));
    }
  }
});

// Обработка добавления заметки
bot.action(/^note_(\d+)$/, (ctx) => {
  const channelId = ctx.match[1];
  const userId = ctx.from.id;

  ctx.reply('Введите заметку:');
  bot.on('text', (msgCtx) => {
    const note = msgCtx.message.text;
    if (!data[userId].notes[channelId]) data[userId].notes[channelId] = [];
    data[userId].notes[channelId].push(note);
    saveData(data);
    msgCtx.reply('Заметка добавлена.');
  });
});

bot.launch();
