var Sound = require('react-native-sound');

const error = (err) => (err) ? console.log(err) : null;

export const sounds = {
  introMusic: new Sound('intro_music.mp3', Sound.MAIN_BUNDLE, error),
  lineClick: new Sound('line_click.wav', Sound.MAIN_BUNDLE, error),
  inGameMusic: new Sound('in_game_music.mp3', Sound.MAIN_BUNDLE, error),
  score: new Sound('score.mp3', Sound.MAIN_BUNDLE, error),
  iseeu: new Sound('iseeu.mp3', Sound.MAIN_BUNDLE, error),
  gotem: new Sound('gotem.mp3', Sound.MAIN_BUNDLE, error),
  okay: new Sound('okay.mp3', Sound.MAIN_BUNDLE, error),
  wrong: new Sound('wrong.wav', Sound.MAIN_BUNDLE, error),
  explosion: new Sound('explosion.wav', Sound.MAIN_BUNDLE, error)
}
