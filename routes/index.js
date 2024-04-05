const express = require("express");
const router = express.Router();
const passport = require("../helpers/passportInitializer");

router.use(passport.session());

// Require controller modules
const navigation_controller = require("../controllers/navigationController");

// Pages
router.get("/", navigation_controller.home);
router.get("/sign-up", navigation_controller.signup);

// Google login API
router.get(
  "/login/federated/google",
  navigation_controller.loginFederatedGoogle
);
router.get("/oauth2/redirect/google", navigation_controller.redirectGoogle);
router.get("/redirect", navigation_controller.redirectFrontend);

// Password login API
router.post("/login/password", navigation_controller.loginPassword);

// Check login status API
router.get("/check-login", navigation_controller.checkLogin);

// Logout API
router.get("/log-out", navigation_controller.logout);

// SignUp API
router.post("/sign-up", navigation_controller.signUp);

module.exports = router;
