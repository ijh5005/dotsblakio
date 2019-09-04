import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  StyleSheet,
  AppState
} from "react-native";
// import AsyncStorage from '@react-native-community/async-storage';

import GameScoreBoard from "../GameScoreBoard";
import GameBlock from "../GameBlock";
import GameOver from "../GameOver";
import YouWin from "../YouWin";
import InformativeScreen from "../InformativeScreen";
import ScreenText from "../ScreenText";
import Pointer from "../Pointer";
import { gameBoards } from "../util/GameBoards";
import { boxInfo } from "../util/BoxInfo";
import { computerMove } from "../util/ComputerLogic";
import { whoClickedTheLine } from "../util/WhoClicked";
import { whoScoredObj } from "../util/WhoScored";
import { explosions, explosionSides } from "../util/ExplosionPattern";
import { explosionStlyes } from "../util/ExplosionStlyes";
import { config } from "../util/Settings";
import { images } from "../util/Images";
import { util } from "../util/Util";
import { trainRestrictions } from "../util/Training";
import { sounds } from "../Sounds";

const PlayGame = (props) => {

  const [appState] = useState(AppState.currentState)

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange)
  }, []);

  const handleAppStateChange = (nextAppState) => {
    if(nextAppState === 'active'){
      sounds.inGameMusic.setVolume(0.4);
    } else {
      sounds.inGameMusic.setVolume(0);
    }
  };

  const playGameMusic = () => {
    sounds.inGameMusic.setCurrentTime(0);
    sounds.inGameMusic.play();
    sounds.inGameMusic.setNumberOfLoops(-1);
    sounds.inGameMusic.setVolume(0.4);
  }

  props.navigation.addListener('willFocus', () => {
    playGameMusic();
  })

  props.navigation.addListener('willBlur', () => {
    sounds.inGameMusic.setCurrentTime(0);
    sounds.inGameMusic.pause();
  })

  const [currentLevel, setCurrentLevel] = useState("level1");
  const [board, setBoard] = useState(util.breakRefAndCopy(gameBoards[currentLevel]));
  const [playerTurn, setPlayerTurn] = useState("first");
  const [borders, setBorders] = useState(util.breakRefAndCopy(boxInfo.borderCount));
  const [connectedBoxes, setConnectedBoxes] = useState(util.breakRefAndCopy(boxInfo.connectedBoxesObj));
  const [whoScored, setWhoScored] = useState(util.breakRefAndCopy(whoScoredObj));
  const [whoClickedTheLineTracker, setWhoClickedTheLineTracker] = useState(util.breakRefAndCopy(whoClickedTheLine));
  const [computerLastLineClick, setComputerLastLineClick] = useState(false);
  const [yourScore, setYourScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [explodingBoxes, setExplodingBoxes] = useState({});
  const [activeBomb, setActiveBomb] = useState("");
  const [footIndexes, setFootIndexes] = useState(config.footSquares[currentLevel]);
  const [gameIsOver, setGameIsOver] = useState(false);
  const [youWin, setYouWin] = useState(false);
  const [boardTotalScore, setBoardTotalScore] = useState(util.getBoardScore(gameBoards[currentLevel]))
  const [showInformativeScreen, setShowInformativeScreen] = useState(false)
  const [informationType, setInformationType] = useState(null)
  const [viewPointer, setViewPointer] = useState(false);
  const [showBoard, setShowBoard] = useState(false);
  const [currentLevelBombs, setCurrentLevelBombs] = useState([]);
  const [consecutiveTurns, setConsecutiveTurns] = useState(0);
  const [screenText, setScreenText] = useState("");
  const [helpText, setHelpText] = useState("");
  const [training, setTraining] = useState("");
  const [bombToClick, setBombToClick] = useState(null);
  const [waitTime, setWaitTime] = useState(0);
  const [turnText, setTurnText] = useState("your turn");
  const [turns, setTurns] = useState(0);

  const checkComputerMove = () => {
    const move = computerMove(borders, connectedBoxes, board, footIndexes);
  }

  const showScreenText = (text) => {
    setScreenText(text)
    setTimeout(() => {
      setScreenText("")
    }, 1000)
  }

  useEffect(() => {
    if(playerTurn === "first"){
      setTurnText("your turn")
    } else {
      setTurnText("computer turn")
    }
    if(turns !== 0){
      sounds.lineClick.setCurrentTime(0);
      sounds.lineClick.play();
    }
    setTurns(turns + 1);
  }, [playerTurn])

  useEffect(() => {
    setTimeout(() => {
      const restriction = training && training.yourMoves && training.yourMoves[0];
      if(restriction && restriction.type === "explosionClick"){
        setBombToClick(restriction.bomb);
      } else {
        setBombToClick(null)
      }
    }, waitTime);
  }, [training])

  useEffect(() => {
    setTimeout(() => {
      const restriction = training && training.yourMoves && training.yourMoves[0];
      if (restriction && playerTurn === "first"){
        if(restriction.text || restriction.text === ""){
          setHelpText({
            text: restriction.text,
            text2: restriction.text2,
            text3: restriction.text3
          });
        }
      }
    }, waitTime)
  }, [training, playerTurn])

  useEffect(() => {
    setTimeout(() => {
      // only use logic if it is the computer turn. ex: "second" player
      if(playerTurn === "second"){
        setConsecutiveTurns(0)

        if(training && training.computerMoves && training.computerMoves.length){
          const restriction = training.computerMoves[0];
          if(restriction.type === "clickSide"){
            clickBorder(restriction.side, restriction.box, "second");
            return removeComputerUsedMoveRestriction();
          }
        }

        // get a move for the computer to make
        const move = computerMove(borders, connectedBoxes, board, footIndexes, showScreenText);
        // if the move is empty the computer has no moves
        if(!move && !footIndexes.length){
          setYouWin(yourScore > computerScore);
          return setGameIsOver(true);
        } else if (!move) {
          setYouWin(false)
          return setGameIsOver(true);
        }
        // if the move is not empty make a computer mover
        clickBorder(move.side, move.index, "second");
      } else {

        if(yourScore > 0){
          setConsecutiveTurns(consecutiveTurns + 1);
          if(consecutiveTurns === 4){
            showScreenText("I SEE YOU");
            sounds.iseeu.play();
          } else if (consecutiveTurns === 7) {
            showScreenText("OKAY")
            sounds.okay.play();
          }
        }

        const totalScore = yourScore + computerScore;
        const aboutToScoreLastPoint = boardTotalScore - 1
        if(totalScore === aboutToScoreLastPoint && !footIndexes.length){
          setYouWin(yourScore > computerScore);
          return setGameIsOver(true);
        }
      }
    })
  }, [playerTurn, whoScored]); // this is only used if borders or connectedBoxes change

  useEffect(() => {
    setTimeout(() => {
      let yourScoreCount = 0;
      let computerScoreCount = 0;
      for(let i in whoScored){
        if(whoScored[i] === "first"){
          yourScoreCount++;
        } else if (whoScored[i] === "second") {
          computerScoreCount++;
        }
      }
      setYourScore(yourScoreCount);
      setComputerScore(computerScoreCount);
      if(yourScoreCount + computerScoreCount === 36){
        setGameOver(true)
      }
    }, waitTime)
  }, [whoScored, explodingBoxes, connectedBoxes])

  useEffect(() => {
    setTimeout(() => {
      const setDefaultBombs = async () => {
        setCurrentLevelBombs(config.levelDefaultBombs[currentLevel])
      }
      setDefaultBombs();
      setTraining(util.breakRefAndCopy(trainRestrictions[currentLevel]));
    }, waitTime)
  }, [currentLevel])

  useEffect(() => {
    if(waitTime){
      setTimeout(() => {
        setWaitTime(0)
      }, 800)
    }
  }, [waitTime])

  const removeUsedMoveRestriction = () => {
    const yourMoves = util.breakRefAndCopy(training.yourMoves);
    const updatedMoves = yourMoves.slice(1, yourMoves.length);
    setTraining({
      ...training,
      yourMoves: updatedMoves
    });
  }

  const removeComputerUsedMoveRestriction = () => {
    const computerMoves = util.breakRefAndCopy(training.computerMoves);
    const updatedMoves = computerMoves.slice(1, computerMoves.length);
    setTraining({
      ...training,
      computerMoves: updatedMoves
    });
  }

  const passedMoveRestrictions = (
    clickBox = null,
    side = null,
    bomb = null
  ) => {
    if(playerTurn !== "first") return true;

    let passedRestrictions = true;
    if(training && training.yourMoves.length){

      const restriction = training.yourMoves[0];

      if(restriction.type === "explosionClick"){
        if(bomb && (bomb === restriction.bomb)){
          passedRestrictions = true;
          removeUsedMoveRestriction();
        } else {
          passedRestrictions = false;
        }
      } else if(restriction.type === "boxClick"){
        if(clickBox && (clickBox === restriction.clickBox) && !side){
          passedRestrictions = true;
          removeUsedMoveRestriction();
        } else {
          passedRestrictions = false;
        }
      } else if (restriction.type === "clickSide"){
        if(clickBox && side && restriction.boxes.includes(clickBox)){
          const index = restriction.boxes.indexOf(clickBox);
          if(side === restriction.sides[index]){
            passedRestrictions = true;
            removeUsedMoveRestriction();
          } else {
            passedRestrictions = false;
          }
        } else {
          passedRestrictions = false;
        }
      } else if (restriction.text) {
        removeUsedMoveRestriction();
      }

    }

    return passedRestrictions;
  }

  const adjustBorderCount = () => {
    const temp = boxInfo.getBorderCounts(board);
    setBorders({ ...temp });
  }

  const adjustConnectedBoxes = (index) => {
    const temp = boxInfo.getNewConnectedBoxes(connectedBoxes, index);
    setConnectedBoxes({ ...temp });
  }

  const setComputerLastClickedLine = (state) => {
    (playerTurn === "second") ? setComputerLastLineClick(state) : setComputerLastLineClick(false);
  }

  const setLineColor = (indexes, sides) => {
    const boxIndex = indexes[0];
    const box = boxInfo.getBoxNameByIndex(boxIndex);
    const boxSide = sides[0];

    const adjBoxIndex = indexes[1];
    const adjBox = boxInfo.getBoxNameByIndex(adjBoxIndex);
    const adjBoxSide = sides[1];

    const linesClickedObj = {};

    const temp = {...whoClickedTheLineTracker};
    if((boxIndex || boxIndex === 0) && (adjBoxIndex || adjBoxIndex === 0)){
      temp[box][boxSide] = playerTurn;
      temp[adjBox][adjBoxSide] = playerTurn;
      setComputerLastClickedLine({boxes: [box, adjBox], sides: [boxSide, adjBoxSide]});
    } else if (boxIndex || boxIndex === 0) {
      temp[box][boxSide] = playerTurn;
      setComputerLastClickedLine({boxes: [box], sides: [boxSide]});
    } else if (adjBoxIndex || adjBoxIndex === 0) {
      temp[adjBox][adjBoxSide] = playerTurn;
      setComputerLastClickedLine({boxes: [adjBox], sides: [adjBoxSide]});
    }
    setWhoClickedTheLineTracker({
      ...temp
    })
  }

  const setTurnPlayer = (hasScored, clickedIndexes) => {
    const {scored, boxes} = hasScored;
    // set the turn to the next play turn if there was not a score
    if(!scored){
      const whosTurn = boxInfo.getTheNextPlayerTurn(playerTurn);
      setPlayerTurn(whosTurn);
    } else {

      sounds.score.setCurrentTime(0);
      sounds.score.play();

      const boxIndex = clickedIndexes[0];
      const box = (boxIndex || boxIndex === 0) ? boxInfo.getBoxNameByIndex(boxIndex) : false;
      const boxLineCount = box ? borders[box] : false;
      const boxAboutToScored = boxLineCount === 3;

      const adjBoxIndex = clickedIndexes[1];
      const adjBox = (adjBoxIndex || adjBoxIndex === 0) ? boxInfo.getBoxNameByIndex(adjBoxIndex) : false;
      const adjBoxLineCount = adjBox ? borders[adjBox] : false;
      const adjBoxAboutToScored = adjBoxLineCount === 3;

      const setScoredPlayer = {};
      if(boxAboutToScored && adjBoxAboutToScored){
        setScoredPlayer[box] = playerTurn;
        setScoredPlayer[adjBox] = playerTurn;
      } else if (boxAboutToScored) {
        setScoredPlayer[box] = playerTurn;
      } else if (adjBoxAboutToScored) {
        setScoredPlayer[adjBox] = playerTurn;
      }

      setWhoScored({ ...whoScored, ...setScoredPlayer })

    }
  }

  const setSide = (boxName, side) => {
    const temp = boxInfo.getTheNewBordAfterClickingSide(board, boxName, side);
    setBoard(temp);
  }

  const clickBorder = (side, index, player) => {
    if(!passedMoveRestrictions(index, side)){
      sounds.wrong.setCurrentTime(0);
      return sounds.wrong.play();
    }

    if(player !== playerTurn){
      sounds.wrong.setCurrentTime(0);
      return sounds.wrong.play()
    }

    const boxName = boxInfo.getBoxNameByIndex(index);
    const boxObj = boxInfo.getBoxObjByBoxName(board, boxName);
    const { disabled, borders } = boxObj;
    if(!boxInfo.isClickable(borders, side)){
      if(!disabled){
        sounds.wrong.setCurrentTime(0);
        return sounds.wrong.play()
      }
      return;
    }

    const { adjBoxSide, adjacentBoxIndex } = boxInfo.getAdjacentBoxInfo(board, side, index);
    const adjBoxName = boxInfo.getBoxNameByIndex(adjacentBoxIndex);

    if(boxInfo.hasFootRestriction(footIndexes, index, adjacentBoxIndex)){
      sounds.wrong.setCurrentTime(0);
      return sounds.wrong.play();
    };

    setSide(boxName, side);

    const updatedConnections = [];
    (!boxInfo.isDisabled(board, boxName)) && updatedConnections.push(index);

    if(adjacentBoxIndex || adjacentBoxIndex === 0){
      setSide(adjBoxName, adjBoxSide);
      (!boxInfo.isDisabled(board, adjBoxName)) && updatedConnections.push(adjacentBoxIndex);
    }

    if(!disabled || !boxInfo.isDisabled(board, adjBoxName)){
      setTimeout(() => {
        // sounds.lineClick.setCurrentTime(0);
        // sounds.lineClick.play();
      })
    }

    updatedConnections.length && adjustConnectedBoxes(updatedConnections);
    adjustBorderCount();

    const hasScored = boxInfo.hasScored(board, index, adjacentBoxIndex);
    if((board[boxName] && !boxInfo.isDisabled(board, boxName)) ||
      (board[adjBoxName] && !boxInfo.isDisabled(board, adjBoxName))){
      setLineColor([index, adjacentBoxIndex], [side, adjBoxSide]);
      setTurnPlayer(hasScored, [index, adjacentBoxIndex]);
    }
  }

  const keys = Object.keys(board);

  const setExplosionBoxes = (boxIndex) => {
    if(!activeBomb.length || (playerTurn !== "first")) return;

    setWaitTime(500);

    if(!passedMoveRestrictions(boxIndex, null, activeBomb)){
      sounds.wrong.setCurrentTime(0);
      return sounds.wrong.play();
    }

    sounds.explosion.setCurrentTime(0);
    sounds.explosion.play();

    const bomb = activeBomb.slice(0, -1);

    const temp7 = [...currentLevelBombs];
    const bombIndex = temp7.indexOf(bomb);
    temp7.splice(bombIndex, 1);
    setCurrentLevelBombs(temp7);

    const temp = boxInfo.getLightPattern(explosions, bomb, boxIndex);
    setExplodingBoxes(temp);

    const temp2 = {...board}
    const temp3 = {...whoClickedTheLineTracker}
    const temp4 = {...borders}
    const temp5 = {...connectedBoxes}
    const temp6 = [...footIndexes]

    const bombType = explosionSides[bomb][`box${boxIndex}`];
    for(let side in bombType){
      const sideIndex = boxInfo.getSideIndex(side);
      bombType[side].forEach(rowBoxIndex => {
        temp2[`box${rowBoxIndex}`].borders[side] = null;
        temp3[`box${rowBoxIndex}`][side] = null;
        temp5[`box${rowBoxIndex}`][sideIndex] = boxInfo.connectedBoxesObjRef[`box${rowBoxIndex}`][sideIndex];
        whoScored[`box${rowBoxIndex}`] = null;

        let newCount = temp4[`box${rowBoxIndex}`];
        if(newCount > 0){
          newCount = temp4[`box${rowBoxIndex}`]--;
        }
        temp4[`box${rowBoxIndex}`] = newCount;

        const boxName = boxInfo.getBoxNameByIndex(rowBoxIndex);
        if(computerLastLineClick.boxes && computerLastLineClick.boxes.includes(boxName)){
          const boxIndexInLastClicked = computerLastLineClick.boxes.indexOf(boxName);
          if(computerLastLineClick.sides[boxIndexInLastClicked] === side){
            const temp = {...computerLastLineClick};
            temp.boxes.splice(boxIndexInLastClicked, 1);
            temp.sides.splice(boxIndexInLastClicked, 1);
            setComputerLastLineClick(temp);
          }
        }

        const indexInFootArray = temp6.indexOf(rowBoxIndex)
        const isFootBox = indexInFootArray > -1;
        if(isFootBox){
          temp6.splice(indexInFootArray, 1)
        }
      });
    }

    setBoard(temp2);
    setBorders(temp4);
    setConnectedBoxes(temp5);
    setFootIndexes(temp6);
    setActiveBomb("");
  }

  const selectBomb = (bomb, index) => {
    if(!passedMoveRestrictions(null, null, bomb)){
      sounds.wrong.setCurrentTime(0);
      return sounds.wrong.play();
    }
    if(activeBomb === bomb + index){
      return setActiveBomb("")
    }
    setActiveBomb(`${bomb}${index}`)
  }

  const changeLevel = (level, levelText) => {
    setScreenText("")
    if((levelText !== "x" || !levelText)){
      setBoard(util.breakRefAndCopy(gameBoards[level]));
      setPlayerTurn("first");
      setBorders(util.breakRefAndCopy(boxInfo.borderCount));
      setConnectedBoxes(util.breakRefAndCopy(boxInfo.connectedBoxesObj));
      setWhoScored(util.breakRefAndCopy(whoScoredObj));
      setWhoClickedTheLineTracker(util.breakRefAndCopy(whoClickedTheLine));
      setComputerLastLineClick(false);
      setYourScore(0);
      setComputerScore(0);
      setGameOver(false);
      setExplodingBoxes({});
      setActiveBomb("");
      setFootIndexes(util.breakRefAndCopy(config.footSquares[level]));
      setGameIsOver(false);
      setYouWin(false);
      setBoardTotalScore(util.getBoardScore(gameBoards[level]));
      setCurrentLevel(level);
      if(config.informationBoard.includes(levelText)){
        setShowInformativeScreen(true);
        const type = config.informationText[`${levelText}`];
        setInformationType(type)
      }
    }
  }

  const restartGame = () => {
    changeLevel(currentLevel);
    setGameIsOver(false);
  }

  const nextLevel = () => {
    const level = parseInt(currentLevel.replace("level", ""))
    const nextLevel = level + 1;
    changeLevel(`level${nextLevel}`, nextLevel);
    setGameIsOver(false);
  }

  const closeInformationScreen = () => {
    setShowInformativeScreen(false);
  }

  let colorAnimation = new Animated.Value(0);

  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnimation, {
          toValue: 1,
          duration: 1000
        }),
        Animated.timing(colorAnimation, {
          toValue: 0,
          duration: 1000
        })
      ]),
      {
        iterations: 4
      }
    ).start();
  }

  startAnimation();

  const letterColor = colorAnimation.interpolate({
    inputRange: [ 0, 1 ],
    outputRange: [ '#b57800', 'transparent' ]
  });

  props.navigation.addListener('willBlur', () => {
    colorAnimation.stopAnimation();
  })

  return (<View style={styles.boardStyle}>
    <Image style={styles.imgStyle} source={images.background} />

    <GameScoreBoard
      yourScore={yourScore}
      computerScore={computerScore}
      playerTurn={playerTurn}
      navigation={props.navigation}
    />

    <View style={{width: 318, height: 380, flexDirection: "row", flexWrap: "wrap", paddingTop: 40}}>
      {keys.map((data, index) => {
        const {
          disabled,
          borders
        } = board[data];
        const {
          isTopRightCornerBox,
          isTopLeftCornerBox,
          isBottomRightCornerBox,
          isBottomLeftCornerBox,
          isTopSideRow,
          isRightSideRow,
          isBottomSideRow,
          isLeftSideRow
        } = boxInfo.getSidesInfo(board, index);
        const box = boxInfo.getBoxNameByIndex(index)
        const isDisabledBox = disabled || false;
        const hasScored = borders.top && borders.right && borders.bottom && borders.left;
        const borderColors = boxInfo.getBorderColors(box, whoClickedTheLineTracker);

        const restriction = training && training.yourMoves && training.yourMoves[0];

        let blinkingEdge = false;
        let blinkingBox = false;

        if (restriction && restriction.type === "clickSide" && playerTurn === "first"){
          const restrictionIndex = restriction.boxes.indexOf(index);
          blinkingEdge = (restrictionIndex !== -1) && restriction.sides[restrictionIndex];
        }

        if(restriction && (restriction.type === "boxClick") && (playerTurn === "first") && (index === restriction.clickBox)){
          blinkingBox = true;
        }

        let startingLeft = false;
        let startingBottom = false;
        if(blinkingEdge === "top"){
          startingLeft = 35;
          startingBottom = 60;
        } else if (blinkingEdge === "left" || blinkingBox) {
          startingLeft = blinkingBox ? 60 : 10;
          startingBottom = 20;
        }

        return (<GameBlock
          isDisabledBox={isDisabledBox}
          borders={borders}
          clickBorder={clickBorder}
          index={index}
          hasScored={hasScored}
          scored={whoScored[box]}
          borderColors={borderColors}
          computerLastLineClick={computerLastLineClick}
          boxName={box}
          isTopRightCornerBox={isTopRightCornerBox}
          isTopLeftCornerBox={isTopLeftCornerBox}
          isBottomRightCornerBox={isBottomRightCornerBox}
          isBottomLeftCornerBox={isBottomLeftCornerBox}
          isTopSideRow={isTopSideRow}
          isRightSideRow={isRightSideRow}
          isBottomSideRow={isBottomSideRow}
          isLeftSideRow={isLeftSideRow}
          explodingBoxes={explodingBoxes}
          setExplosionBoxes={setExplosionBoxes}
          footIndexes={footIndexes}
          blinkingEdge={blinkingEdge}
          blinkingBox={blinkingBox}
          startingLeft={startingLeft}
          startingBottom={startingBottom}
          navigation={props.navigation}
          key={index} />)})}
    </View>

    <View style={styles.bombSection} >
      {currentLevelBombs.map((data, index) => {
        let image;
        let style;
        if(data === "cheetah"){
          image = images.cheetahImg;
          style = explosionStlyes.generalBombStlyes();
        } else if (data === "panther") {
          image = images.pantherImg
          style = explosionStlyes.generalBombStlyes();
        } else if (data === "makeda") {
          image = images.makedaImg;
          style = explosionStlyes.makedaBombStyle();
        }

        return (<TouchableOpacity key={index} onPress={() => selectBomb(data, index)}>
          <Animated.View style={((activeBomb === data + index) || (bombToClick === data)) ? explosionStlyes.selectedBomb(letterColor) : {}} removeClippedSubviews={true}>
            <Image
              style={style}
              source={image}
            />
            {(bombToClick === data) && <Pointer
                              startingLeft={50}
                              startingBottom={50}/>}
          </Animated.View>
        </TouchableOpacity>)
      })}
    </View>

    <TouchableOpacity
      style={styles.goldSection}
      onPress={config.isDebuggingMode ? () => { checkComputerMove() } : null}>
      <Text style={{
        ...styles.goldText,
        color: "rgba(255, 255, 255, 0.2)"
      }}>{turnText}</Text>
    </TouchableOpacity>

    <View style={styles.levelSelectSection}>
      {config.levels.map((data, index) => {
        const levelStyle = (data === "x") ? styles.lockedLevel : styles.openLevel;
        const levelText = (data === "x") ? "x" : (index + 1);
        return (<TouchableOpacity key={index} onPress={changeLevel.bind(this, `level${index + 1}`, levelText)}>
          <View style={styles.levelBox}>
            <View style={levelStyle}>
              <Text style={levelStyle}>{levelText}</Text>
            </View>
          </View>
        </TouchableOpacity>)
      })}
    </View>

    {gameIsOver && !youWin &&
      <GameOver
        restartGame={restartGame}
      />}

    {gameIsOver && youWin &&
      <YouWin
        restartGame={restartGame}
        nextLevel={nextLevel}
        isLastBoard={currentLevel === config.finalLevel}
      />}

    {/*screenText.length !== 0 && <ScreenText text={screenText} />*/}
    {helpText.length !== 0 && <ScreenText text={helpText} font={26} />}

    {showInformativeScreen && <InformativeScreen
        facts={informationType}
        close={closeInformationScreen}
      />}

  </View>)

}

