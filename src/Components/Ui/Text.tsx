/* eslint-disable prettier/prettier */
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, Text, TextStyle } from "react-native";

import { ITextProps } from "../../constants/types/components";
import useTheme from "../../core/theme";

const Typography = (props: ITextProps) => {
  const {
    id = "Text",
    children,
    style,
    center,
    gradient,
    color,
    opacity,
    primary,
    secondary,
    tertiary,
    black,
    white,
    gray,
    danger,
    warning,
    success,
    info,
    size,
    bold,
    semibold,
    weight,
    h1,
    h2,
    h3,
    h4,
    h5,
    p,
    font,
    align,
    transform,
    lineHeight,
    position,
    right,
    left,
    top,
    bottom,
    start,
    end,
    marginBottom,
    marginTop,
    marginHorizontal,
    marginVertical,
    marginRight,
    marginLeft,
    paddingBottom,
    paddingTop,
    paddingHorizontal,
    paddingVertical,
    paddingRight,
    paddingLeft,
    ...rest
  } = props;
  const { colors, sizes, lines, weights } = useTheme();

  const colorIndex = primary
    ? "primary"
    : secondary
      ? "secondary"
      : tertiary
        ? "tertiary"
        : black
          ? "black"
          : white
            ? "white"
            : gray
              ? "gray"
              : danger
                ? "danger"
                : warning
                  ? "warning"
                  : success
                    ? "success"
                    : info
                      ? "info"
                      : null;
  const textColor = color
    ? color
    : colorIndex
      ? colors?.[colorIndex]
      : undefined;

  const textStyles = StyleSheet.flatten([
    style,
    {
      color: colors.text,
      fontSize: sizes.text,
      lineHeight: lines.text,
      fontWeight: weights.text,
      ...(textColor && { color: textColor }),
      ...(h1 && {
        fontSize: sizes.h1,
        lineHeight: lines.h1,
        fontWeight: weights.h1,
      }),
      ...(h2 && {
        fontSize: sizes.h2,
        lineHeight: lines.h2,
        fontWeight: weights.h2,
      }),
      ...(h3 && {
        fontSize: sizes.h3,
        lineHeight: lines.h3,
        fontWeight: weights.h3,
      }),
      ...(h4 && {
        fontSize: sizes.h4,
        lineHeight: lines.h4,
        fontWeight: weights.h4,
      }),
      ...(h5 && {
        fontSize: sizes.h5,
        lineHeight: lines.h5,
        fontWeight: weights.h5,
      }),
      ...(p && {
        fontSize: sizes.p,
        lineHeight: lines.p,
        fontWeight: weights.p,
      }),
      ...(marginBottom && { marginBottom }),
      ...(marginTop && { marginTop }),
      ...(marginHorizontal && { marginHorizontal }),
      ...(marginVertical && { marginVertical }),
      ...(marginRight && { marginRight }),
      ...(marginLeft && { marginLeft }),
      ...(paddingBottom && { paddingBottom }),
      ...(paddingTop && { paddingTop }),
      ...(paddingHorizontal && { paddingHorizontal }),
      ...(paddingVertical && { paddingVertical }),
      ...(paddingRight && { paddingRight }),
      ...(paddingLeft && { paddingLeft }),
      ...(center && { textAlign: "center" }),
      ...(align && { textAlign: align }),
      ...(weight && { fontWeight: weight }),
      ...(transform && { textTransform: transform }),
      ...(font && { fontFamily: font }),
      ...(size && { fontSize: size }),
      ...(color && { color }),
      ...(opacity && { opacity }),
      ...(lineHeight && { lineHeight }),
      ...(position && { position }),
      ...(right !== undefined && { right }),
      ...(left !== undefined && { left }),
      ...(top !== undefined && { top }),
      ...(bottom !== undefined && { bottom }),
    },
  ]) as TextStyle;


  const gradientHeight =
    Number(textStyles?.lineHeight || textStyles?.fontSize || 0) +
    Number(
      textStyles?.marginVertical ||
        textStyles?.marginTop ||
        textStyles?.marginBottom ||
        0,
    );

  const textID =
    Platform.OS === "android" ? { accessibilityLabel: id } : { testID: id };

  if (gradient) {
    return (
      <MaskedView
        maskElement={
          <Text {...textID} {...rest} style={textStyles}>
            {children}
          </Text>
        }
      >
        <LinearGradient
          colors={gradient}
          end={end || [0.2, 0]}
          start={start || [0, 0]}
          style={{ flex: 1, height: gradientHeight, flexWrap: "wrap" }}
        />
      </MaskedView>
    );
  }

  return (
    <Text {...textID} {...rest} style={textStyles}>
      {children}
    </Text>
  );
};

export default React.memo(Typography);
