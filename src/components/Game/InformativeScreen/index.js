import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet
} from "react-native";

import { images } from "../util/Images";
import { config } from "../util/Settings";

const information = {
  foot: {
    text: "The oppressed are allowed once every few years to decide which particular representatives of the oppressing class are to represent and repress them.",
    author: "Karl Marx",
    image: images.foot,
    height: 220,
    width: 172,
    title: "Foot of Oppression"
  },
  makeda: {
    text: "Makeda is the mysterious and majestic Queen of Sheba, and the beloved of King Solomon of Judea.",
    author: "Ethiopia",
    image: images.makedaImg,
    height: 220,
    width: 300,
    title: "Makeda"
  }
}

const InformativeScreen = (props) => {

  const { facts, close } = props;

  const imgStlye = (information) => {
    return {
      height: information[facts].height,
      width: information[facts].width
    }
  }

  return (<TouchableOpacity style={styles.informationPage} onPress={close}>
    <View style={styles.informationPageBackground}>

      <View style={styles.imgContainer}>
        <Image style={imgStlye(information)} source={information[facts].image} />
        <Text style={styles.title}>
          {information[facts].title}
        </Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.text}>
          {information[facts].text}
        </Text>
        <Text style={styles.author}>
          {information[facts].author}
        </Text>
      </View>

    </View>
  </TouchableOpacity>)
}

export default InformativeScreen;

const styles = StyleSheet.create({
  informationPage: {
    position: "absolute"
  },
  informationPageBackground: {
    width: config.width,
    height: config.height,
    backgroundColor: "rgb(39, 0, 53)"
  },
  imgContainer: {
    width: "100%",
    height: "25%",
    position: "relative",
    top: "10%",
    justifyContent: "center",
    alignItems: "center"
  },
  textContainer: {
    width: "90%",
    height: "70%",
    justifyContent: "center",
    alignItems: "center",
    left: "5%"
  },
  text: {
    color: "#fff",
    fontFamily: "Raleway-ExtraLight",
    fontSize: 24,
    textAlign: "center",
    width: config.width*0.9
  },
  author: {
    color: "#b57800",
    fontFamily: "Raleway-Medium",
    fontSize: 26,
    textAlign: "center",
    letterSpacing: 6
  },
  title: {
    color: "#b57800",
    fontFamily: "Raleway-ExtraBold",
    fontSize: 35,
    textAlign: "center"
  }
});
