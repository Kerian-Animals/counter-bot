require('dotenv')
.config({path:'./private/confidential/env/.env'}); // Change path or remove {path:'./private/confidential/env/.env'} if the .env file is in your main folder
const Discord = require("discord.js"); // import discord.js in the file for use
const axios = require("axios").default; // import axios in the file for use
const ms = require('ms'); // import ms in the file for use
const fs = require('fs'); // import fs in the file for use
const parser = require("jsdom");
const { JSDOM } = parser;
const config = require('./utils/config/config.json');
// Initialisation:

const client = new Discord.Client(); // Define the Discord client constant 

client.login(process.env.TOKEN); // Connect the client to the token provide in the .env file

client.on('ready', async()=>{ 
    /*Event "ready" run on the bot is fully connected on the client*/

    console.log('Bot connecté !');


    update('stream');

});




client.on('message', async(message)=>{
    if (message.type !== "DEFAULT" || message.author.bot) return;

    const args = message.content.trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (!command.startsWith('c!')) return;

    if(command == 'c!set'){
        if(!args[0])return message.channel.send('test');
        if(!args[1])return message.channel.send('dbug');
        if(isNaN(args[0]) || args[0].length !== 18)return console.log('test');
        client.channels.fetch(args[1], true, true).then(async(channel)=>{
            if(channel.type!=='voice')return;
            switch(args[0]){
                case 'youtube':
                    config.channels.youtube.id = args[1];
                break;
                
                case 'instagram':
                    config.channels.instagram.id = args[1];
                break;

                case 'twitch':
                    config.channels.twitch.id = args[1];
                break;

                case 'stream':
                    config.channels.twitch_stream_views.id = args[1];
                break;

                case 'twitter':
                    config.channels.twitter.id = args[1];
                break;

                case 'members':
                    config.channels.members.id = args[1];
                break;
            };
            fs.writeFileSync('./utils/config/config.json', JSON.stringify(config));
            update(args[0]);
        }).catch(async(error)=>{
            return;
        });
    };

    if(command == 'c!rename'){
        if(!args[0])return message.channel.send('test');
        if(!args[1])return message.channel.send('dbug');

        switch(args[0]){
            case 'youtube':
                config.channels.youtube.name = args[1].endsWith(':')?args[1]:`${args[1]}:`;
            break;
            
            case 'instagram':
                config.channels.instagram.name = args[1].endsWith(':')?args[1]:`${args[1]}:`;
            break;

            case 'twitch':
                config.channels.twitch.name = args[1].endsWith(':')?args[1]:`${args[1]}:`;
            break;

            case 'stream':
                config.channels.twitch_stream_views.name = args[1].endsWith(':')?args[1]:`${args[1]}:`;
            break;

            case 'twitter':
                config.channels.twitter.name = args[1].endsWith(':')?args[1]:`${args[1]}:`;
            break;

            case 'members':
                config.channels.members.name = args[1].endsWith(':')?args[1]:`${args[1]}:`;
            break;
        };
        fs.writeFileSync('./utils/config/config.json', JSON.stringify(config));
        update(args[0]);
    };

});

async function update(channel){
    switch(channel){
        case 'youtube':
            axios.get(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${config.social_network.youtube}&key=${process.env.API_YOUTUBE_KEY}`).then(async(result)=>{
                result = numFormatter(result.data.items[0].statistics.subscriberCount, 2);
                client.channels.fetch(config.channels.youtube.id, true, true).then(async(channel)=>{
                    console.log(result);
                    if(channel.name == `${config.channels.youtube.name} ${result}`)return console.log("nope");
                    channel.setName(`${config.channels.youtube.name} ${result}`).then(async(renamed)=>{
                    }).catch(error=>{
                        console.log(error);
                        throw error;
                    });
                }).catch(error=>{
                    console.log(error);
                    throw error;
                });
            });
        break;
        case 'instagram':
                axios.get(`https://www.instagram.com/${config.social_network.instagram}`).then(async(page)=>{;
                    const document = new JSDOM(page.data, { runScripts: "dangerously" });
                    const userInfo = document.window._sharedData.entry_data.ProfilePage[0].graphql.user;
                    let followers = numFormatter(userInfo.edge_followed_by.count, 2);
                    client.channels.fetch(config.channels.instagram.id, true, true).then(async(channel)=>{
                        console.log(followers);
                        if(channel.name == `${config.channels.instagram.name} ${followers}`)return console.log("nope");
                        channel.setName(`${config.channels.instagram.name} ${followers}`).then(async(renamed)=>{
                        }).catch(error=>{
                            console.log(error);
                            throw error;
                        });
                    }).catch(error=>{
                        console.log(error);
                        throw error;
                    });
            }).catch(error=>{
                console.log(error);
                throw error;
            });
        break;
        case 'twitter':
            axios.get(`https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=${config.social_network.twitter}`).then(async(result)=>{
                let followers = numFormatter(result.data[0].followers_count, 2);

                client.channels.fetch(config.channels.twitter.id, true, true).then(async(channel)=>{
                    console.log(followers);
                    if(channel.name == `${config.channels.twitter.name} ${followers}`)return console.log("nope");
                    channel.setName(`${config.channels.twitter.name} ${followers}`).then(async(renamed)=>{
                    }).catch(error=>{
                        console.log(error);
                        throw error;
                    });
                }).catch(error=>{
                    console.log(error);
                    throw error;
                });
            }).catch(error=>{
                console.log(error);
                throw error;
            });
        break;
        case 'twitch':
            axios.get(`https://api.twitch.tv/helix/users/follows?to_id=${config.social_network.twitch}`,{
                headers:{
                    'Authorization': `Bearer ${process.env.API_TWITCH_ACCESS_TOKEN}`,
                    'Client-Id': `${process.env.API_TWITCH_ID}`,
                }
            }).then(async(result)=>{
                console.log(numFormatter(result.data.total, 2));
            }).catch(error=>{
                console.log(error);
                throw error;
            });
        break;
        case 'stream':
            axios.get(`https://api.twitch.tv/helix/streams?channelid=${config.social_network.twitch}`,{
                headers:{
                    'Authorization': `Bearer ${process.env.API_TWITCH_ACCESS_TOKEN}`,
                    'Client-Id': `${process.env.API_TWITCH_ID}`,
                }
            }).then(async(result)=>{
                console.log(result.data);
            }).catch(error=>{
                console.log(error);
                throw error;
            });
        break;
    };
};

function numFormatter(number, digit){
    var si = [
        { value: 1, symbol: "" },
        { value: 1E3, symbol: "k" },
        { value: 1E6, symbol: "M" },
        { value: 1E9, symbol: "G" },
        { value: 1E12, symbol: "T" },
        { value: 1E15, symbol: "P" },
        { value: 1E18, symbol: "E" }
    ];
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
        if (number >= si[i].value) {
            break;
        }
    }
    return (number / si[i].value).toFixed(digit).replace(rx, "$1") + si[i].symbol;
};