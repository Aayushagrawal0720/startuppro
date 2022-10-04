const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    return next();
  }
  return res.redirect("/login/startup");
};

const isStartupLoggedIn = (req, res, next) => {
  if (req.session.isAuth) {
    return res.redirect("/startup/profile");
  }
  return next();
};

const isUserAuth = (req, res, next) => {
  if (req.session.isAuthUser) {
    return next();
  }
  return res.redirect("/login/member");
};

const isUserLoggedIn = (req, res, next) => {
  if (req.session.isAuthUser) {
    return res.redirect("/member/profile");
  }
  return next();
};

const isCAAuth = (req, res, next) => {
  if (req.session.isAuthCA) {
    return next();
  }
  return res.redirect("/login/ca");
};

const isCALoggedIn = (req, res, next) => {
  if (req.session.isAuthCA) {
    return res.redirect("/ca/profile");
  }
  return next();
};

const isMentorAuth = (req, res, next) => {
  if (req.session.isAuthMentor) {
    return next();
  }
  return res.redirect("/login/mentor");
};

const isMentorLoggedIn = (req, res, next) => {
  if (req.session.isAuthMentor) {
    return res.redirect("/mentor/profile");
  }
  return next();
};

const isDeveloperLoggedIn = (req, res, next) => {
  if(req.session.isAuthDeveloper)
    return res.redirect("/getdata/admin");
  
  return next();
}

const middlewareFuncs = {
  isAuth: isAuth,
  isStartupLoggedIn: isStartupLoggedIn,
  isUserAuth: isUserAuth,
  isUserLoggedIn: isUserLoggedIn,
  isCAAuth: isCAAuth,
  isCALoggedIn: isCALoggedIn,
  isMentorAuth: isMentorAuth,
  isMentorLoggedIn: isMentorLoggedIn
};

module.exports = middlewareFuncs;
