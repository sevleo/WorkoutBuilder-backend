const express = require("express");
const router = express.Router();
const passport = require("../helpers/passportInitializer");

router.use(passport.session());

// Require controller modules
const navigation_controller = require("../controllers/navigationController");

router.get("/", navigation_controller.home);
router.get("/sign-up", navigation_controller.signup);
router.get(
  "/login/federated/google",
  navigation_controller.loginFederatedGoogle
);
router.get("/oauth2/redirect/google", navigation_controller.redirectGoogle);
router.get("/redirect", navigation_controller.redirectFrontend);
router.post("/login/password", navigation_controller.loginPassword);
router.get("/check-login", navigation_controller.checkLogin);
router.get("/log-out", navigation_controller.logout);
router.post("/sign-up", navigation_controller.signUp);

module.exports = router;
