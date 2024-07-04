/* eslint-disable prettier/prettier */
import { Dimensions } from "react-native";

import {
  ICommonTheme,
  ThemeAssets,
  ThemeFonts,
  ThemeLineHeights,
  ThemeWeights,
} from "./types/theme";

const { width, height } = Dimensions.get("window");

export const WEIGHTS: ThemeWeights = {
  text: "normal",
  h1: "normal",
  h2: "normal",
  h3: "normal",
  h4: "normal",
  h5: "normal",
  p: "normal",

  thin: "normal",
  extralight: "normal",
  light: "normal",
  normal: "normal",
  medium: "normal",
  semibold: "normal",
  bold: "normal",
  extrabold: "normal",
  black: "normal",
};

export const ASSETS: ThemeAssets = {
  header: require("../assets/images/header.png"),
  background: require("../assets/images/background.png"),

  // cards
  card1: require("../assets/images/card1.png"),
  card2: require("../assets/images/card2.png"),
  card3: require("../assets/images/card3.png"),
  card4: require("../assets/images/card4.png"),
  noEvents: require("../assets/images/noEvents.png"),

};

export const LINE_HEIGHTS: ThemeLineHeights = {
  // font lineHeight
  text: 22,
  h1: 60,
  h2: 55,
  h3: 43,
  h4: 33,
  h5: 24,
  p: 22,
};

export const THEME: ICommonTheme = {
  assets: { ...ASSETS },
  weights: WEIGHTS,
  lines: LINE_HEIGHTS,
  sizes: { width, height },
};
