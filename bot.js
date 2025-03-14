import TelegramBot from 'node-telegram-bot-api'
import { config } from 'dotenv'
import { findParks } from './utils.js'

config()

const getData = async (req, res) => {
  try {
    const url = `https://apidata.mos.ru/v1/datasets/2985/features?api_key=${process.env.MOS_BASE_API_KEY}`

    const response = await fetch(url)
    const data = await response.json()
    const result = data.features.map((item) => {
      return {
        name: item.properties.attributes.Name,
        address: item.properties.attributes.Address,
        coordinates: item.geometry.coordinates.reverse(),
      }
    })
    return result
  } catch {
    console.log(res)
  }
}

export const startBot = () => {
  const bot = new TelegramBot(process.env.API_KEY_BOT, {
    polling: {
      interval: 300,
      autoStart: true,
    },
  })

  const userLocation = []
  const keyboard = [
    [{ text: '🌐Геолокация', request_location: true }, '🔶Ближайщие парковки'],
    ['❓Помощь', '❌Закрыть меню'],
  ]

  const commands = [
    {
      command: 'start',
      description: 'Запуск бота',
    },
    {
      command: 'menu',
      description: 'Открыть меню',
    },
    {
      command: 'close',
      description: 'Закрыть меню',
    },
    {
      command: 'help',
      description: 'Раздел помощи',
    },
  ]

  bot.setMyCommands(commands)

  bot.on('polling_error', (err) => console.log(err))

  bot.on('text', async (msg) => {
    if (msg.text === '/start') {
      await bot.sendMessage(
        msg.chat.id,
        `<b>Добро пожаловать в SearchEnergy🔋!</b>\n\nЭтот бесплатный бот ищет зарядные станции для электромобилей рядом с тобой в Москве, используя актуальную базу города.\n\nИспользуй меню✊\n`,
        {
          reply_markup: {
            keyboard,
            resize_keyboard: true,
          },
          parse_mode: 'HTML',
        }
      )
    } else if (msg.text === '/menu') {
      await bot.sendMessage(msg.chat.id, `Используй меню✊`, {
        reply_markup: {
          keyboard,
          resize_keyboard: true,
        },
      })
    } else if (msg.text === '🔶Ближайщие парковки') {
      if (userLocation.length === 0) {
        await bot.sendMessage(msg.chat.id, '🌐Сначала нужно поделиться гео', {
          reply_markup: {
            keyboard,
            resize_keyboard: true,
          },
        })
      } else {
        const data = await getData()
        const userParks = await findParks(data, userLocation)

        if (userParks.length == 0) {
          await bot.sendMessage(
            msg.chat.id,
            `🟥<b>Ближайщих к вам зарядных станций не найдено</b>🟥`,
            {
              parse_mode: 'HTML',
              reply_markup: {
                keyboard,
                resize_keyboard: true,
              },
            }
          )
        } else {
          let content = ''
          userParks.forEach((item) => {
            content += `<b>${item.name}</b>;\n\n<i>${item.address}</i>;\n\n<a href='https://yandex.ru/maps/?text=${item.coordinates[0]},${item.coordinates[1]}'>🗺️[${item.coordinates}]🗺️</a>\n\n`
          })

          await bot.sendMessage(
            msg.chat.id,
            `🔶<b>Ближайщие к вам зарядные станции:</b>🔶\n\n${content}`,
            {
              parse_mode: 'HTML',
              reply_markup: {
                keyboard,
                resize_keyboard: true,
              },
            }
          )
        }
      }
    } else if (msg.text === '❌Закрыть меню' || msg.text === '/close') {
      await bot.sendMessage(msg.chat.id, '❌Меню закрыто', {
        reply_markup: {
          remove_keyboard: true,
        },
      })
    } else if (msg.text === '❓Помощь' || msg.text === '/help') {
      await bot.sendMessage(
        msg.chat.id,
        '📚Проект разработан, чтобы учиться и помогать людям. Спасибо, что используете!🔥'
      )
    } else {
      await bot.sendMessage(
        msg.chat.id,
        '❓Я не знаю такую команду❓\n\nИспользуй меню✊'
      )
    }
  })

  bot.on('location', async (location) => {
    try {
      userLocation.push(location.location.latitude)
      userLocation.push(location.location.longitude)
    } catch (error) {
      console.log(error)
    }
  })
}
