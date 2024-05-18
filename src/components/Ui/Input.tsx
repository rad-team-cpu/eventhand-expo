/* eslint-disable prettier/prettier */
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  Image,
  TextInput,
  TextStyle,
  ViewStyle,
  StyleSheet,
  Platform,
} from "react-native";

import Block from "./Block";
import Text from "./Text";
import { IInputProps } from "../../constants/types/components";
import useTheme from "../../core/theme";

interface CustomInputProps {
  mode: "text" | "password";
  iprops: IInputProps;
}

const Input = ({ mode, iprops }: CustomInputProps) => {
  const { assets, colors, sizes } = useTheme();
  const [isFocused, setFocused] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(false);
  const {
    id = "Input",
    style,
    color,
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
    search,
    disabled,
    label,
    icon,
    marginBottom,
    marginTop,
    marginHorizontal,
    marginVertical,
    marginRight,
    marginLeft,
    onFocus,
    onBlur,
  } = iprops;

  const toggleShowPassword = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const handleFocus = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any, focus: any) => {
      setFocused(focus);
      focus && onFocus?.(event);
      !focus && onBlur?.(event);
    },
    [setFocused, onFocus, onBlur],
  );

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
  const inputColor = color
    ? color
    : colorIndex
      ? colors?.[colorIndex]
      : colors.gray;

  const inputBoxStyles = StyleSheet.flatten([
    style,
    {
      minHeight: sizes.inputHeight,
      ...(marginBottom && { marginBottom }),
      ...(marginTop && { marginTop }),
      ...(marginHorizontal && { marginHorizontal }),
      ...(marginVertical && { marginVertical }),
      ...(marginRight && { marginRight }),
      ...(marginLeft && { marginLeft }),
    },
  ]) as ViewStyle;

  const inputContainerStyles = StyleSheet.flatten([
    {
      minHeight: sizes.inputHeight,
      borderRadius: sizes.inputRadius,
      borderWidth: isFocused ? 2 : sizes.inputBorder,
      borderColor: isFocused ? colors.focus : inputColor,
    },
  ]) as ViewStyle;

  const inputStyles = StyleSheet.flatten([
    {
      flex: 1,
      zIndex: 2,
      height: "100%",
      fontSize: sizes.p,
      color: colors.input,
      paddingHorizontal: sizes.inputPadding,
    },
  ]) as TextStyle;

  // generate component testID or accessibilityLabel based on Platform.OS
  const inputID =
    Platform.OS === "android" ? { accessibilityLabel: id } : { testID: id };

  return (
    <Block flex={0} style={inputBoxStyles}>
      {label && (
        <Text bold marginBottom={sizes.s}>
          {label}
        </Text>
      )}
      <Block row align="center" justify="flex-end" style={inputContainerStyles}>
        {search && assets.search && (
          <Image
            source={assets.search}
            style={{ marginLeft: sizes.inputPadding, tintColor: colors.icon }}
          />
        )}
        {icon && (
          <Image
            source={assets?.[icon]}
            style={{ marginLeft: sizes.inputPadding, tintColor: colors.icon }}
          />
        )}
        <TextInput
          {...inputID}
          {...iprops}
          secureTextEntry={!secureTextEntry}
          style={inputStyles}
          editable={!disabled}
          placeholderTextColor={inputColor}
          onFocus={(event) => handleFocus(event, true)}
          onBlur={(event) => handleFocus(event, false)}
        />
        {mode == "password" && (
          <MaterialCommunityIcons
            name={secureTextEntry ? "eye-off" : "eye"}
            size={24}
            color="#aaa"
            style={{
              marginRight: sizes.s,
            }}
            onPress={toggleShowPassword}
          />
        )}

        {danger && assets.warning && (
          <Image
            source={assets.warning}
            style={{
              marginRight: sizes.s,
              tintColor: colors.danger,
            }}
          />
        )}
        {success && assets.check && (
          <Image
            source={assets.check}
            style={{
              width: 12,
              height: 9,
              marginRight: sizes.s,
              tintColor: colors.success,
            }}
          />
        )}
      </Block>
    </Block>
  );
};

export default React.memo(Input);
