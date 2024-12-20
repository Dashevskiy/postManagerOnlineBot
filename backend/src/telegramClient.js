const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
require('dotenv').config();

const apiId = parseInt(process.env.TELEGRAM_API_ID, 10);
const apiHash = process.env.TELEGRAM_API_HASH;
const phone = process.env.TELEGRAM_PHONE;

// Инициализация клиента с пустой сессией
const session = new StringSession(process.env.TELEGRAM_SESSION || ''); // Используем сохранённую сессию
const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
    transport: 'websocket',
  });

  client.connect()
  .then(() => console.log('Telegram Client подключён!'))
  .catch((err) => console.error('Ошибка подключения:', err.message));

async function connectTelegramClient() {
  try {
    console.log('Подключение к Telegram...');
    await client.start({
      phoneNumber: async () => phone,
      password: async () => '', // Если у вас нет двухфакторной аутентификации, оставьте пустым
      phoneCode: async () => {
        console.log('Введите код, отправленный в Telegram:');
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        return new Promise((resolve) => {
          readline.question('Код: ', (code) => {
            readline.close();
            resolve(code);
          });
        });
      },
      onError: (err) => {
        console.error('Ошибка при авторизации:', err.message);
        return Promise.reject(err);
      },
    });

    console.log('Вы успешно авторизованы!');
    console.log('Сессия:', client.session.save());
  } catch (error) {
    console.error('Ошибка подключения к Telegram:', error.message);
  }
}

connectTelegramClient();

module.exports = { connectTelegramClient, client };
