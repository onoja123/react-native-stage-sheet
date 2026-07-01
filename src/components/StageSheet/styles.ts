import { StyleSheet } from "react-native";

import { SHEET_TITLE_SIZE } from "../../constants";

export const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
  },
  title: {
    width: "100%",
    textAlign: "center",
    fontSize: SHEET_TITLE_SIZE,
    fontWeight: "700",
    color: "#000000",
  },
});
