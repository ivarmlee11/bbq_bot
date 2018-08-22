if (process.env.NODE_ENV !== 'production') { require('dotenv').config() }

const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const Discord = require('discord.js')
const client = new Discord.Client()
const { RichEmbed } = require('discord.js')
const requestPlayerInfo = require('./request-info')

app.get('/', (req, res) => {
    res.send(':D')
})

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`)
})

client.on('message', async (msg) => {

    const pubgQueryFPP = msg.content.indexOf('!pubg') === 0 ? true : false
    const pubgQueryTPP = msg.content.indexOf('!TPPpubg') === 0 ? true : false

    if (msg.content.toLowerCase() === 'help') {
        const message = 
        `
        Type "!pubg:[Your PUBG name]" to see some FPP statistics.
        Example: !pubg:Rip_Torn
        
        Type "!TPPpubg:[Your PUBG name]" to see some TPP statistics.
        Example: !TPPpubg:Rip_Torn
       
        Type "!commands" to see other commands.'
        `
        const embed = new RichEmbed()
        .setColor(008000)
        .setDescription(message)
        msg.channel.send(embed)
    }
    
    if (pubgQueryFPP) {        
        const name = msg.content.split(':')[1]
        let playerInfo
        let winner
        let topTen
        try {
            if (name) {
                playerInfo = await requestPlayerInfo(name)
                winner = (playerInfo.lastMatch.winPlace === 1) ? true : false
                topTen = (playerInfo.lastMatch.winPlace <= 10) ? true : false
            
                const message = (
                `
                
                -----Last Match-----
                ${winner ? 'YOU WON, BABY!' : ''} ${topTen ? 'YOU GOT ANOTHER TOP TEN, BABY!' : ''}
                Match Type: ${playerInfo.lastMatch.gameType}
                Placed: ${playerInfo.lastMatch.winPlace}
                Longest Kill: ${playerInfo.lastMatch.longestKill} meters
                Kills: ${playerInfo.lastMatch.kills}
                Headshot Kills: ${playerInfo.lastMatch.headshotKills}
                Damage Dealt: ${playerInfo.lastMatch.damageDealt}
                Kill assists: ${playerInfo.lastMatch.assists}
                Revived teammates: ${playerInfo.lastMatch.revives} times
                Was knocked down: ${playerInfo.lastMatch.knocks} times
                
                -----Wins-----
                Solo: ${playerInfo['solo-fpp'].wins} ==> ${playerInfo['solo-fpp'].ratio} win rate
                Duo: ${playerInfo['duo-fpp'].wins} ==> ${playerInfo['duo-fpp'].ratio} win rate 
                Squad: ${playerInfo['squad-fpp'].wins} ==> ${playerInfo['squad-fpp'].ratio} win rate
       
                -----Kills-----
                Solo: ${playerInfo['solo-fpp'].kills}
                Duo: ${playerInfo['duo-fpp'].kills}
                Squad: ${playerInfo['squad-fpp'].kills}
         
                -----Longest Kill-----
                Solo: ${playerInfo.longestKills['solo-fpp']}
                Duo: ${playerInfo.longestKills['duo-fpp']}
                Squad: ${playerInfo.longestKills['squad-fpp']}
                
                -----Knocks-----
                Solo: ${playerInfo.totalKnocks['solo-fpp']}
                Duo: ${playerInfo.totalKnocks['duo-fpp']}
                Squad: ${playerInfo.totalKnocks['squad-fpp']}

                `
                )

                const embed = new RichEmbed()
                .setTitle(`${name}'s FPP Stats (ONLY CURRENT SEASON)`)
                .setColor(0xFF0000)
                .setDescription(message)

                if(winner) {
                    embed
                    .setImage('https://static.shoplightspeed.com/shops/608321/files/004603116/merrick-merrick-can-dog-food-chunky-colossal-chick.jpg')
                } else if (topTen) {
                    embed
                    .setImage('https://static.shoplightspeed.com/shops/608321/files/004603116/merrick-merrick-can-dog-food-chunky-colossal-chick.jpg')                  
                }

                msg.channel.send(embed)

            } else {
                msg.reply('Did you enter the player name correctly?')
            }
        } catch(error) {
            msg.reply(error)
        }
    }

    if (pubgQueryTPP) {
        const name = msg.content.split(':')[1]
        let playerInfo
        try {
            if (name) {
                playerInfo = await requestPlayerInfo(name)
                winner = (playerInfo.lastMatch.winPlace === 1) ? true : false
                topTen = (playerInfo.lastMatch.winPlace <= 10) ? true : false
                
                const message = (
                `
               
                -----Last Match-----
                ${winner ? 'YOU WON, BABY!' : ''} ${topTen ? 'YOU GOT ANOTHER TOP TEN, BABY!' : ''}
                Match Type: ${playerInfo.lastMatch.gameType}
                Placed: ${playerInfo.lastMatch.winPlace}
                Longest Kill: ${playerInfo.lastMatch.longestKill} meters
                Kills: ${playerInfo.lastMatch.kills}
                Headshot Kills: ${playerInfo.lastMatch.headshotKills}
                Damage Dealt: ${playerInfo.lastMatch.damageDealt}
                Kill assists: ${playerInfo.lastMatch.assists}
                Revived teammates: ${playerInfo.lastMatch.revives} times
                Was knocked down: ${playerInfo.lastMatch.knocks} times

                -----Wins-----
                Solo: ${playerInfo.solo.wins} ==> ${playerInfo.solo.ratio} win rate
                Duo: ${playerInfo.duo.wins} ==> ${playerInfo.duo.ratio} win rate
                Squad: ${playerInfo.squad.wins} ==> ${playerInfo.squad.ratio} win rate

                -----Kills-----
                Solo: ${playerInfo.solo.kills}
                Duo: ${playerInfo.duo.kills}
                Squad: ${playerInfo.squad.kills}

                -----Longest Kill-----
                Solo: ${playerInfo.longestKills.solo}
                Duo: ${playerInfo.longestKills.duo}
                Squad: ${playerInfo.longestKills.squad}      
               
                -----Knocks -----
                Solo: ${playerInfo.totalKnocks.solo}
                Duo: ${playerInfo.totalKnocks.duo}
                Squad: ${playerInfo.totalKnocks.squad}
                
                `
                )
                const embed = new RichEmbed()
                .setTitle(`${name}'s TPP Stats (ONLY CURRENT SEASON)`)
                .setColor('0xFF0000')
                .setDescription(message)
                
                if(winner) {
                    embed
                    .setImage('https://static.shoplightspeed.com/shops/608321/files/004603116/merrick-merrick-can-dog-food-chunky-colossal-chick.jpg')
                } else if (topTen) {
                    embed
                    .setImage('https://static.shoplightspeed.com/shops/608321/files/004603116/merrick-merrick-can-dog-food-chunky-colossal-chick.jpg')                  
                }

                msg.channel.send(embed)
            } else {
                msg.reply('Did you enter the player name correctly?')
            }
        } catch(error) {
            msg.reply(error)
        }       
    }

    if (msg.content.toLowerCase() === '!commands') {

        const message =
        `
        Commands
        - "brb" plays a sound in your current voice channel
        - "monster kill" plays a sound in your current voice channel
        `
        const embed = new RichEmbed()
        .setColor('0000FF')
        .setDescription(message)

        msg.channel.send(embed)
    
    }
    
    if (msg.content.toLowerCase() === 'brb' && msg.member && msg.member.voiceChannel) {
        const connection = await msg.member.voiceChannel.join()
        connection.playFile('./illbeback.mp3')
    } else if (msg.content.toLowerCase() === 'brb') {
        msg.reply('See you later!')
    }

    if (msg.content.toLowerCase() === 'monster kill' && msg.member && msg.member.voiceChannel) {
        const connection = await msg.member.voiceChannel.join()
        connection.playFile('./monsterkill.mp3')
    } else if (msg.content.toLowerCase() === 'monster kill') {
        console.log('user not in voice channel (m kill)')
        msg.reply('M-M-M-M MONSTER KILLLLL')
    }
    
})

client.on('guildMemberAdd', (member) => {
    if (!channel) return
    // Send the message, mentioning the member
    channel.send(`Aye! ${member} has come to play.`)
})

client.login(process.env.BOT_TOKEN)
app.listen(PORT, () => console.log(`express server listening on port: ${PORT}`))