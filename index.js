const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const { Console } = require('console');
const app = express();
var buffer = require('buffer/').Buffer;
const database = require("./db.js")
const BoxesUtil = require("./Utils/Boxes.js")
const ShardsUtil = require("./Utils/Logic.js")
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

function calculateTrophies(placement, trophiesForFirstPlace, trophiesForFourteenthPlace, totalPlaces) {
    if (placement < 1 || placement > totalPlaces) {
        throw new Error("Placement is out of range.");
    }
    return trophiesForFirstPlace + Math.round((placement - 1) / (totalPlaces - 1) * (trophiesForFourteenthPlace - trophiesForFirstPlace));
}
function log(msg)
{
    console.log(`[$] ${msg}`);
}
app.get("/v4720_remoteConfig/fetch",(req,res)=>{
    fs.readFile('./RemoteConfig.json', 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        const info = JSON.parse(data);
        res.json(info);
      });
});
app.post("/v4720_battePass/getActivePassConfig",(req,res)=>{
    res.json({"banner_image":{"image_data_type":"Url","image_data":{"url":"https://justplay-cdn.playtika.com/justbuild/1v1Images/Automations/Seasons/AquaRealm/logo512.png"}},"premium_popup_config":{"background_image":{"image_data_type":"Url","image_data":{"url":"https://justplay-cdn.playtika.com/justbuild/1v1Images/Automations/Seasons/AquaRealm/Web_ActivatePopup.jpg"}}},"is_timer_visible":true,"display_new_bp_popup":false,"BackgroundImage":{"image_data_type":"Url","image_data":{"url":"https://justplay-cdn.playtika.com/justbuild/1v1Images/Automations/Seasons/AquaRealm/BG.jpg"}},"LobbyButtonImage":{"image_data_type":"Url","image_data":{"url":"https://i.ibb.co/hf2k26T/image.png"}},"activate_button_action":{"Actions":[{"ActionName":"PopUp","ActionValues":{"popup_type":"subscription","product_id":"lol.1v1.subscription.basic"}}]},"battle_pass":{"placement_xp":[10,3],"tiers":[{"xp":0,"is_premium_unique":false,"free_rewards":["lol.1v1.lolbox.ultra"],"premium_rewards":["lol.1v1.lolbox.ultra"],"tier_up_price":420}],"currentSeason":"0","battlePassId":"0"},"current_season":"0","start_date":"2024-07-15T21:00:00.059Z","end_date":"2137-08-14T21:00:00.496Z"})
});
app.post("/v4720_albums/getActiveAlbumConfig",(req,res)=>{
    res.status(204);
})
app.get("/v4720_challenges/getChallengesData",(req,res)=>{
    res.json({});
})
app.get("/v4720_player/getRegionInfo",(req,res)=>{
    res.json({"Country":"US","Region":"CA","AgeGateLimit":13,"HasAgeGate":true,"IsBlocked":false});
})
app.get("/v4720_player/login", (req, res) => {
    const userid = buffer.from((req.headers['x-forwarded-for'] || req.socket.remoteAddress)+req.headers['Host']).toString('base64');;
    database.getUserData(userid, (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Server blew up...' });
            return;
        }
        log(`User ${data.GeneralData.Nickname} has logged in`)
        res.json(data);
    });
});

app.get("/v4720_userSettings/time",(req,res)=>{
    res.send("\"Tue, 30 Jul 2024, 19:50:25\"");
})
app.get("/v4720_leaderboards/getLeaderboardsData",(req,res)=>{
    res.json({});
})
app.get("/v4720_battlePass/refreshBattlePass",(req,res)=>{
    res.json({"Seasons":{},"XPBankData":{"LastXPRefreshTimestamp":1696783346662,"XPLeft":-480}});
})
app.get("/v4720_friends",(req,res)=>{
    res.json({"Friends": []});
})
app.get("/v4720_friends/friendData",(req,res)=>{
    res.json({});
})
app.post("/v4720_player/emotes/character/update", (req, res) => {
    const token = buffer.from((req.headers['x-forwarded-for'] || req.socket.remoteAddress)+req.headers['Host']).toString('base64');;
    database.getUserData(token, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Failed to retrieve user data' });
            return;
        }
        try {
            const emotes = JSON.parse(req.body.emotes).data;
            if (!Array.isArray(emotes)) {
                return res.status(400).send({ error: 'Invalid emotes data' });
            }

            let newemotes = [...emotes.slice(0, 8), ...Array(8).fill(null)].slice(0, 8);
            data.Skins.EquippedEmotes = newemotes;

            database.updateUserData(token, data, (err) => {
                if (err) {
                    res.status(500).send({ error: 'Failed to update emotes' });
                    return;
                }
                res.status(200).send('true');
                log(`User ${data.GeneralData.Nickname} has updated their emotes`);
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Failed to update emotes' });
        }
    });
});
app.post("/v4720_player/skins/character/equip/weapon", (req, res) => {
    const token = buffer.from((req.headers['x-forwarded-for'] || req.socket.remoteAddress)+req.headers['Host']).toString('base64');;
    database.getUserData(token, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Failed to retrieve user data' });
            return;
        }

        try {
            const pickaxe = JSON.parse(req.body.ids);
            if (!Array.isArray(pickaxe)) {
                return res.status(400).send({ error: 'Invalid pickaxe data' });
            }
            data.Skins.EquippedWeaponSkins = pickaxe;

            database.updateUserData(token, data, (err) => {
                if (err) {
                    res.status(500).send({ error: 'Failed to update pickaxe' });
                    return;
                }
                res.status(200).send(req.body.ids);
                log(`User ${data.GeneralData.Nickname} has updated their pickaxe`);
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Failed to update pickaxe' });
        }
    });
});

