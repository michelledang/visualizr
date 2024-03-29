import React from 'react';
import styled from 'styled-components';
import { AudioContext } from 'standardized-audio-context';
import { useState } from 'react';
import THEMES from '../data/themes';
import ExpandIcon from '../components/ExpandIcon';

export default function Home(props) {
  var audioContext;
  var stream, analyser, dataArray, canvas, ctx, dataArray2;
  var WIDTH = 0;
  var HEIGHT = 0;
  var t = 0;

  const FILES = [
    '/audio/file1.mp3',
    '/audio/file2.mp3',
    '/audio/sine440.wav',
    '/audio/square440.wav',
    '/audio/sawtooth440.wav',
  ];

  const VISUALIZATION_TYPES = {
    OSCILLATOR: 'oscillator',
    BAR: 'bar',
    CIRCLE: 'circle',
    LISSA: 'lissajous',
    COLORS: 'colors',
    HARMONO: 'plot',
  };

  const VISUALIZATION_SOURCES = {
    FILE: 'file',
    MICROPHONE: 'microphone',
  };

  const [selectedFile, setSelectedFile] = useState({ name: '' });
  const [visualizationType, setVisualizationType] = useState(
    VISUALIZATION_TYPES.OSCILLATOR
  );
  const [visualizationSource, setVisualizationSource] = useState(
    VISUALIZATION_SOURCES.FILE
  );
  const { selectTheme } = props;
  var canvasTheme = 'default';
  const hiddenFileInput = React.useRef(null);

  var shouldStopOs = false;
  var shouldStopBar = false;
  var shouldStopCircle = false;
  var shouldStopLissa = false;
  var shouldStopColors = false;
  var shouldStopHarmono = false;

  const handleStop = () => {
    shouldStopOs = true;
    shouldStopBar = true;
    shouldStopCircle = true;
    shouldStopLissa = true;
    shouldStopColors = true;
    shouldStopHarmono = true;
  };

  const handleCanvasTheme = (event) => {
    canvasTheme = event.target.value;
    selectTheme(canvasTheme);
    handleStop();
  };

  const handleVisualizationType = (event) => {
    setVisualizationType(event.target.value);
    handleStop();
  };

  const handleVisualizationSource = (event) => {
    setVisualizationSource(event.target.value);
    handleStop();
  };
  ('');

  const handleFileUpload = (event) => {
    setSelectedFile(event.target.files[0]);
    handleStop();
  };

  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  const drawOscillator = () => {
    canvas = document.getElementById('visualization');
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // use a delay for waveform only
    if (!shouldStopOs) {
      setTimeout(() => {
        var drawVisual = requestAnimationFrame(drawOscillator);
      }, 50);
    }

    analyser.getByteTimeDomainData(dataArray); //waveform data

    ctx.fillStyle = props.theme.background;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.lineWidth = 1;
    ctx.strokeStyle = props.theme.secondary;
    ctx.beginPath();

    const BUFFER_LEN = dataArray.length;
    var sliceWidth = (WIDTH * 1.0) / BUFFER_LEN;
    var x = 0;

    for (var i = 0; i < BUFFER_LEN; i++) {
      var v = dataArray[i] / 128.0;
      var y = HEIGHT - (v * HEIGHT) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(WIDTH, HEIGHT / 2);
    ctx.stroke();

    if (shouldStopOs) {
      if (stream) {
        stream.pause();
      }
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }
  };

  const drawBar = () => {
    canvas = document.getElementById('visualization');
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // use a delay for waveform only
    if (!shouldStopBar) {
      var drawVisual = requestAnimationFrame(drawBar);
    }

    analyser.getByteFrequencyData(dataArray); //frequency data

    ctx.fillStyle = props.theme.background;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const BUFFER_LEN = dataArray.length;
    var barWidth = (WIDTH / BUFFER_LEN) * 20;
    var barHeight;
    var x = 0;

    for (var i = 0; i < BUFFER_LEN; i++) {
      barHeight = dataArray[i] * 3;

      ctx.fillStyle = props.theme.secondary;
      ctx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight);

      x += barWidth + 1;
    }

    if (shouldStopBar) {
      if (stream) {
        stream.pause();
      }
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }
  };

  const drawCircle = () => {
    canvas = document.getElementById('visualization');
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // use a delay
    if (!shouldStopCircle) {
      setTimeout(() => {
        var drawVisual = requestAnimationFrame(drawCircle);
      }, 50);
    }

    analyser.getByteFrequencyData(dataArray); //frequency data

    ctx.fillStyle = props.theme.background;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const BUFFER_LEN = dataArray.length;
    var x = WIDTH / 2;
    var y = HEIGHT / 2;

    for (var i = 0; i < BUFFER_LEN; i++) {
      ctx.strokeStyle = props.theme.secondary;
      ctx.beginPath();
      var radius = dataArray[i] / 2 + 50;
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.stroke();

      // smaller ring with tertiary colour
      // ctx.strokeStyle = props.theme.tertiary;
      // ctx.beginPath();
      // var radius = dataArray[i];
      // ctx.arc(x, y, radius, 0, 2 * Math.PI);
      // ctx.stroke();
    }

    if (shouldStopCircle) {
      if (stream) {
        stream.pause();
      }
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }
  };

  const drawLissajous = () => {
    canvas = document.getElementById('visualization');
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // use a delay
    if (!shouldStopLissa) {
      setTimeout(() => {
        var drawVisual = requestAnimationFrame(drawLissajous);
      }, 50);
    }

    analyser.getByteTimeDomainData(dataArray); //waveform data

    ctx.fillStyle = props.theme.background;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.strokeStyle = props.theme.secondary;

    const BUFFER_LEN = dataArray.length;
    var x, y;

    for (var i = 0; i < BUFFER_LEN; i++) {
      ctx.beginPath();
      // rotating cube
      x = 200 * Math.abs(Math.sin(1 * t + dataArray[i]));
      y = 200 * Math.abs(Math.sin(3 * t + dataArray[i]));
      // rotating ellipse
      // var x = dataArray[i] / 2 * Math.abs(Math.sin(1*t));
      // var y = dataArray[i] / 2 * Math.abs(Math.sin(3*t+Math.PI/2));
      ctx.ellipse(WIDTH / 2, HEIGHT / 2, x, y, 90, 0, 2 * Math.PI);
      ctx.stroke();
    }

    t += 0.01;

    if (shouldStopLissa) {
      if (stream) {
        stream.pause();
      }
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }
  };

  const drawColors = () => {
    canvas = document.getElementById('visualization');
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // use a delay for waveform only
    if (!shouldStopColors) {
      var drawVisual = requestAnimationFrame(drawColors);
    }

    analyser.getByteFrequencyData(dataArray); //frequency data

    ctx.fillStyle = props.theme.background;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const BUFFER_LEN = dataArray.length;
    var barWidth = (WIDTH / BUFFER_LEN) * 20;
    var barHeight;
    var x = 0;

    for (var i = 0; i < BUFFER_LEN; i++) {
      // barHeight = dataArray[i] * 2;
      barHeight = HEIGHT;
      ctx.globalAlpha = (dataArray[i] * 2) / HEIGHT;
      ctx.fillStyle = props.theme.secondary;
      ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

      x += barWidth;
    }

    if (shouldStopColors) {
      if (stream) {
        stream.pause();
      }
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      ctx.globalAlpha = 1;
    }
  };

  const drawHarmonograph = () => {
    canvas = document.getElementById('visualization');
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // use a delay
    if (!shouldStopHarmono) {
      setTimeout(() => {
        var drawVisual = requestAnimationFrame(drawHarmonograph);
      }, 75);
    }

    analyser.getByteTimeDomainData(dataArray); //waveform data
    analyser.getByteFrequencyData(dataArray2); //frequency data

    ctx.fillStyle = props.theme.background;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.strokeStyle = props.theme.secondary;
    ctx.fillStyle = props.theme.secondary;

    const BUFFER_LEN = dataArray.length;

    for (var i = 0; i < BUFFER_LEN; i++) {
      ctx.beginPath();
      // rotating cube
      var y = dataArray2[i]; //frequency data
      var x = dataArray[i]; //waveform data
      // rotating ellipse
      // var x = dataArray[i] / 2 * Math.abs(Math.sin(1*t));
      // var y = dataArray[i] / 2 * Math.abs(Math.sin(3*t+Math.PI/2));

      // DRAW 3 SKINNY ELLIPSE
      // ctx.ellipse(WIDTH / 4, HEIGHT / 2, x / 2, y, 0, 0, 2 * Math.PI);
      // ctx.ellipse((WIDTH * 2) / 4, HEIGHT / 2, x / 2, y, 0, 0, 2 * Math.PI);
      // ctx.ellipse((WIDTH * 3) / 4, HEIGHT / 2, x / 2, y, 0, 0, 2 * Math.PI);

      // DRAW WIDE ELLIPSE
      // ctx.ellipse(WIDTH / 2, HEIGHT / 2, y * 3, x, 0, 0, 2 * Math.PI);

      // DRAW GRID
      ctx.fillStyle = props.theme.secondary;
      ctx.fillRect((x * WIDTH) / 250, HEIGHT - y * 2 - 5, 5, 5);
      // ctx.fillStyle = props.theme.tertiary;
      // ctx.fillRect(x * 7, y * 2, 5, 5);
      // ctx.fillStyle = props.theme.secondary;
      // ctx.fillRect(WIDTH - y * 4 - 5, x * 2, 5, 5);
      // ctx.fillStyle = props.theme.tertiary;
      // ctx.fillRect(y * 4, x * 2, 5, 5);
      ctx.stroke();
    }

    t += 0.01;

    if (shouldStopHarmono) {
      if (stream) {
        stream.pause();
      }
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }
  };

  const setCanvasDimensions = () => {
    canvas = document.getElementById('visualization');
    ctx = canvas.getContext('2d');

    // get current size of the window
    let w = window.innerWidth * 0.8;
    let h =
      window.innerWidth <= 768
        ? window.innerHeight * 0.4
        : window.innerHeight * 0.8;

    // increase the actual size of our canvas
    canvas.width = w * devicePixelRatio;
    canvas.height = h * devicePixelRatio;

    // ensure all drawing operations are scaled
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // scale everything down using CSS
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    return [w, h];
  };

  const start = () => {
    [WIDTH, HEIGHT] = setCanvasDimensions();

    if (stream) {
      handleStop();
      stream.pause();
    }
    if (ctx) {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }

    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();

    if (visualizationSource === VISUALIZATION_SOURCES.MICROPHONE) {
      navigator.mediaDevices
        .getUserMedia({
          video: false,
          audio: true,
        })
        .then((stream) => {
          if (stream.getAudioTracks().length > 0) {
            var source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            document.body.classList.add('ready');
          } else {
            console.log(
              'Failed to get stream. Audio not shared or browser not supported'
            );
          }
        })
        .catch((err) => console.log('Unable to open capture: ', err));
    } else if (visualizationSource === VISUALIZATION_SOURCES.FILE) {
      const soundSrc = selectedFile.name.length
        ? URL.createObjectURL(selectedFile)
        : FILES[0];
      stream = new Audio(soundSrc);

      if (visualizationType === VISUALIZATION_TYPES.BAR) {
        shouldStopBar = false;
        shouldStopOs = true;
        shouldStopCircle = true;
        shouldStopLissa = true;
        shouldStopColors = true;
        shouldStopHarmono = true;
      } else if (visualizationType === VISUALIZATION_TYPES.OSCILLATOR) {
        shouldStopBar = true;
        shouldStopOs = false;
        shouldStopCircle = true;
        shouldStopLissa = true;
        shouldStopColors = true;
        shouldStopHarmono = true;
      } else if (visualizationType === VISUALIZATION_TYPES.CIRCLE) {
        shouldStopBar = true;
        shouldStopOs = true;
        shouldStopCircle = false;
        shouldStopLissa = true;
        shouldStopColors = true;
        shouldStopHarmono = true;
      } else if (visualizationType === VISUALIZATION_TYPES.LISSA) {
        shouldStopBar = true;
        shouldStopOs = true;
        shouldStopCircle = true;
        shouldStopLissa = false;
        shouldStopColors = true;
        shouldStopHarmono = true;
      } else if (visualizationType === VISUALIZATION_TYPES.COLORS) {
        shouldStopBar = true;
        shouldStopOs = true;
        shouldStopCircle = true;
        shouldStopLissa = true;
        shouldStopColors = false;
        shouldStopHarmono = true;
      } else if (visualizationType === VISUALIZATION_TYPES.HARMONO) {
        shouldStopBar = true;
        shouldStopOs = true;
        shouldStopCircle = true;
        shouldStopLissa = true;
        shouldStopColors = true;
        shouldStopHarmono = false;
      }
      setTimeout(() => {
        stream?.play();
      }, 100);

      var source = audioContext.createMediaElementSource(stream);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
    }

    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    dataArray2 = new Uint8Array(bufferLength);

    if (visualizationType === VISUALIZATION_TYPES.BAR) {
      drawBar();
    } else if (visualizationType === VISUALIZATION_TYPES.OSCILLATOR) {
      drawOscillator();
    } else if (visualizationType === VISUALIZATION_TYPES.CIRCLE) {
      drawCircle();
    } else if (visualizationType === VISUALIZATION_TYPES.LISSA) {
      drawLissajous();
    } else if (visualizationType === VISUALIZATION_TYPES.COLORS) {
      drawColors();
    } else if (visualizationType === VISUALIZATION_TYPES.HARMONO) {
      drawHarmonograph();
    }
  };

  const fullscreen = () => {
    canvas = document.getElementById('visualization');
    [WIDTH, HEIGHT] = setCanvasDimensions();
    if (canvas.webkitRequestFullScreen) {
      canvas.webkitRequestFullScreen();
    } else {
      canvas.mozRequestFullScreen();
    }
  };

  return (
    <Wrapper>
      <Title>visualizr</Title>
      <GithubIconWrapper
        href={'https://github.com/michelledang/visualizr'}
        target="_blank"
      >
        <GithubIcon src={'/github.svg'} alt={'GitHub Link'}></GithubIcon>
      </GithubIconWrapper>
      <StyledCanvas
        id="visualization"
        width={WIDTH}
        height={HEIGHT}
      ></StyledCanvas>
      <SettingsWrapper>
        <InputWrapper>
          <StyledLabel>
            {selectedFile && selectedFile.name !== ''
              ? selectedFile.name
              : 'no file selected'}
          </StyledLabel>
          <StyledSecondaryButton onClick={handleClick}>
            upload
          </StyledSecondaryButton>
          <input
            type="file"
            ref={hiddenFileInput}
            name="file"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </InputWrapper>
        <InputWrapper>
          <StyledLabel>source</StyledLabel>
          <StyledSelect
            id="visualization-source"
            name="visualization-source"
            onChange={(e) => {
              handleVisualizationSource(e);
            }}
          >
            {Object.keys(VISUALIZATION_SOURCES).map((key) => {
              return (
                <option key={key} value={VISUALIZATION_SOURCES[key]}>
                  {VISUALIZATION_SOURCES[key]}
                </option>
              );
            })}
          </StyledSelect>
        </InputWrapper>
        <InputWrapper>
          <StyledLabel>type</StyledLabel>
          <StyledSelect
            id="visualization-type"
            name="visualization-type"
            onChange={(e) => {
              handleVisualizationType(e);
            }}
          >
            {Object.keys(VISUALIZATION_TYPES).map((key) => {
              return (
                <option key={key} value={VISUALIZATION_TYPES[key]}>
                  {VISUALIZATION_TYPES[key]}
                </option>
              );
            })}
          </StyledSelect>
        </InputWrapper>
        <InputWrapper>
          <StyledLabel>theme</StyledLabel>
          <StyledSelect
            id="themes"
            name="themes"
            onChange={(e) => {
              handleCanvasTheme(e);
            }}
          >
            {Object.keys(THEMES).map((key) => {
              return (
                <option key={key} value={key}>
                  {THEMES[key].name}
                </option>
              );
            })}
          </StyledSelect>
        </InputWrapper>
        <StyledButton onClick={start}>start</StyledButton>
        <StyledIconWrapper onClick={fullscreen}>
          <StyledExpandIcon />
        </StyledIconWrapper>
      </SettingsWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const SettingsWrapper = styled.div`
  display: flex;
  align-self: center;
  justify-content: space-around;
  align-items: end;
  position: fixed;
  bottom: 2%;
  text-align-last: center;
  @media only screen and (max-width: 768px) {
    font-size: 18px;
    flex-wrap: wrap;
    bottom: 3%;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  text-align: center;
  letter-spacing: 2em;
  margin-top: 36px;
  margin-left: 25px;
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  color: ${({ theme }) => theme.primary};
  @media only screen and (max-width: 768px) {
    font-size: 18px;
    letter-spacing: 1em;
    margin-top: 20px;
    margin-left: 9px;
  }
`;

const StyledSecondaryButton = styled.button`
  display: flex;
  width: fit-content;
  align-self: center;
  justify-content: center;
  margin: 0 10px;
  color: ${({ theme }) => theme.primary};
  background-color: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.secondary};
  border-radius: 12px;
  padding: 7px 20px;
  @media only screen and (max-width: 768px) {
    width: 110px;
    margin: 0px;
  }
`;

const StyledButton = styled.button`
  display: flex;
  width: fit-content;
  align-self: center;
  justify-content: center;
  margin: 0 10px 16px;
  color: ${({ theme }) => theme.background};
  background-color: ${({ theme }) => theme.secondary};
  border: 1px solid ${({ theme }) => theme.secondary};
  border-radius: 12px;
  padding: 7px 20px;
  font-weight: 600;
  @media only screen and (max-width: 768px) {
    width: 110px;
    margin: 0 0 24px;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  justify-content: center;
  margin: 0 10px;
  font-size: 12px;
  color: ${({ theme }) => theme.primary};
  background-color: transparent;
  @media only screen and (max-width: 768px) {
    margin: 0 0 8px;
  }
`;

const StyledCanvas = styled.canvas`
  border: 1px solid ${({ theme }) => theme.primary};
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  &:fullscreen {
    background-color: ${({ theme }) => theme.background};
  }
  @media only screen and (max-width: 768px) {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -70%);
  }
`;

const StyledSelect = styled.select`
  color: ${({ theme }) => theme.primary};
  background-color: ${({ theme }) => theme.background};
  margin-left: 4px;
  border: 1px solid ${({ theme }) => theme.secondary};
  border-radius: 12px;
  padding: 7px 8px;
  @media only screen and (max-width: 768px) {
    width: 110px;
    margin: 0;
  }
`;

const StyledExpandIcon = styled(ExpandIcon)`
  width: 20px;
  height: 20px;
  margin-top: 8px;
  color: ${({ theme }) => theme.primary};
`;

const StyledIconWrapper = styled.div`
  width: 20px;
  height: 20px;
  margin-left: 4px;
  align-self: start;
  @media only screen and (max-width: 768px) {
    width: 110px;
    margin: 0 0 8px;
  }
`;

const GithubIconWrapper = styled.a`
  position: fixed;
  @media only screen and (min-width: 768px) {
    right: 20px;
    top: 20px;
  }
  @media only screen and (max-width: 768px) {
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
  }
`;

const GithubIcon = styled.img`
  width: 20px;
  height: 20px;
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.secondary};
`;
