const express = require("express");
const { verifyToken } = require("../middlewares/jwtTokenverification");
const router = express.Router();
const {
  userLogin,
  userRegistration,
  phoneVerification,
  OTPLOGIN,
  verifyOTP,
  GetUserDeatilse,
  UpdateUserCridentails,
  ChangePassword
} = require("../usercontrolls/authuserControlls");

router.route("/login").post(userLogin);
router.route("/register").post(userRegistration);
router.route("/phone-verification").post(phoneVerification);
router.route("/otp-login").post(OTPLOGIN);
router.route("/otp-verification").post(verifyOTP);
router.route("/get-user").post( GetUserDeatilse);
router.route("/updated-userDeatails").patch(verifyToken, UpdateUserCridentails);
router.route("/change-password").patch(verifyToken,ChangePassword);

module.exports = router;
