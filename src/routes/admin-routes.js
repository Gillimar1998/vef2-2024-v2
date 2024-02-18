import express from 'express';
import passport from 'passport';
import { getGames, insertGame, deleteGame } from '../lib/db.js';
import { getTeams } from '../lib/db.js';
import { ensureLoggedIn, skraValidation } from '../lib/validation.js';
import { validationResult } from 'express-validator';


export const adminRouter = express.Router();

async function loginRoute(req, res) {
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
    errorMessage: null,
    user,
    loggedIn,
    teams,
    games,
    errors: [],
    formData: req.body,
  });
}



function skraRouteInsert(req, res, next) {
  // TODO mjög hrátt allt saman, vantar validation!
  const { Dagsetning, home_name, home_score, away_score, away_name } = req.body;

  const result = insertGame(Dagsetning, home_name, home_score, away_score, away_name);

  

 res.redirect('/admin');
}


function utskraRoute(req, res){
  req.logout(function(err){
    if(err){return next(err);}
    res.redirect('/')
  })
}

adminRouter.get('/logout', utskraRoute);
adminRouter.get('/login', loginRoute);
adminRouter.get('/admin', ensureLoggedIn, adminRoute);
adminRouter.post('/admin', ensureLoggedIn, skraValidation(), async (req, res, next) => {

  const errors = validationResult(req);
  const teams = await getTeams();
  const games = await getGames();

  if (!errors.isEmpty()) {
    return res.render('admin', {
      title: 'Umsjónarsíða',
      errors: errors.array(),
      errorMessage: null,
      user: req.user ?? null,
      loggedIn: req.isAuthenticated(),
      teams: teams,
      games: games,
      formData: req.body,
    })
  }
  next();
} ,skraRouteInsert);

adminRouter.post('/delete-game', async (req, res) => {
  const {gameId} = req.body;


  try{
    await deleteGame(gameId);
    res.redirect('/admin')
  }catch(error){
    console.error('Villa við að eyða leik', error);
    res.render('/admin',{
      title: 'Umsjónarsíða',
      errors: [],
      errorMessage: 'Ekki var hægt að eyða leik, reynið aftur síðar',
      user: req.user ?? null,
      loggedIn: req.isAuthenticated(),
      teams: teams,
      games: games,
      formData: req.body,
    })
  }
  
})

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
