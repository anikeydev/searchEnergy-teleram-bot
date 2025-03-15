import express from 'express'
import { config } from 'dotenv'
import { startBot } from './bot.js'

config()

const app = express()
const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
  startBot()
})
