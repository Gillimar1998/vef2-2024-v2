const MAX_TEAMS = 12;
export async function calcstada(games, limit = MAX_TEAMS){
    const stada = {};
    games.forEach(game => {
        const {home, away} = game;

        if (!stada[home.name]){
            stada[home.name] = {stig:0, skorad:0, morkASig:0, total:0}
        }
        if (!stada[away.name]){
            stada[away.name] = {stig:0, skorad:0, morkASig:0, total:0}
        }

        stada[home.name].skorad += home.score;
        stada[home.name].morkASig += away.score;
        stada[away.name].skorad += away.score;
        stada[away.name].morkASig += home.score;
        
        stada[away.name].total = stada[away.name].skorad - stada[away.name].morkASig;
        stada[home.name].total = stada[home.name].skorad - stada[home.name].morkASig;

        if(home.score > away.score){
            stada[home.name].stig += 3;
        } else if(home.score < away.score){
            stada[away.name].stig += 3;
        } else{
            stada[home.name].stig += 1;
            stada[away.name].stig += 1;
        }
    });
    const stadaArray = Object.keys(stada).map(teamName => ({
        name: teamName,
        skorad: stada[teamName].skorad,
        morkASig: stada[teamName].morkASig,
        total: stada[teamName].total,
        stig: stada[teamName].stig
      })).sort((a, b) => b.stig - a.stig || (b.total - a.total)).slice(0, limit);
      
    return stadaArray;
}