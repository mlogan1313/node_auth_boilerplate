const jwt = require("jwt-simple");
const User = require("../models/user");
const config = require("../config");

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signin = function(req, res, next) {
  res.send({ token: tokenForUser(req.user) });
};

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res
      .status(422)
      .send({ error: "You must provider username and password" });
  }

  //check for existing email
  User.findOne({ email: email }, function(err, existingUser) {
    if (err) {
      return next(err);
    }

    //if exists, return Error
    if (existingUser) {
      return res.status(422).send({ error: "Email is in use" });
    }

    //if not exists, create and save user record
    const user = new User({
      email: email,
      password: password
    });

    user.save(function(err) {
      if (err) {
        return next(err);
      }
    });

    //respond to request
    res.json({ token: tokenForUser(user) });
  });
};
