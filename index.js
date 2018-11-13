const Discord = require('discord.js');
const client = new Discord.Client();
const gyms = require('./gyms.json');

const splitTime = (t) => {
    let time = t.split(":");
    return [parseInt(time[0]), parseInt(time[1])];
}

const calcHatchTime = (h, m) => {
    return Date.UTC(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate(),
        h, 
        m,
        new Date().getSeconds(),
        new Date().getMilliseconds()
    ) + (new Date().getTimezoneOffset() * 60000);
}

const calcTimeToHatch = (hatchTime) => {
    return Math.floor((hatchTime - new Date().getTime()) / 60000)
}

client.on("message", message => {
    const tiers = ["T1", "T2", "T3", "T4", "T5"];
    const channels = ["499533390920417290", "506409230383841286", "501313521410244610", "499532605348249601"];
    let msg = message.content.split(" ");

    if (tiers.includes(msg[0].toString()) && channels.includes(message.channel.id)) {
        
        // tier always has to be the first part of the message
        let tier = msg[0].substring(1,2);
        
        let dblQuote = new RegExp(/"(.*?)"/g);
        let otherDblQuote = new RegExp(/“(.*?)”/g);
        let sglQuote = new RegExp(/'(.*?)'/g);
        let otherSglQuote = new RegExp(/‘(.*?)’/g);
        let timeReg = new RegExp(/([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/gm);

        const matchDbl = message.content.match(dblQuote);
        const matchOtherDbl = message.content.match(otherDblQuote);
        const matchSgl = message.content.match(sglQuote);
        const matchOtherSgl = message.content.match(otherSglQuote);

        if (!!matchDbl || !!matchSgl || !!matchOtherDbl || !!matchOtherSgl) {
            let gym;
            if (!!matchDbl) { 
                gym = matchDbl[0];
            } else if (!!matchOtherDbl) {
                gym = matchOtherDbl[0];
            } else if (!!matchSgl) {
                gym = matchSgl[0];
            } else if (!!matchOtherSgl) {
                gym = matchOtherSgl[0];
            }
            let t = message.content.match(timeReg) ? splitTime(message.content.match(timeReg)[0]) : null;
            let timeToHatch;
            if (!!t !== false) {
                let h = new Date().getHours() > 12 && t[0] <= 12 && t[0] > 0 ? t[0] + 12 : t[0];
                timeToHatch = !!t && t.length === 2 ? calcTimeToHatch(calcHatchTime(h, t[1])) : null;
            }

            if (!!tier && !!gym && !!timeToHatch && timeToHatch > 0) {
                client.channels.get("511390047434702849").send(`$egg ${tier} ${gym} ${timeToHatch}`); 
            } else {
                console.log("error: ", "tier: ", tier, " gym: ", gym, " time to hatch: ", timeToHatch);
                client.channels.get("511472297513713674").send(`Error: Tier: ${!!tier ? tier : "invalid"}, Gym: ${!!gym ? gym : "invalid"}, Time to hatch: ${!!timeToHatch ? timeToHatch : "invalid"}`); 
            }

        } else {

            let gym = msg[1].toLowerCase();
            let t = splitTime(msg[2]);
            let timeToHatch;
            if (!!t !== false) {
                let h = new Date().getHours() > 12 && t[0] <= 12 && t[0] > 0 ? t[0] + 12 : t[0];
                timeToHatch = calcTimeToHatch(calcHatchTime(h, t[1]));
            }
            if (!!tier && !!gyms[gym] && !!timeToHatch && timeToHatch > 0) {
                client.channels.get("511390047434702849").send(`$egg ${tier} "${gyms[gym]}" ${timeToHatch}`);
            } else {
                console.log("error: ", "tier: ", tier, " gym: ", gyms[gym], " time to hatch: ", timeToHatch);
                client.channels.get("511472297513713674").send(`Error: Tier: ${!!tier ? tier : tier}, Gym: ${!!gyms[gym] ? gyms[gym] : "invalid"}, Time to hatch: ${!!timeToHatch ? timeToHatch : "invalid"}`);
            }
        }
    }

});

require("log-timestamp");
console.log("Opening Connection");

client.login("token");
