import { json } from "express"

const TeamID = {
    "Boltaliðið": 1,
    "Dripplararnir": 2,
    "Skotföstu kempurnar": 3,
    "Markaskorarnir": 4,
    "Sigurliðið": 5,
    "Risaeðlurnar": 6,
    "Framherjarnir": 7,
    "Fljótu fæturnir": 8,
    "Vinningshópurinn": 9,
    "Ósigrandi skotfólkið": 10,
    "Óhemjurnar": 11,
    "Hraðaliðið": 12,
}

function jsonISqlCommand(jsondata, TeamID){
    const {date, games} = jsondata;
    const commands = games.map(game =>{
        const homeId = TeamID[game.home.name];
        const awayId = TeamID[game.away.name];
        const homeScore = game.home.score;
        const awayScore = game.away.score;
        return `INSERT INTO games (date, home, away, home_score, away_score) VALUES ('${date}', ${homeId}, ${awayId}, ${homeScore}, ${awayScore});`;
    });
    return commands
}

const jsondata =  {
    "date": "2024-02-23T15:20:53.955Z",
    "games": [
      {
        "home": {
          "name": "Óhemjurnar",
          "score": 4
        },
        "away": {
          "name": "Markaskorarnir",
          "score": 0
        }
      },
      {
        "home": {
          "name": "Boltaliðið",
          "score": 4
        },
        "away": {
          "name": "Ósigrandi skotfólkið",
          "score": 3
        }
      },
      {
        "home": {
          "name": "Dripplararnir",
          "score": 4
        },
        "away": {
          "name": "Risaeðlurnar",
          "score": 5
        }
      },
      {
        "home": {
          "name": "Skotföstu kempurnar",
          "score": 1
        },
        "away": {
          "name": "Sigurliðið",
          "score": 1
        }
      },
      {
        "home": {
          "name": "Fljótu fæturnir",
          "score": 1
        },
        "away": {
          "name": "Framherjarnir",
          "score": 1
        }
      },
      {
        "home": {
          "name": "Vinningshópurinn",
          "score": 0
        },
        "away": {
          "name": "Hraðaliðið",
          "score": 4
        }
      }
    ]
  };
  const sqlcommands = jsonISqlCommand(jsondata, TeamID);
  console.log(sqlcommands.join('\n'));
