const express = require("express");
const router = express.Router();
const passport = require("../helpers/passportInitializer");

router.use(passport.session());

// Require controller modules
const navigation_controller = require("../controllers/navigationController");
const auth_controller = require("../controllers/authController");
const flow_controller = require("../controllers/flowController");

// Pages
router.get("/", navigation_controller.home);
router.get("/sign-up", navigation_controller.signup);

// Google login API
router.get("/login/federated/google", auth_controller.loginFederatedGoogle);
router.get("/oauth2/redirect/google", auth_controller.redirectGoogle);
router.get("/redirect", auth_controller.redirectFrontend);

// Password login API
router.post("/login/password", auth_controller.loginPassword);

// Check login status API
router.get("/check-login", auth_controller.checkLogin);

// Logout API
router.get("/log-out", auth_controller.logout);

// SignUp API
router.post("/sign-up", auth_controller.signUp);

// Add new flow
router.post("/new-flow", flow_controller.create_flow);

// Show user's flows
router.get("/flows", flow_controller.flow_list);

// Get a single flow
router.get("/get-flow", flow_controller.get_flow);

// Delete a flow
router.get("/delete-flow", flow_controller.delete_flow);

// Update a flow
router.put("/update-flow", flow_controller.update_flow);

module.exports = router;
