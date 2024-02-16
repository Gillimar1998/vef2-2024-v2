import express from 'express';
import { getGames } from '../lib/db.js';

export const indexRouter = express.Router();

async function indexRoute(req, res) {

  const user = req.user ?? null;
  const loggedIn = req.isAuthenticated();
  const games = await getGames(5);
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
  return res.render('index', {
    title: 'Forsíða',
    games,
    user,
    loggedIn,
  });
}

async function leikirRoute(req, res) {
  const games = await getGames();

  const user = req.user ?? null;
  const loggedIn = req.isAuthenticated();

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

  return res.render('leikir', {
    title: 'Leikir',
    games,
    user,
    loggedIn,
  });
}

async function stadaRoute(req, res) {

  const user = req.user ?? null;
  const loggedIn = req.isAuthenticated();

  return res.render('stada', {
    title: 'Staðan',
    user,
    loggedIn,
  });
}

indexRouter.get('/', indexRoute);
indexRouter.get('/leikir', leikirRoute);
indexRouter.get('/stada', stadaRoute);
