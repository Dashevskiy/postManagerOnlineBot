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

const fs = require('fs');
const path = require('path');

async function getChannelMessages(channelUsername) {
  try {
    console.log(`Получение сообщений из канала: ${channelUsername}`);
    const messages = await client.getMessages(channelUsername, { limit: 5 });

    if (!messages || messages.length === 0) {
      console.log(`Нет сообщений в канале: ${channelUsername}`);
      return [`Нет новых сообщений в канале "${channelUsername}".`];
    }

    return await Promise.all(
      messages.map(async (msg) => {
        if (msg.message) {
          return `Текст: ${msg.message}`;
        } else if (msg.media) {
          const mediaPath = await saveMedia(msg.media);
          return `Медиа сообщение: ${mediaPath}`;
        } else {
          return `Сообщение неизвестного формата.`;
        }
      })
    );
  } catch (err) {
    console.error(`Ошибка получения сообщений из канала "${channelUsername}":`, err.message);
    return [`Не удалось получить сообщения из канала "${channelUsername}".`];
  }
}

// Функция для сохранения медиа
async function saveMedia(media) {
  try {
    const downloadPath = path.join(__dirname, 'downloads'); // Папка для сохранения
    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath);
    }

    const filePath = path.join(downloadPath, `${media.fileReference.toString('hex')}.jpg`); // Сохраняем как .jpg
    await client.downloadMedia(media, { file: filePath });
    console.log(`Медиа сохранено в ${filePath}`);
    return filePath;
  } catch (err) {
    console.error('Ошибка при сохранении медиа:', err.message);
    return 'Не удалось сохранить медиа.';
  }
}



connectTelegramClient();

module.exports = { connectTelegramClient, client, getChannelMessages };
