let fs = require('fs')
function CalculateChance(boxType)
{
    if(boxType.includes("lolbox.ultra"))
    {
        return 0.75;
    }
    if(boxType.includes("lolbox.mega"))
    {
        return 0.50;
    }
    if(boxType.includes("lolbox.lite"))
    {
        return 0.25;
    }
    return 0.0;
}
function CalculateCards(boxType)
{
    if(boxType.includes("lolbox.ultra"))
    {
        return 8;
    }
    if(boxType.includes("lolbox.mega"))
    {
        return 6;
    }
    if(boxType.includes("lolbox.lite"))
    {
        return 4;
    }
    return 4;
}
function RandomBox(boxType, data)
{
    const ChampionsJson = JSON.parse(fs.readFileSync("./Helpers/Champions.json", "utf-8")); 
    const EmotesJson = JSON.parse(fs.readFileSync("./Helpers/Emotes.json", "utf-8"));
    const WeaponSkins = JSON.parse(fs.readFileSync("./Helpers/WeaponSkins.json", "utf-8"));
    BoxContainer = [
        {
            "Amount": Math.floor(Math.random() * 20000),
            "RewardType": "LOLCoins"
        }
    ];
    for (let i = 0; i < CalculateCards(boxType); i++) {
        let rand = Math.floor(Math.random() * ChampionsJson.length);
        if (data.Champions.OwnedChampions[ChampionsJson[rand]] != null) {
            let shards = Math.floor(Math.random() * 200);
            BoxContainer.push({ "ProductID": ChampionsJson[rand], "RewardType": "Blueprints", "Amount": shards });
            data.Champions.ChampionShards[ChampionsJson[rand]] += shards;
        } else {
            i--;
        }
    }
    if (Math.random() < CalculateChance(boxType)) {
        let val = Math.floor(Math.random() * 2)
        switch(val)
        {
            case 0:
                {
                    // Random Champion
                    if (data.Champions.OwnedChampions.length === ChampionsJson.length) {
                    } else {
                        let rand = Math.floor(Math.random() * ChampionsJson.length);
                        while (data.Champions.OwnedChampions[ChampionsJson[rand]] != null) {
                            rand = Math.floor(Math.random() * ChampionsJson.length);
                        }
                        BoxContainer.push({ "ProductID": ChampionsJson[rand], "RewardType": "Product", "Amount": 1 });
                        let name = ChampionsJson[rand];
                        data.Champions.OwnedChampions[name] = { "Level": 0 };
                        data.Champions.ChampionShards[name] = 0;
                    }
                    break;
                }
            case 1:
                {
                    if (data.Skins.WeaponSkins.length === WeaponSkins.length) {
                    } else {
                        let rand = Math.floor(Math.random() * WeaponSkins.length);
                        while (data.Skins.WeaponSkins[WeaponSkins[rand]] != null) {
                            rand = Math.floor(Math.random() * WeaponSkins.length);
                        }
                        BoxContainer.push({ "ProductID": WeaponSkins[rand], "RewardType": "Product", "Amount": 1 });
                        let name = WeaponSkins[rand];
                        data.Skins.WeaponSkins.push(name);
                    }
                    break;
                }
                
            case 2:
                {
                    if (data.Skins.OwnedEmotes.length === EmotesJson.length) {
                    } else {
                        let rand = Math.floor(Math.random() * EmotesJson.length);
                        while (data.Skins.OwnedEmotes[EmotesJson[rand]] != null) {
                            rand = Math.floor(Math.random() * WeaponSkins.length);
                        }
                        BoxContainer.push({ "ProductID": EmotesJson[rand], "RewardType": "Product", "Amount": 1 });
                        let name = EmotesJson[rand];
                        data.Skins.OwnedEmotes.push(name);
                    }
                    break;
                }
        }
    }
    return BoxContainer
}
module.exports = {RandomBox, CalculateCards, CalculateChance}