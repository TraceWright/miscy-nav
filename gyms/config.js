allGyms = require("./allGyms.json");
kpGyms = require("./kpGabbaGyms");
sbGyms = require("./sbGyms");
cbdGyms = require("./cbdGyms");
westEndGyms = require("./westEndGyms");
miltonGyms = require("./miltonGyms");

discordToken = "token"

reportChannel = "525517549887029248";
errorChannel = "511472297513713674";

channelsLookup = [ 
    { 
        channelId: "525556985354256405",
        gymsLookup: cbdGyms,
        name: "cbd",
    },
    { 
        channelId: "525562566953533440",
        gymsLookup: sbGyms,
        name: "southbank",
    },
    {
        channelId: "525563748904337428",
        gymsLookup: kpGyms,
        name: "kp_gabba_eastbris",
    },
    {
        channelId: "512597629796876298",
        gymsLookup: westEndGyms,
        name: "westend"
    },
    {
        channelId: "525565862200082433",
        gymsLookup: miltonGyms,
        name: "milton"
    },
    {
        channelId: "499532605348249601",
        gymsLookup: allGyms,
        name: "discord_admin",
    }
];

