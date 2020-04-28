import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import {
  ActivityIndicator,
  Alert,
  ProgressViewIOS,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ThemeProvider } from "glamorous-native";

import PrimaryTheme from "../themes/PrimaryTheme";
import { TPNativeHealth } from "../models/TPNativeHealth";
import Button from "../components/Button";

import Colors from "../constants/Colors";

const ACTIVITY_INDICATOR_VIEW_HEIGHT = 62;

const styles = StyleSheet.create({
  headerRight: {
    padding: 10,
    marginRight: 6,
  },
  introView: {
    padding: 20,
  },
  introSyncPrimaryText: {
    width: 275,
    paddingTop: 20,
    alignSelf: "center",
    textAlign: "center",
    ...PrimaryTheme.healthSyncTextPrimary,
  },
  introInitialSyncSecondaryText: {
    width: 275,
    paddingTop: 20,
    alignSelf: "center",
    textAlign: "center",
    ...PrimaryTheme.healthSyncTextSecondary,
  },
  introManualSyncSecondaryText: {
    paddingTop: 20,
    paddingBottom: 40,
    alignSelf: "center",
    textAlign: "center",
    ...PrimaryTheme.healthSyncTextSecondary,
  },
  syncProgressText: {
    marginTop: 10,
    alignSelf: "center",
    ...PrimaryTheme.healthSyncTextSecondary,
  },
  syncProgressView: {
    padding: 10,
    width: 300,
    alignSelf: "center",
  },
  syncProgressExplanation: {
    width: 300,
    alignSelf: "center",
    paddingBottom: 20,
    ...PrimaryTheme.healthSyncTextSecondary,
  },
});

class HealthSyncScreen extends PureComponent {
  static navigationOptions = ({
    navigation: {
      state: {
        params: { isInitialSync },
      },
    },
  }) => {
    const headerStyle = { backgroundColor: Colors.darkPurple };
    return {
      drawerLockMode: "locked-closed",
      headerStyle,
      headerTintColor: "white",
      headerTitle: (
        <Text
          style={PrimaryTheme.screenHeaderTitleStyle}
          allowFontScaling={false}
          numberOfLines={1}
        >
          {isInitialSync ? "Initial Sync" : "Manual Sync"}
        </Text>
      ),
      headerRight: <View style={styles.headerRight} />,
    };
  };

  state = {
    shouldShowSyncStatus: false,
  };

  componentDidMount() {
    const {
      healthStateSet,
      health: { isUploadingHistorical, isHistoricalUploadPending },
    } = this.props;

    TPNativeHealth.setHasPresentedSyncUI();
    healthStateSet({
      hasPresentedSyncUI: true,
    });

    if (isUploadingHistorical || isHistoricalUploadPending) {
      this.setState({
        shouldShowSyncStatus: true,
      });
    }
  }

  /* eslint-disable react/no-did-update-set-state */
  componentDidUpdate() {
    const {
      health: { isUploadingHistorical, isHistoricalUploadPending },
    } = this.props;

    if (isUploadingHistorical || isHistoricalUploadPending) {
      this.setState({
        shouldShowSyncStatus: true,
      });
    }
  }
  /* eslint-enable react/no-did-update-set-state */

