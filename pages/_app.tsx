import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { useState } from 'react';
import THEMES from '../data/themes';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background-color: ${props => props.background};
  }
`;

export default function App({ Component, pageProps }) {
  const [currentTheme, setCurrentTheme] = useState('default');
  const selectTheme = (event) => {
    setCurrentTheme(event.target.value);
  }
  return (
    <>
      <GlobalStyle background={THEMES[currentTheme].background}/>
      <ThemeProvider theme={THEMES[currentTheme]}>
        <Component selectTheme={(event) => selectTheme(event)} theme={THEMES[currentTheme]} {...pageProps} />
      </ThemeProvider>
    </>
  );
}
