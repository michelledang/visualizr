import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { useState } from 'react';
import THEMES from '../data/themes';
import Head from 'next/head';

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
  const [currentTheme, setCurrentTheme] = useState('default');
  const selectTheme = (themeName) => {
    setCurrentTheme(themeName);
  };
  return (
    <>
      <GlobalStyle background={THEMES[currentTheme].background} />
      <ThemeProvider theme={THEMES[currentTheme]}>
        <Head>
          <meta property="og:title" content="visualizr" />
          <meta property="og:image" content="/preview.jpg" />
          <meta
            property="og:description"
            content="Real-time audio visualizer."
          />
          <title>visualizr</title>
          <link rel="shortcut icon" href="/favicon.ico" />
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-ZCRLWNW976"
          ></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-ZCRLWNW976');
            `,
            }}
          />
        </Head>
        <Component
          selectTheme={(themeName) => selectTheme(themeName)}
          theme={THEMES[currentTheme]}
          {...pageProps}
        />
      </ThemeProvider>
    </>
  );
}
