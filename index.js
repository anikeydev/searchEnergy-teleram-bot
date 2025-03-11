import TelegramBot from 'node-telegram-bot-api'
import { config } from 'dotenv'
import { findParks } from './utils.js'

config()

const getData = async () => {
    const response = await fetch('https://server-ava.onrender.com/api/v1/energy-stations')
    const data = await response.json()
    return data.data
}

const data = await getData()

const bot = new TelegramBot(process.env.API_KEY_BOT, {

    polling: {
        interval: 300,
        autoStart: true
    }
    
})

const userLocation = []
const keyboard = [
        
    [{text: '🌐Геолокация', request_location: true}, '❌Закрыть меню'],
    ['🔶Ближайщие парковки']

]

bot.on('polling_error', err => console.log(err))

bot.on('text', async msg => {

    if(msg.text == '/start') {
        
        await bot.sendMessage(msg.chat.id, `<b>Добро пожаловать в SearchEnergy🔋!</b>\n\nЭтот бесплатный бот ищет зарядные станции для электромобилей рядом с тобой в Москве, используя актуальную базу города.\n\nИспользуй меню✊\n`, {
            reply_markup: {
                keyboard,
                resize_keyboard: true
            },
            parse_mode: "HTML"
        })
    
    } else if (msg.text == '/menu') {

        await bot.sendMessage(msg.chat.id, `Используй меню✊`, {
    
                reply_markup: {
                    keyboard,
                    resize_keyboard: true
                }
        
            })

    } else if (msg.text == '🔶Ближайщие парковки') {

        if (userLocation.length == 0) {
            await bot.sendMessage(msg.chat.id, '🌐Сначала нужно поделиться гео', {
                reply_markup: {
                    keyboard,
                    resize_keyboard: true
                }
            })
        } else {           
            const userParks = findParks(data, userLocation)

            if(userParks.length == 0) {
                await bot.sendMessage(msg.chat.id, `🟥<b>Ближайщих к вам зарядных станций не найдено</b>🟥`, {
                    parse_mode: "HTML",
                    reply_markup: {
                        keyboard,
                        resize_keyboard: true
                    }
                })
            } else {
                let content = ''
                userParks.forEach(item => {
                content += `<b>${item.name}</b>;\n\n<i>${item.address}</i>;\n\n<a href='https://yandex.ru/maps/?text=${item.coordinates[0]},${item.coordinates[1]}'>🗺️[${item.coordinates}]🗺️</a>\n\n`
                })

                await bot.sendMessage(msg.chat.id, `🔶<b>Ближайщие к вам зарядные станции:</b>🔶\n\n${content}`, {
                    parse_mode: "HTML",
                    reply_markup: {
                    keyboard,
                    resize_keyboard: true
                }
                })
            }
            
        }

        

    } else if(msg.text == '❌Закрыть меню') {

        await bot.sendMessage(msg.chat.id, '❌Меню закрыто', {
    
            reply_markup: {
    
                remove_keyboard: true
    
            }
    
        })
    
    } else if(msg.text == '/help'){
        await bot.sendMessage(msg.chat.id, "📚Проект разработан, чтобы учиться и помогать людям. Спасибо, что используете!🔥")
    } else {
        await bot.sendMessage(msg.chat.id, "❓Я не знаю такую команду❓\n\nИспользуй меню✊")
    }

})

bot.on('location', async location => {
    try {
        userLocation.push(location.location.latitude)
        userLocation.push(location.location.longitude)
    }
    catch(error) {

        console.log(error)

    }

})