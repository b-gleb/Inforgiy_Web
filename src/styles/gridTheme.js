import { themeQuartz } from 'ag-grid-community';

const gridTheme = themeQuartz
    .withParams({
    browserColorScheme: "dark",
    accentColor: "#434343",
    backgroundColor: "#171717",
    columnBorder: true,
    fontFamily: "inherit",
    fontSize: 10,
    foregroundColor: "#D6D6D6",
    headerFontSize: 10,
    headerFontWeight: 700,
    iconSize: 12,
    oddRowBackgroundColor: "#171717",
    spacing: 5,
    wrapperBorderRadius: 0
   }, 'dark')
  .withParams({
    browserColorScheme: "light",
    columnBorder: true,
    fontFamily: "inherit",
    fontSize: 10,
    headerFontSize: 10,
    headerFontWeight: 700,
    iconSize: 12,
    oddRowBackgroundColor: "#F9F9F9",
    spacing: 5,
    wrapperBorderRadius: 0
   }, 'light');

export default gridTheme