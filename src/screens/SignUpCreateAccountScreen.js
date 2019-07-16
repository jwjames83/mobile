import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import glamorous, { ThemeProvider } from "glamorous-native";

import PrimaryTheme from "../themes/PrimaryTheme";
import ButtonFlow from "../components/ButtonFlow";
import TextSignUpMidTitle from "../components/TextSignUpMidTitle";

const styles = StyleSheet.create({
  bottom: {
    flex: 1,
    justifyContent: "flex-end",
  },
  inputContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ededed",
    borderRadius: 4,
    marginBottom: 20,
  },
  input: {
    color: "#6582ff",
    fontSize: 14,
    paddingTop: 16,
    paddingLeft: 16,
  },
});

class SignUpCreateAccountScreen extends PureComponent {
  theme = PrimaryTheme;
  state = {};

  onPressContinue = () => {
    const { navigateSignUpTermsOfUse } = this.props;
    navigateSignUpTermsOfUse();
  };

  render() {
    return (
      <ThemeProvider theme={this.theme}>
        <glamorous.View
          flex={1}
          backgroundColor={this.theme.colors.lightBackground}
        >
          <StatusBar barStyle="light-content" />
          <SafeAreaView flex={1} justifyContent="space-between" margin={16}>
            <TextSignUpMidTitle title="See all your diabetes data in one place." />

            <glamorous.View style={styles.inputContainer}>
              <glamorous.TextInput
                style={styles.input}
                placeholder="Full Name"
              />
            </glamorous.View>

            <glamorous.View style={styles.inputContainer}>
              <glamorous.TextInput style={styles.input} placeholder="Email" />
            </glamorous.View>

            <glamorous.View style={styles.inputContainer}>
              <glamorous.TextInput
                style={styles.input}
                placeholder="Password"
              />
            </glamorous.View>

            <glamorous.View style={styles.inputContainer}>
              <glamorous.TextInput
                style={styles.input}
                placeholder="Confirm Password"
              />
            </glamorous.View>

            <glamorous.View style={styles.bottom}>
              <ButtonFlow title="Continue" onPress={this.onPressContinue} />
            </glamorous.View>
          </SafeAreaView>
        </glamorous.View>
      </ThemeProvider>
    );
  }
}

SignUpCreateAccountScreen.propTypes = {
  navigateSignUpTermsOfUse: PropTypes.func.isRequired,
};

export default SignUpCreateAccountScreen;
