import express from 'express';
import passport from 'passport';
import { validationResult } from 'express-validator';
import { getGames, getTeams, insertGame, deleteGame } from '../lib/db.js';
import { ensureLoggedIn, skraValidation } from '../lib/validation.js';



export const adminRouter = express.Router();

async function loginRoute(req, res) {
  const {failureMessage} = req.session;
  delete req.session.failureMessage;
  return res.render('login', {
    title: 'Innskráning',
    failureMessage,

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
  const { Dagsetning, homeName, homeScore, awayScore, awayName } = req.body;

  insertGame(Dagsetning, homeName, homeScore, awayScore, awayName)
    .then(() => res.redirect('/admin'))
    .catch(next);
}


function utskraRoute(req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
    return null;
  });
}

adminRouter.get('/logout', utskraRoute);
adminRouter.get('/login', loginRoute);
adminRouter.get('/admin', ensureLoggedIn, adminRoute);
adminRouter.post('/insert-game', ensureLoggedIn, skraValidation(), async (req, res, next) => {

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
      teams,
      games,
      formData: req.body,
    })
  }
  next();
  return null;
} ,skraRouteInsert);

adminRouter.post('/delete-game',ensureLoggedIn, async (req, res) => {
  const {gameId} = req.body;

  const teams = await getTeams();
  const games = await getGames();

  try{
    await deleteGame(gameId);
    res.redirect('/admin',)
  }catch(error){
    console.error('Villa við að eyða leik', error);
    res.render('/admin',{
      title: 'Umsjónarsíða',
      errors: [],
      errorMessage: 'Ekki var hægt að eyða leik, reynið aftur síðar',
      user: req.user ?? null,
      loggedIn: req.isAuthenticated(),
      teams,
      games,
      formData: req.body,
    })
  }
  return null;
})

adminRouter.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.session.failureMessage = 'Notandanafn eða lykilorð vitlaust.';
      return res.redirect('/login');
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      return res.redirect('/admin');
    });
    return null;
  })(req, res, next);
});