export default PlayGame;

const styles = StyleSheet.create({
  boardStyle: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    height: config.height,
    width: config.width
  },
  imgStyle: {
    width: config.width,
    height: config.height,
    position: "absolute",
    top: 0,
    left: 0
  },
  openLevel: {
    fontSize: 20,
    color: "#b57800",
    fontFamily: "Raleway-ExtraBold"
  },
  lockedLevel: {
    fontSize: 20,
    color: "#fff",
    padding: 2,
    opacity: 0.6,
    fontFamily: "Raleway-ExtraBold"
  },
  bombSection: {
    height: 40,
    width: config.width,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10
  },
  levelSelectSection: {
    width: config.width,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap"
  },
  levelBox: {
    height: 40,
    width: 40,
    backgroundColor: "#270038",
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    margin: 2
  },
  homeBox: {
    height: 50,
    width: 100,
    backgroundColor: "#270038",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    margin: 5
  },
  goldSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  goldText: {
    fontSize: 20,
    letterSpacing: 5,
    fontFamily: "Raleway-Bold"
  },
  gold: {
    height: 60,
    width: 60,
    justifyContent: "center",
    alignItems: "center"
  },
  goldImg: {
    flex:1,
    height: "100%",
    width: "100%"
  },
  space: {
    height: 20,
    width: config.width
  }
});
