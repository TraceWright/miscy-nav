process.env.TZ = 'Australia/Brisbane';
const Discord = require('discord.js');
const client = new Discord.Client();
const allGyms = require('./gyms/allGyms.json');
const kpGyms = require('./gyms/kpGabbaGyms');
const sbGyms = require('./gyms/sbGyms');
const cbdGyms = require('./gyms/cbdGyms');
const westEndGyms = require("./gyms/westEndGyms");
const miltonGyms = require("./gyms/miltonGyms");

const channelsLookup = [ 
    { 
        channelId: "506409230383841286",
        gymsLookup: cbdGyms,
        name: "cbd",
    },
    { 
        channelId: "501313521410244610",
        gymsLookup: sbGyms,
        name: "southbank",
    },
    {
        channelId: "499533390920417290",
        gymsLookup: kpGyms,
        name: "kp_gabba_eastbris",
    },
    {
        channelId: "512597629796876298",
        gymsLookup: westEndGyms,
        name: "westend"
    },
    {
        channelId: "520435941496586246",
        gymsLookup: miltonGyms,
        name: "milton"
    },
    {
        channelId: "499532605348249601",
        gymsLookup: allGyms,
        name: "discord_admin",
    }
];

const timeColonReg = new RegExp(/([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/gm);
const timeDotReg = new RegExp(/([0-9]|0[0-9]|1[0-9]|2[0-3])[\d\.][0-5][0-9]$/gm);
const tiers = ["T1", "T2", "T3", "T4", "T5", "t1", "t2", "t3", "t4", "t5"];

const listenerChannels = channelsLookup.map(ch => { return ch.channelId });
const reportChannel ="511390047434702849";
const errorChannel ="511472297513713674";

const splitTime = (t) => {
    let time;
    if (t.split("").includes(":")) {
        time = t.split(":");
    } else if (t.split("").includes(".")) {
        time = t.split(".");
    } else {
        time = [];
    }
    return !!time && time.length > 0 ? [parseInt(time[0]), parseInt(time[1])] : [];
}

const calcRaidHour = (h) => {
    return new Date().getHours() >= 12 && h < 12 ? h + 12 : h;
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

const createErrorMsg = (tierMatch, timeMatch, unmatched) => {
    return `error: Tier: ${tierMatch[0]},  ` +
    `Time: ${timeMatch[0]}, ` +
    `Gym: ${unmatched.toString().replace(",", " ")} `;
}

client.on("message", message => {
    
    if (listenerChannels.includes(message.channel.id)) {

        let msg = message.content.split(" ");

        console.log(msg);
        let tierMatch = msg.filter((m, i) => { return tiers.includes(m) });
        let timeColonMatch = msg.filter(m => { return m.match(timeColonReg) });
        let timeDotMatch = msg.filter(m => { return m.match(timeDotReg) });

        let timeMatch;
        if (timeColonMatch.length > 0 || timeDotMatch.length > 0) {
            timeMatch = timeColonMatch.length > 0 ? timeColonMatch : timeDotMatch;
        } else {
            timeMatch = [];
        }

        // must always have tier and time declared in incoming message
        if (tierMatch.length > 0 && timeMatch.length > 0) {
            
            let dblQuote = new RegExp(/"(.*?)"/g);
            let otherDblQuote = new RegExp(/“(.*?)”/g);
            let sglQuote = new RegExp(/'(.*?)'/g);
            let otherSglQuote = new RegExp(/‘(.*?)’/g);

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
                let t = splitTime(timeMatch[0]);
                let timeToHatch;
                if (!!t !== false && t.length === 2) {
                    let h = calcRaidHour(t[0]);
                    timeToHatch = calcTimeToHatch(calcHatchTime(h, t[1]));
                }
                if (!!gym && !!timeToHatch && timeToHatch > 0 && timeToHatch <= 60) {
                    client.channels.get(reportChannel).send(`$egg ${tierMatch[0].substring(1,2)} ${gym} ${timeToHatch}`); 
                } else {
                    console.log("error: ", "tier: ", tierMatch[0], " gym: ", gym, " time to hatch: ", timeToHatch);
                    client.channels.get(errorChannel).send(`Error: Tier: ${tierMatch[0].substring(1,2)}, Gym: ${!!gym ? gym : "invalid"}, Time to hatch: ${!!timeToHatch ? timeToHatch : "invalid"}`); 
                }

            } else {

                const chn = channelsLookup.filter(ch => {
                    return message.channel.id === ch.channelId
                });
                const gyms = chn.length > 0 ? chn[0].gymsLookup : allGyms;
                let gymNameMatch;
                let gymAbbrvMatch;
                let timeToHatch;

                let unmatched = msg.filter((r, i) => { return i !== msg.indexOf(timeMatch[0]) && i !== msg.indexOf(tierMatch[0]) });
                if (unmatched.length > 0) {
                    const potentialGym = unmatched.join(" ").toLowerCase();
                    gymAbbrvMatch = Object.keys(gyms).filter(g => { return g === potentialGym.toLowerCase()});
                    gymNameMatch = gymAbbrvMatch.length <= 0 ? Object.values(gyms).filter(g => { return g === potentialGym.toLowerCase()}) : null;
                } else {
                    console.error("no potential gym name in message");
                }
                if (gymAbbrvMatch.length > 0 || (!!gymNameMatch && gymNameMatch.length > 0)) {
                    let t = splitTime(timeMatch[0]);
                    if (!!t !== false && t.length === 2) {
                        let h = calcRaidHour(t[0]);
                        timeToHatch = calcTimeToHatch(calcHatchTime(h, t[1]));
                    }
                    if ((!!timeToHatch || timeToHatch === 0) && timeToHatch >= 0 && timeToHatch <= 60) {
                        const gymName = gymAbbrvMatch.length > 0 ? gyms[gymAbbrvMatch[0]] : gymNameMatch[0];
                        const report = !!gymNameMatch ?
                            `$egg ${tierMatch[0].substring(1,2)} "${gymName}" ${timeToHatch}` :
                            `$egg ${tierMatch[0].substring(1,2)} "${gymName}" ${timeToHatch}` ;
                        ;
                        console.info(report);
                        client.channels.get(reportChannel).send(report);
                    } else {
                        // Hatch time out of range
                        const errorMessage = "Hatch time out of range " + createErrorMsg(tierMatch, timeMatch, unmatched);
                        console.error(errorMessage);
                        client.channels.get(errorChannel).send(errorMessage);
                    }
                } else {
                    // gym name mismatch
                    const errorMessage = "Gym name mismatch " + createErrorMsg(tierMatch, timeMatch, unmatched);
                    console.error(errorMessage);
                    client.channels.get(errorChannel).send(errorMessage);
                }
            }
        } else {
            // time or tier mismatch
            // const errorMessage = `Error: Time: ${timeMatch.length > 0 ? timeMatch[0] : "invalid"}, Tier: ${tierMatch.length > 0 ? tierMatch : "invalid"}`;
            // console.error(errorMessage);
            // client.channels.get(errorChannel).send(errorMessage);
        }
    }

});

require("log-timestamp");
console.log("Opening Connection");

client.login("token");
