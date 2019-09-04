import React from "react";
import {
  View,
  Image
} from "react-native";

const pointer = require("../../../imgs/pointer.png");

const Pointer = (props) => {

  const {
    startingLeft,
    startingBottom
  } = props;

  if(!startingLeft && !startingBottom){
    return <View></View>
  }

  return (<View
    removeClippedSubviews={true}
    pointerEvents="none"
    style={{
      position: "absolute",
      bottom: startingBottom - 8,
      left: startingLeft - 20,
      height: 100,
      width: 100,
      justifyContent: "center",
      alignItems: "center"
    }}>
    <Image
      style={{flex: 1, transform: [{ rotate: '-135deg' }]}}
      source={pointer}
      resizeMode="contain"
    />
  </View>)
}

export default Pointer;
