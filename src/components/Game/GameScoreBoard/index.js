import React from "react";
import {
  View,
  Text,
  Animated,
  StyleSheet
} from "react-native";

import { config } from "../util/Settings";

const GameScoreBoard = (props) => {

  const { yourScore, computerScore, playerTurn, navigation } = props;

  let turnOpacityAnimation = new Animated.Value(0.5);

  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(turnOpacityAnimation, {
          toValue: 0.2,
          duration: 1000
        }),
        Animated.timing(turnOpacityAnimation, {
          toValue: 0.5,
          duration: 1000
        })
      ]),
      {
        iterations: 4
      }
    ).start();
  }

  startAnimation();

  navigation.addListener('willBlur', () => {
    turnOpacityAnimation.stopAnimation();
  })

  const opacityStyles =  {
    yourScoreBoard: (playerTurn, turnOpacityAnimation) => {
      return {
        height: "100%",
        width: "50%",
        position: "absolute",
        top: 0,
        left: 0,
        backgroundColor: "#9800d2",
        opacity: (playerTurn === "first") ? turnOpacityAnimation : 0
      }
    },
    computerScoreBoard: (playerTurn, turnOpacityAnimation) => {
      return {
        height: "100%",
        width: "50%",
        position: "absolute",
        top: 0,
        right: 0,
        backgroundColor: "#9800d2",
        opacity: (playerTurn === "second") ? turnOpacityAnimation : 0
      }
    }
  }

  return (<View style={styles.scoreBoardStyle}>

    <Animated.View style={opacityStyles.yourScoreBoard(playerTurn, turnOpacityAnimation)}  removeClippedSubviews={true}/>
    <Animated.View style={opacityStyles.computerScoreBoard(playerTurn, turnOpacityAnimation)}  removeClippedSubviews={true}/>

    <View style={styles.scoreBoxStyle}>
      <Text style={styles.scoreTextStyle}>your score</Text>
      <Text style={styles.yourScoreStyle}>{yourScore}</Text>
    </View>

    <View style={styles.scoreBoxStyle}>
      <Text style={styles.scoreTextStyle}>computer</Text>
      <Text style={styles.computerScoreStyle}>{computerScore}</Text>
    </View>

  </View>)

}

export default GameScoreBoard;

const styles = StyleSheet.create({
  scoreBoardStyle: {
    width: config.width,
    height: 60,
    flexDirection: "row"
  },
  scoreBoxStyle: {
    height: "100%",
    width: "50%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  scoreTextStyle: {
    color: "#b142da",
    fontSize: 18,
    fontFamily: "Raleway-Italic"
  },
  yourScoreStyle: {
    color: "#b57800",
    fontSize: 30,
    fontFamily: "Raleway-ExtraBold"
  },
  computerScoreStyle: {
    color: "#980000",
    fontSize: 30,
    fontFamily: "Raleway-ExtraBold"
  }
});
