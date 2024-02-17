import express from 'express';
import passport from 'passport';
import { getGames, insertGame } from '../lib/db.js';
import { getTeams } from '../lib/db.js';

export const adminRouter = express.Router();

async function indexRoute(req, res) {
  return res.render('login', {
    title: 'Innskráning',
  });
}

async function adminRoute(req, res) {
  const user = req.user ?? null;
  const loggedIn = req.isAuthenticated();
  const teams = await getTeams();
  const games = await getGames();

  return res.render('admin', {
    title: 'Umsjónarsíða',
    user,
    loggedIn,
    teams,
    games,
  });
}

// TODO færa á betri stað
// Hjálpar middleware sem athugar hvort notandi sé innskráður og hleypir okkur
// þá áfram, annars sendir á /login
function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/login');
}

function skraRouteInsert(req, res, next) {
  // TODO mjög hrátt allt saman, vantar validation!
  const { home_name, home_score, away_score, away_name } = req.body;

  const result = insertGame(home_name, home_score, away_score, away_name);

  

 // res.redirect('/leikir');
}


function utskraRoute(req, res){
  req.logout(function(err){
    if(err){return next(err);}
    res.redirect('/')
  })
}

adminRouter.get('/logout', utskraRoute);
adminRouter.get('/login', indexRoute);
adminRouter.get('/admin', ensureLoggedIn, adminRoute);
adminRouter.post('/admin', ensureLoggedIn,skraRouteInsert);

adminRouter.post(
  '/login',

  // Þetta notar strat að ofan til að skrá notanda inn
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/login',
  }),

  // Ef við komumst hingað var notandi skráður inn, senda á /admin

  (req, res) => {
    res.redirect('/admin');
  },
);
