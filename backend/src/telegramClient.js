const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input'); // Для запроса кода авторизации
require('dotenv').config();

const apiId = parseInt(process.env.TELEGRAM_API_ID, 10);
const apiHash = process.env.TELEGRAM_API_HASH;
const phone = process.env.TELEGRAM_PHONE;

// Инициализация клиента с пустой сессией
const session = new StringSession('');
const client = new TelegramClient(session, apiId, apiHash, {
  connectionRetries: 5,
});

async function connectTelegramClient() {
  console.log('Подключение к Telegram...');
  await client.start({
    phoneNumber: async () => phone,
    password: async () => await input.text('Введите пароль от двухфакторной аутентификации (если есть):'),
    phoneCode: async () => await input.text('Введите код из Telegram:'),
    onError: (err) => console.log(err),
  });
  console.log('Вы успешно авторизованы!');
  console.log('Сессия:', client.session.save()); // Сохраните эту строку для последующего использования
}

async function getChannelMessages(channelUsername) {
  try {
    const messages = await client.getMessages(channelUsername, { limit: 5 });
    return messages.map((msg) => ({
      text: msg.message || '[Медиа или другой контент]',
      date: msg.date,
    }));
  } catch (err) {
    console.error('Ошибка при получении сообщений:', err.message);
    return [];
  }
}

module.exports = { connectTelegramClient, getChannelMessages };
