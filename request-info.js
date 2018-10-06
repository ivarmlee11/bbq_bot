const request = require('request')

module.exports = async name => {

    console.log(`${name} is requesting their PUBG stats.`)

    const options = {
        url: `https://api.pubg.com/shards/pc-na/players?filter[playerNames]=${name}`,
        headers: {
            'User-Agent': 'request',
            'Authorization': `Bearer ${process.env.PUBG_TOKEN}`,
            'Accept': 'application/vnd.api+json'
        }
    }

    let lastMatchId = null

    const playerId = await new Promise((resolve, reject) => {
        request(options, (error, res, body) => {
            if (!error && res.statusCode == 200) {
                const info = JSON.parse(body)
                lastMatchId = info.data[0].relationships.matches.data[0].id || null
                const playerId = info.data[0].id
                resolve(playerId)
            } else {
                reject(' I could not find a user by that name in the NA region.')
            }
        })
    })

    options.url = 'https://api.pubg.com/shards/pc-na/seasons'

    const currentSeason = await new Promise((resolve, reject) => {
        request(options, (error, res, body) => {
            if (!error && res.statusCode == 200) {
                let currentSeason = ''
                const seasons = JSON.parse(body)
                for (const season of seasons.data) {
                    if (season.attributes.isCurrentSeason) currentSeason = season.id
                }                
                resolve(currentSeason)
            } else {
                reject(' there was an error finding the current season.')
            }
        })
    })

    options.url = `https://api.pubg.com/shards/pc-na/players/${playerId}/seasons/${currentSeason}`

    // player info
    
    let playerInfo = {
        lastMatchId,
        region: 'North America PC (pc-na)',
        username: name,
        season: currentSeason,
        solo: {
            wins: 0,
            losses: 0,
            ratio: 0,
            kills: 0
        },
        'solo-fpp': {
            wins: 0,
            losses: 0,
            ratio: 0,
            kills: 0
        },
        duo: {
            wins: 0,
            losses: 0,
            ratio: 0,
            kills: 0
        },
        'duo-fpp': {
            wins: 0,
            losses: 0,
            ratio: 0,
            kills: 0
        },
        squad: {
            wins: 0,
            losses: 0,
            ratio: 0,
            kills: 0
        },
        'squad-fpp': {
            wins: 0,
            losses: 0,
            ratio: 0,
            kills: 0
        },
        longestKills: {
            solo: 0,
            'solo-fpp': 0,
            duo: 0,
            'duo-fpp': 0,
            squad: 0,
            'squad-fpp': 0
        },
        totalKnocks: {
            solo: 0,
            'solo-fpp': 0,
            duo: 0,
            'duo-fpp': 0,
            squad: 0,
            'squad-fpp': 0
        },
        lastMatch: {}
    }

    const playerData = await new Promise((resolve, reject) => {
        request(options, (error, res, body) => {
            if (!error && res.statusCode == 200) {
                const info = JSON.parse(body)
                const stats = info.data.attributes.gameModeStats
                for (const gametype in stats) {
                    if (gametype in playerInfo) {
                        for (const statistic in stats[gametype]) {
                            if (statistic === 'wins') {
                                playerInfo[gametype].wins = stats[gametype].wins
                            }
                            if (statistic === 'losses') {
                                playerInfo[gametype].losses = stats[gametype].losses
                            }
                            if (statistic === 'kills') {
                                playerInfo[gametype].kills = stats[gametype].kills
                            }
                            const ratio = (playerInfo[gametype].wins/playerInfo[gametype].losses) || 0
                            const percent = Math.round(ratio * 10000)/100
                            playerInfo[gametype].ratio = `${percent}%`
                            if (statistic === 'longestKill') {
                                const longKill = Math.round(stats[gametype].longestKill * 100)/100
                                playerInfo.longestKills[gametype] = `${longKill} meters`
                            }
                            if (statistic === 'dBNOs') playerInfo.totalKnocks[gametype] = `${stats[gametype].dBNOs} enemies knocked down`
                        }
                    }
                }
                resolve(playerInfo)
            } else {
                reject(' I was unable to find any data related to that player name on the NA region.')
            }
        })
    })

    // get last match 
    
    options.url = `https://api.pubg.com/shards/pc-na/matches/${playerInfo.lastMatchId}`

    const lastMatchData = await new Promise((resolve, reject) => {
        request(options, (error, res, body) => {
            if (!error && res.statusCode == 200) {
                const info = JSON.parse(body)
                info.included.forEach(val => {
                    if ((val.type === 'participant') && (name === val.attributes.stats.name)) {
                        playerInfo.lastMatch.winPlace = val.attributes.stats.winPlace
                        const longKill = Math.round(val.attributes.stats.longestKill * 100)/100
                        playerInfo.lastMatch.longestKill = longKill
                        playerInfo.lastMatch.kills = val.attributes.stats.kills
                        playerInfo.lastMatch.headshotKills = val.attributes.stats.headshotKills
                        playerInfo.lastMatch.assists = val.attributes.stats.assists
                        playerInfo.lastMatch.revives = val.attributes.stats.revives
                        playerInfo.lastMatch.knocks = val.attributes.stats.DBNOs
                        const damage = Math.round(val.attributes.stats.damageDealt * 100)/100
                        playerInfo.lastMatch.damageDealt = damage
                        playerInfo.lastMatch.gameType = info.data.attributes.gameMode
                    }
                })
                resolve(playerInfo)
            } else {
                reject(' when checking for your last played match I was unable to find any data for the NA region.')
            }
        })
    })

    playerInfo.currentSeason = currentSeason
    
    return playerInfo

}