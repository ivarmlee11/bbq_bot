if (process.env.NODE_ENV !== 'production') { require('dotenv').config() }

const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const Discord = require('discord.js')
const client = new Discord.Client()
const eventListeners = require('./event-listeners')

client.on('ready', () => { 
    console.log(client.user)
})

client.on('error', (error) => {
    console.log(error)
})

client.on('message', eventListeners.handleMessage)

client.login(process.env.BOT_TOKEN)

app.listen(PORT, () => console.log(`express server listening on port: ${PORT}`))