  onPressCancelOrContinue = () => {
    const {
      navigateGoBack,
      health: { isUploadingHistorical, isHistoricalUploadPending },
    } = this.props;

    if (isUploadingHistorical || isHistoricalUploadPending) {
      Alert.alert("Stop Syncing?", null, [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            TPNativeHealth.stopUploadingHistoricalAndReset();
            navigateGoBack();
          },
        },
      ]);
    } else {
      navigateGoBack();
    }
  };

  onPressSync = () => {
    TPNativeHealth.startUploadingHistorical();

    this.setState({
      shouldShowSyncStatus: true,
    });
  };

  static renderBulletedTextView(text) {
    return (
      <View style={{ flexDirection: "row" }}>
        <Text style={PrimaryTheme.healthSyncTextSecondary}>{"\u2022"}</Text>
        <Text
          style={{
            ...PrimaryTheme.healthSyncTextSecondary,
            flex: 1,
            paddingLeft: 5,
          }}
        >
          {text}
        </Text>
      </View>
    );
  }

  renderSyncProgressBarOrSpinner() {
    const {
      health: {
        isInterfaceOn,
        isHistoricalUploadPending,
        historicalUploadTotalSamples,
        historicalTotalSamplesCount,
        isUploadingHistorical,
        turnOffHistoricalUploaderReason,
      },
    } = this.props;

    if (isHistoricalUploadPending) {
      return (
        <ActivityIndicator
          style={{
            height: ACTIVITY_INDICATOR_VIEW_HEIGHT,
            alignSelf: "center",
          }}
          size="large"
          color={PrimaryTheme.colors.activityIndicator}
          animating
        />
      );
    } else if (
      isInterfaceOn &&
      (isUploadingHistorical || turnOffHistoricalUploaderReason) &&
      historicalTotalSamplesCount > 0
    ) {
      let progress = 0;
      if (
        (isUploadingHistorical || turnOffHistoricalUploaderReason) &&
        historicalTotalSamplesCount > 0
      ) {
        progress = historicalUploadTotalSamples / historicalTotalSamplesCount;
      }

      return (
        <ProgressViewIOS
          progressTintColor={PrimaryTheme.progressTintColor}
          trackTintColor={PrimaryTheme.trackTintColor}
          progress={progress}
          visible={false}
        />
      );
    }
    return null;
  }

  renderSyncProgress() {
    const {
      health: {
        isUploadingHistorical,
        isHistoricalUploadPending,
        historicalUploadTotalSamples,
        historicalUploadCurrentDay,
        historicalTotalDaysCount,
        isUploadingHistoricalRetry,
        turnOffHistoricalUploaderReason,
        turnOffHistoricalUploaderError,
        interfaceTurnedOffError,
        isInterfaceOn,
      },
      isOffline,
    } = this.props;

    let syncProgressText = "";
    let syncErrorText = "";
    if (isInterfaceOn) {
      const useDaysProgress = false;
      if (isOffline) {
        syncProgressText = "Upload paused while offline.";
      } else if (isHistoricalUploadPending) {
        syncProgressText = ""
      } else if (isUploadingHistorical || turnOffHistoricalUploaderReason) {
        if (useDaysProgress) {
          if (historicalUploadCurrentDay > 0) {
            syncProgressText = `Day ${historicalUploadCurrentDay.toLocaleString()} of ${historicalTotalDaysCount.toLocaleString()}`;
          }
        } else if (historicalUploadTotalSamples > 0) {
            syncProgressText = `Uploaded ${historicalUploadTotalSamples.toLocaleString()} items`;
        }
        if (isUploadingHistoricalRetry) {
          if (syncProgressText) {
            syncErrorText = "Retrying";
          } else {
            syncProgressText = "Retrying";
          }
        } else if (turnOffHistoricalUploaderReason) {
          if (
            turnOffHistoricalUploaderReason === "complete" &&
            historicalUploadTotalSamples === 0
          ) {
            syncProgressText = "No data available to upload.";
          } else if (syncProgressText) {
              syncErrorText = turnOffHistoricalUploaderError;
            } else {
              syncProgressText = turnOffHistoricalUploaderError;
            }
          }
        }
    } else {
      syncProgressText = interfaceTurnedOffError;
    }

    // Ensure that the text contents has at least the numberOfLines specified in
    // the text so that enough space is reserved in layout regardless of text
    // contents so that layout doesn't jump around
    syncProgressText = `${syncProgressText}\n `;
    syncErrorText = `${syncErrorText}\n \n \n \n `;

    return (
      <View style={styles.syncProgressView}>
        {this.renderSyncProgressBarOrSpinner()}
        <View>
          <Text style={styles.syncProgressText} numberOfLines={1}>
            {syncProgressText}
          </Text>
        </View>
        <View>
          <Text style={styles.syncProgressText} numberOfLines={4}>
            {syncErrorText}
          </Text>
        </View>
      </View>
    );
  }

  renderSyncStatus() {
    const {
      health: {
        isUploadingHistorical,
        isHistoricalUploadPending,
        isTurningInterfaceOn,
        turnOffHistoricalUploaderReason,
      },
    } = this.props;

    let primaryText = "";
    let syncProgressExplanation =
      "Please stay on this screen and keep your phone unlocked while we sync.";
    let buttonTitle = "Continue";

    if (isTurningInterfaceOn || isHistoricalUploadPending) {
      primaryText = "Preparing to upload";
      buttonTitle = "Cancel";
    } else if (isUploadingHistorical) {
      primaryText = "Syncing Now";
      buttonTitle = "Cancel";
    } else if (turnOffHistoricalUploaderReason === "complete") {
      primaryText = "Sync Complete";
      syncProgressExplanation = "";
    } else if (turnOffHistoricalUploaderReason === "error") {
      primaryText = `Sync Error`;
      syncProgressExplanation = "";
    }

    // Ensure that the text contents has at least the numberOfLines specified in
    // the text so that enough space is reserved in layout regardless of text
    // contents so that layout doesn't jump around
    syncProgressExplanation = `${syncProgressExplanation}\n \n `;

    return (
      <>
        <View style={styles.introView}>
          <Text style={styles.introSyncPrimaryText}>{primaryText}</Text>
        </View>
        {this.renderSyncProgress()}
        <View>
          <Text style={styles.syncProgressExplanation} numberOfLines={2}>
            {syncProgressExplanation}
          </Text>
          <Button
            containerStyle={{ margin: 10 }}
            title={buttonTitle}
            textStyle={PrimaryTheme.toolTipContentButtonTextStyle}
            onPress={this.onPressCancelOrContinue}
          />
        </View>
      </>
    );
  }

  renderInitialSyncIntro() {
    return (
      <>
        <View style={styles.introView}>
          <Text style={styles.introSyncPrimaryText}>
            {`Make Tidepool even\nbetter with Apple Health.`}
          </Text>
          <Text style={styles.introInitialSyncSecondaryText}>
            Automatically sync your diabetes data from your phone to Tidepool.
          </Text>
          <Text style={styles.introManualSyncSecondaryText}>
            We suggest using a manual sync if you are having trouble seeing your
            diabetes data in Tidepool Mobile or on the web.
          </Text>
        </View>
        <View>
          <Button
            containerStyle={{ margin: 10 }}
            title="Sync Health Data"
            textStyle={PrimaryTheme.toolTipContentButtonTextStyle}
            onPress={this.onPressSync}
          />
        </View>
      </>
    );
  }

  renderManualSyncIntro() {
    return (
      <>
        <View style={styles.introView}>
          <Text style={styles.introSyncPrimaryText}>Manual Health Sync</Text>
          <Text style={styles.introManualSyncSecondaryText}>
            We suggest using a manual sync if you are having trouble seeing your
            diabetes data in Tidepool Mobile or on the web.
          </Text>
          <Text style={PrimaryTheme.healthSyncTextSecondary}>
            Before syncing:
          </Text>
          {HealthSyncScreen.renderBulletedTextView("Open the Health app")}
          {HealthSyncScreen.renderBulletedTextView("Tap the Sources tab")}
          {HealthSyncScreen.renderBulletedTextView("Tap Tidepool")}
          {HealthSyncScreen.renderBulletedTextView(
            "Turn on any switches you want to sync with Tidepool (blood glucose, nutrition, insulin, etc)"
          )}
        </View>
        <View>
          <Button
            containerStyle={{ margin: 10 }}
            title="Sync Health Data"
            textStyle={PrimaryTheme.toolTipContentButtonTextStyle}
            onPress={this.onPressSync}
          />
        </View>
      </>
    );
  }

  render() {
    const { isInitialSync } = this.props;
    const { shouldShowSyncStatus } = this.state;

    const shouldShowInitialSyncIntro = !shouldShowSyncStatus && isInitialSync;
    const shouldShowManualSyncIntro = !shouldShowSyncStatus && !isInitialSync;

    return (
      <ThemeProvider theme={PrimaryTheme}>
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: "space-between",
            backgroundColor: "white",
          }}
        >
          <StatusBar barStyle="light-content" />
          {shouldShowInitialSyncIntro ? this.renderInitialSyncIntro() : null}
          {shouldShowManualSyncIntro ? this.renderManualSyncIntro() : null}
          {shouldShowSyncStatus ? this.renderSyncStatus() : null}
        </SafeAreaView>
      </ThemeProvider>
    );
  }
}

HealthSyncScreen.propTypes = {
  health: PropTypes.object.isRequired,
  isOffline: PropTypes.bool,
  navigateGoBack: PropTypes.func.isRequired,
  healthStateSet: PropTypes.func.isRequired,
  isInitialSync: PropTypes.bool.isRequired,
};

HealthSyncScreen.defaultProps = {
  isOffline: false,
};

export default HealthSyncScreen;
