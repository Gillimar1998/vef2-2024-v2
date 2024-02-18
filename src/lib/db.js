import pg from 'pg';
import { environment } from './environment.js';
import { logger } from './logger.js';

const env = environment(process.env, logger);

if (!env?.connectionString) {
  process.exit(-1);
}

const { connectionString } = env;

const pool = new pg.Pool({ 
  connectionString,
  client_encoding: 'UTF8'
 });

pool.on('error', (err) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});

export async function query(q, values = []) {
  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    console.error('unable to get client from pool', e);
    return null;
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    console.error('unable to query', e);
    console.info(q, values);
    return null;
  } finally {
    client.release();
  }
}
export async function getTeams() {
  const q = `
    SELECT
      *
    FROM
      teams
  `;

  const result = await query(q);

  const teams = [];

  if (result && (result.rows?.length ?? 0) > 0) {
    for (const row of result.rows) {
      const team = {
        id: row.id,
        name: row.name,
      };
      teams.push(team);
    }

    return teams;
  }

}
const MAX_GAMES = 100;
/**
 * get games from the database
 * @param {number} [limit=MAX_GAMES] Number of games to get
 * @returns {Promise<Import('../types.js').game[] | null>}
 */
export async function getGames(limit = MAX_GAMES) {
  const q = `
    SELECT
      games.id as id,
      date,
      home_team.name AS home_name,
      home_score,
      away_team.name AS away_name,
      away_score
    FROM
      games
    LEFT JOIN
      teams AS home_team ON home_team.id = games.home
    LEFT JOIN
      teams AS away_team ON away_team.id = games.away
    ORDER BY
      date DESC
    LIMIT $1
  `;

  const usedLimit = Math.min(limit > 0 ? limit : MAX_GAMES, MAX_GAMES)

  const result = await query(q, [usedLimit.toString()]);

  const games = [];
  /**@type Array<import('../types.js').game> */
  if (result && (result.rows?.length ?? 0) > 0) {
    for (const row of result.rows) {
      const game = {
        id: row.id,
        date: row.date,
        home: {
          name: row.home_name,
          score: row.home_score,
        },
        away: {
          name: row.away_name,
          score: row.away_score,
        },
      };
      games.push(game);
    }
    games.forEach(game => {
      game.date = new Intl.DateTimeFormat('is-IS', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(new Date(game.date));
    });

    return games;
  }
}


export function insertGame(dagsetning, home_name, home_score, away_score, away_name) {
  const q =
    'insert into games (date, home,  home_score, away_score, away) values ($1, $2, $3, $4, $5);';

  const result = query(q, [dagsetning, home_name, home_score, away_score, away_name]);
}

export async function end() {
  await pool.end();
}
