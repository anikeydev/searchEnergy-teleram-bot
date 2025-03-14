import express from 'express'
import { config } from 'dotenv'
import { startBot } from './bot.js'

config()

const app = express()
const PORT = process.env.PORT

const getData = async () => {
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
}

const data = await getData()

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
  startBot(data)
})
