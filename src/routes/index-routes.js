import express from 'express';
import { getGames} from '../lib/db.js';
import { calcstada } from '../lib/stada.js';

export const indexRouter = express.Router();

async function indexRoute(req, res) {

  const user = req.user ?? null;
  const loggedIn = req.isAuthenticated();
  const games = await getGames(5);
  const gamesall = await getGames();

  const stada = await calcstada(gamesall, 3);

  return res.render('index', {
    title: 'Forsíða',
    games,
    stada,
    user,
    loggedIn,
  });
}

async function leikirRoute(req, res) {
  const games = await getGames();

  const user = req.user ?? null;
  const loggedIn = req.isAuthenticated();


  return res.render('leikir', {
    title: 'Leikir',
    games,
    user,
    loggedIn,
  });
}

async function stadaRoute(req, res) {

  const games = await getGames();

  const user = req.user ?? null;
  const loggedIn = req.isAuthenticated();

  const stada = await calcstada(games)

  return res.render('stada', {
    title: 'Staðan',
    stada,
    user,
    loggedIn,
  });
}

indexRouter.get('/', indexRoute);
indexRouter.get('/leikir', leikirRoute);
indexRouter.get('/stada', stadaRoute);
