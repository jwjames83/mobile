import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import SignInScreen from "../screens/SignInScreen";
import {
  navigateSignUp,
  navigateDebugSettings,
  navigateForgotPassword,
} from "../actions/navigation";
import { authSignInAsync, authSignInReset } from "../actions/auth";

const mapStateToProps = state => ({
  signingIn: state.auth.signingIn,
  errorMessage: state.auth.errorMessage,
  version: state.appVersion,
  apiEnvironment: state.apiEnvironment,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      navigateSignUp,
      navigateDebugSettings,
      authSignInReset,
      authSignInAsync,
      navigateForgotPassword,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(SignInScreen);