app.post("/v4720_champions/equip", (req, res) => {
    const token = buffer.from((req.headers['x-forwarded-for'] || req.socket.remoteAddress)+req.headers['Host']).toString('base64');;
    database.getUserData(token, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Failed to retrieve user data' });
            return;
        }

        const champion = req.body.championId;
        data.Champions.SelectedChampion = champion;

        database.updateUserData(token, data, (err) => {
            if (err) {
                res.status(500).send({ error: 'Failed to update champion' });
                return;
            }
            res.send("true");
        });
    });
});

app.get("/v4720_player/updateProgressAndStats", (req, res) => {
    const token = buffer.from((req.headers['x-forwarded-for'] || req.socket.remoteAddress)+req.headers['Host']).toString('base64');;
    database.getUserData(token, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Failed to retrieve user data' });
            return;
        }

        const matchSummary = JSON.parse(req.query.matchSummary);
        let trophies = calculateTrophies(matchSummary.Placement, 20, 4, 16);

        if (matchSummary.ModeName === "Showdown_Duos") {
            trophies += matchSummary.KillCount + matchSummary.TeamKills;
        }
        if (matchSummary.ModeName === "Showdown") {
            trophies += matchSummary.KillCount;
        }
        console.log("Given " + trophies + " trophies to player");

        if (matchSummary.MatchResult === "win") {
            if (matchSummary.ModeName === "Showdown_Duos") {
                data.GeneralData.Stats.Victories.Showdown_Duos++;
            }
            if (matchSummary.ModeName === "Showdown") {
                data.GeneralData.Stats.Victories.Showdown++;
            }
            if (matchSummary.ModeName === "1v1_Clash") {
                data.GeneralData.Stats.Victories["1v1_Clash"]++;
            }
        } else {
            if (matchSummary.ModeName === "Showdown_Duos") {
                data.GeneralData.Stats.Defeats.Showdown++;
            }
            if (matchSummary.ModeName === "Showdown") {
                data.GeneralData.Stats.Defeats.Showdown++;
            }
        }

        data.GeneralData.Stats.TotalKills += matchSummary.KillCount;
        data.GeneralData.Stats.TotalDeaths += matchSummary.DeathCount;
        data.RankRoad.AccountRoad.XP += trophies;
        if (data.RankRoad.AccountRoad.XP > data.RankRoad.AccountRoad.HighestXP)
            data.RankRoad.AccountRoad.HighestXP = data.RankRoad.AccountRoad.XP;

        database.updateUserData(token, data, (err) => {
            if (err) {
                res.status(500).send({ error: 'Failed to update user' });
                return;
            }
            res.json(data);
            log(`User ${data.GeneralData.Nickname} sent ${matchSummary.ModeName} result as ${matchSummary.MatchResult} with ${matchSummary.KillCount} kills and got ${trophies} trophies`);
        });
    });
});
app.post("/v4720_rankRoad/claimRoadReward", (req, res) => {
    const token = buffer.from((req.headers['x-forwarded-for'] || req.socket.remoteAddress)+req.headers['Host']).toString('base64');;
    database.getUserData(token, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Failed to retrieve user data' });
            return;
        }
        const rewardID = req.body.rewardID;
        const newReward = { "ProductID": rewardID };
        if (!data.RankRoad.AccountRoad.ClaimedRewards) {
            data.RankRoad.AccountRoad.ClaimedRewards = [];
        }

        const ChampionsJson = JSON.parse(fs.readFileSync("./Helpers/Champions.json", "utf-8")); 
        const EmotesJson = JSON.parse(fs.readFileSync("./Helpers/Emotes.json", "utf-8"));
        const WeaponSkins = JSON.parse(fs.readFileSync("./Helpers/WeaponSkins.json", "utf-8"));
        let claimedReward = {};
        if (rewardID.includes("lolbox")) {
            // handle box opening
            if(!rewardID.includes("lol.1v1.lolbox.mystery_champion"))
            {
                claimedReward = BoxesUtil.RandomBox(rewardID,data)
            } else {
                // random box
                if (data.Champions.OwnedChampions.length === ChampionsJson.length) {
                } else {
                    let rand = Math.floor(Math.random() * ChampionsJson.length);
                    while (data.Champions.OwnedChampions[ChampionsJson[rand]] != null) {
                        rand = Math.floor(Math.random() * ChampionsJson.length);
                    }
                    claimedReward.push({ "ProductID": ChampionsJson[rand], "RewardType": "Product", "Amount": 1 });
                    let name = ChampionsJson[rand];
                    data.Champions.OwnedChampions[name] = { "Level": 0 };
                    data.Champions.ChampionShards[name] = 0;
                }
            }
           
        } else {
            // handle normal response like gems
            claimedReward = [data.RankRoad.AccountRoad.AvailableRewards.find(reward => reward.ProductID === rewardID)];

            if (data.RankRoad.AccountRoad.AvailableRewards.find(reward => reward.RewardType === "LOLTokens")) {
                let lolTokensReward = data.RankRoad.AccountRoad.AvailableRewards.find(reward => reward.RewardType === "LOLTokens");
                data.GeneralData.LOLTokens += lolTokensReward.Amount;
            }

            if (data.RankRoad.AccountRoad.AvailableRewards.find(reward => reward.RewardType === "LOLCoins")) {
                let lolCoinsReward = data.RankRoad.AccountRoad.AvailableRewards.find(reward => reward.RewardType === "LOLCoins");
                data.GeneralData.HardCurrency += lolCoinsReward.Amount;
            }
        }

        data.RankRoad.AccountRoad.ClaimedRewards.push(newReward);

        database.updateUserData(token, data, (err) => {
            if (err) {
                res.status(500).send({ error: 'Failed to update rewards' });
                return;
            }
            log(`User ${data.GeneralData.Nickname} redeemed trophy road reward: ${rewardID}`);
            res.json(claimedReward);
        });
    });
});
app.post("/v4720_player/nickname", (req, res) => {
    const token = buffer.from((req.headers['x-forwarded-for'] || req.socket.remoteAddress)+req.headers['Host']).toString('base64');;
    const newnickname = req.body.nickname;
    database.getUserData(token, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Failed to retrieve user data' });
            return;
        }

        log(`User ${data.GeneralData.Nickname} has changed their nickname, ${data.GeneralData.Nickname} => ${newnickname}`);
        data.GeneralData.Nickname = newnickname;

        database.updateUserData(token, data, (err) => {
            if (err) {
                res.status(500).send({ error: 'Failed to update nickname' });
                return;
            }
            res.send('true');
        });
    });
});
app.post("/v4720_champions/upgrade",(req,res)=>{
    var champion = req.body.championId
    var levelsToAdd = req.body.levelsToAdd
    const token = buffer.from((req.headers['x-forwarded-for'] || req.socket.remoteAddress)+req.headers['Host']).toString('base64');;
    database.getUserData(token, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Failed to retrieve user data' });
            return;
        }
        // too bad, need to check if player actually has the champion
        var level = data.Champions.OwnedChampions[champion].Level;
        if(level == 0)
        {
            log(`${data.GeneralData.Nickname} upgraded ${champion} to level ${level + 1} which costs 25 shards`)
            data.Champions.OwnedChampions[champion].Level++;
            data.Champions.ChampionShards[champion]-=(level+1) * 25;
        } else {
            console.log(levelsToAdd)
            for(let i = 1; i <= levelsToAdd; i++)
                {
                    log(`${data.GeneralData.Nickname} upgraded ${champion} to level ${level+1} which costs ${(ShardsUtil.CalculateShards(level))} shards`)
                    data.Champions.OwnedChampions[champion].Level++;
                    data.Champions.ChampionShards[champion]-=(ShardsUtil.CalculateShards(level));
                    level = data.Champions.OwnedChampions[champion].Level;
                }
        }
        database.updateUserData(token, data, (err) => {
            if (err) {
                res.status(500).send({ error: 'Failed to update data' });
                return;
            }
            res.send('true');
        });
    })
})
app.post("/v4720_product/coinPurchase",(req,res)=>{
    const token = buffer.from((req.headers['x-forwarded-for'] || req.socket.remoteAddress)+req.headers['Host']).toString('base64');;
    database.getUserData(token, (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Failed to retrieve user data' });
            return;
        }
        let cost = req.body.cost
        let id = req.body.id
        let currency = req.body.currencyType;
        if(currency == "LT") // gems aka LOL Tokens
        {
            data.GeneralData.LoLTokens-=cost;
        }
        database.updateUserData(token, data, (err) => {
            if (err) {
                res.status(500).send({ error: 'Failed to update rewards' });
                return;
            }
            log(`User ${data.GeneralData.Nickname} bought ${id} for ${cost} LOL Tokens`);
            res.json(BoxesUtil.RandomBox(id,data))
        });
    })
})
app.listen(3551);