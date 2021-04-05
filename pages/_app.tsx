import { createGlobalStyle, ThemeProvider } from "styled-components";
import { useState } from "react";
import THEMES from "../data/themes";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background-color: ${(props) => props.background};
    font-family: Georgia, Segoe UI, Roboto, Oxygen, Ubuntu,
      Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  }
  label, button {
    font-family: Segoe UI, Roboto, Oxygen, Ubuntu,
      Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  }
`;

export default function App({ Component, pageProps }) {
  const [currentTheme, setCurrentTheme] = useState("default");
  const selectTheme = (themeName) => {
    setCurrentTheme(themeName);
  };
  return (
    <>
      <GlobalStyle background={THEMES[currentTheme].background} />
      <ThemeProvider theme={THEMES[currentTheme]}>
        <Component
          selectTheme={(themeName) => selectTheme(themeName)}
          theme={THEMES[currentTheme]}
          {...pageProps}
        />
      </ThemeProvider>
    </>
  );
}
