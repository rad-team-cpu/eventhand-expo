/* eslint-disable prettier/prettier */
import { Dimensions } from "react-native";

import { ICommonTheme, ThemeAssets, ThemeFonts, ThemeLineHeights, ThemeWeights } from "./types/theme";

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
  // fonts
  OpenSansLight: require("../assets/fonts/OpenSans-Light.ttf"),
  OpenSansRegular: require("../assets/fonts/OpenSans-Regular.ttf"),
  OpenSansSemiBold: require("../assets/fonts/OpenSans-SemiBold.ttf"),
  OpenSansExtraBold: require("../assets/fonts/OpenSans-ExtraBold.ttf"),
  OpenSansBold: require("../assets/fonts/OpenSans-Bold.ttf"),
  header: require("../assets/images/header.png"),
  background: require("../assets/images/background.png"),

  // cards
  card1: require("../assets/images/card1.png"),
  card2: require("../assets/images/card2.png"),
  card3: require("../assets/images/card3.png"),
  card4: require("../assets/images/card4.png"),
};

export const FONTS: ThemeFonts = {
  // based on font size
  text: "OpenSans-Regular",
  h1: "OpenSans-Bold",
  h2: "OpenSans-Bold",
  h3: "OpenSans-Bold",
  h4: "OpenSans-Bold",
  h5: "OpenSans-SemiBold",
  p: "OpenSans-Regular",

  // based on fontWeight
  thin: "OpenSans-Light",
  extralight: "OpenSans-Light",
  light: "OpenSans-Light",
  normal: "OpenSans-Regular",
  medium: "OpenSans-SemiBold",
  semibold: "OpenSans-SemiBold",
  bold: "OpenSans-Bold",
  extrabold: "OpenSans-ExtraBold",
  black: "OpenSans-ExtraBold",
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
  assets: {...ASSETS },
  fonts: FONTS,
  weights: WEIGHTS,
  lines: LINE_HEIGHTS,
  sizes: { width, height },
};
