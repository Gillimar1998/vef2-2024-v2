import { body } from 'express-validator';

export function skraValidation() {
  return [
    body('Dagsetning')
    .isISO8601().withMessage('Ógild dagsetning')
    .custom((value) => {
        const input = new Date(value);
        const now = new Date;
        
        if(input > now){
            throw new Error('Ekki hægt að skrá leiki fram í tíman')
        }else{
            return true;
        }
    })
    .custom((value) =>{
      const input = new Date(value);
        const now = new Date;
        const twoMonths = new Date(now);
        twoMonths.setMonth(now.getMonth()-2);
        
        if(input< twoMonths){
          throw new Error('Ekki hægt að skrá leiki eldri en tveggja mánaða')
        }else{
          return true;
        }
    }),
    body('home_name')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Heima lið má ekki vanta'),
    body('away_name')
      .trim()
      .isLength({ min: 1 })
      .withMessage('úti lið má ekki vanta')
      .custom((value,{req}) =>{
        if (value === req.body.home_name){
            throw new Error('Heima og úti lið mega ekki vera það sama');
        }else{
            return true
        }
      }),
    body('home_score')
      .notEmpty()
      .withMessage('Vantar Mörk')
      .bail()
      .isInt({ min: 0 })
      .withMessage('Mörk geta ekki verið neikvæð'),
      
    body('away_score')
    .notEmpty()
      .withMessage('Vantar Mörk')
      .bail()
      .isInt({ min: 0 })
      .withMessage('Mörk geta ekki verið neikvæð'),
  ];
}

// Viljum keyra sér og með validation, ver gegn „self XSS“
export function xssSanitizationMiddleware(textField) {
  return [
    body('name').customSanitizer((v) => xss(v)),
    body('location').customSanitizer((v) => xss(v)),
    body('url').customSanitizer((v) => xss(v)),
    body(textField).customSanitizer((v) => xss(v)),
  ];
}

export function sanitizationMiddleware(textField) {
  return [
    body('name').trim().escape(),
    body(textField).trim().escape(),
    body('location').trim().escape(),
    body('url').trim().escape(),
  ];
}

// Hjálpar middleware sem athugar hvort notandi sé innskráður og hleypir okkur
// þá áfram, annars sendir á /login
export function ensureLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
  
    return res.redirect('/login');
  }