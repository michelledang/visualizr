import React from "react";
import styled from "styled-components";
import { AudioContext } from "standardized-audio-context";
import { useState } from "react";
import THEMES from "../data/themes";

export default function Home(props) {
  var audioContext;
  var stream, analyser, dataArray, canvas, ctx;
  const WIDTH = 1000;
  const HEIGHT = 350;

  const FILES = [
    "/audio/file1.mp3",
    "/audio/file2.mp3",
    "/audio/sine440.wav",
    "/audio/square440.wav",
    "/audio/sawtooth440.wav",
  ];

  const VISUALIZATION_TYPES = {
    OSCILLATOR: "oscillator",
    BAR: "bar",
    CIRCLE: "circle",
  };

  const VISUALIZATION_SOURCES = {
    FILE: "file",
    MICROPHONE: "microphone",
  };

  const [selectedFile, setSelectedFile] = useState({ name: "" });
  const [visualizationType, setVisualizationType] = useState(
    VISUALIZATION_TYPES.OSCILLATOR
  );
  const [visualizationSource, setVisualizationSource] = useState(
    VISUALIZATION_SOURCES.FILE
  );
  const { selectTheme } = props;
  var canvasTheme = "default";
  const hiddenFileInput = React.useRef(null);

  var shouldStopOs = false;
  var shouldStopBar = false;
  var shouldStopCircle = false;

  const handleStop = () => {
    shouldStopOs = true;
    shouldStopBar = true;
    shouldStopCircle = true;
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

  const handleFileUpload = (event) => {
    setSelectedFile(event.target.files[0]);
    handleStop();
  };
  
  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  const drawOscillator = () => {
    canvas = document.getElementById("visualization");
    ctx = canvas.getContext("2d");
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
    canvas = document.getElementById("visualization");
    ctx = canvas.getContext("2d");
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
      barHeight = dataArray[i] * 2;

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
    canvas = document.getElementById("visualization");
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // use a delay for waveform only
    if (!shouldStopCircle) {
      setTimeout(() => {
        var drawVisual = requestAnimationFrame(drawCircle);
      }, 50);
    }

    analyser.getByteTimeDomainData(dataArray); //waveform data

    ctx.fillStyle = props.theme.background;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.strokeStyle = props.theme.secondary;
    ctx.beginPath();

    const BUFFER_LEN = dataArray.length;
    var x = 500;
    var y = 150;

    for (var i = 0; i < BUFFER_LEN; i++) {
      var radius = dataArray[i] / 5.0 + 50;
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
    }

    ctx.stroke();

    if (shouldStopCircle) {
      if (stream) {
        stream.pause();
      }
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }
  };

  const start = () => {
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
          
          document.body.classList.add("ready");
        } else {
          console.log(
          "Failed to get stream. Audio not shared or browser not supported"
          );
        }
      })
      .catch((err) => console.log("Unable to open capture: ", err));
    } else if (visualizationSource === VISUALIZATION_SOURCES.FILE) {
      const soundSrc = selectedFile.name.length
      ? URL.createObjectURL(selectedFile)
      : FILES[0];
      stream = new Audio(soundSrc);

      if (visualizationType === VISUALIZATION_TYPES.BAR) {
        shouldStopBar = false;
        shouldStopOs = true;
        shouldStopCircle = true;
      } else if (visualizationType === VISUALIZATION_TYPES.OSCILLATOR) {
        shouldStopBar = true;
        shouldStopOs = false;
        shouldStopCircle = true;
      } else if (visualizationType === VISUALIZATION_TYPES.CIRCLE) {
        shouldStopBar = true;
        shouldStopOs = true;
        shouldStopCircle = false;
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

    if (visualizationType === VISUALIZATION_TYPES.BAR) {
      drawBar();
    } else if (visualizationType === VISUALIZATION_TYPES.OSCILLATOR) {
      drawOscillator();
    } else if (visualizationType === VISUALIZATION_TYPES.CIRCLE) {
      drawCircle();
    }
  };

  return (
    <Wrapper>
      <Title>visualizer</Title>
      <StyledCanvas
        id="visualization"
        width={WIDTH}
        height={HEIGHT}
      ></StyledCanvas>
      <SettingsWrapper>
        <InputWrapper>
          <label>
            {selectedFile && selectedFile.name !== ""
              ? selectedFile.name
              : "no file selected"}
          </label>
          <StyledSecondaryButton onClick={handleClick}>
            upload
          </StyledSecondaryButton>
          <input
            type="file"
            ref={hiddenFileInput}
            name="file"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            />
        </InputWrapper>
        <InputWrapper>
          <label>source: </label>
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
          <label>type: </label>
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
          <label>theme: </label>
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
        <StyledButton
          onClick={start}
        >
          start
        </StyledButton>
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
  width: 800px;
  display: flex;
  align-self: center;
  justify-content: space-around;
`;

const Title = styled.h1`
  font-size: 40px;
  text-align: center;
  color: ${({ theme }) => theme.primary};
`;

const StyledSecondaryButton = styled.button`
  display: flex;
  width: fit-content;
  align-self: center;
  margin: 10px;
  color: ${({ theme }) => theme.primary};
  background-color: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.secondary};
  border-radius: 12px;
  padding: 8px 20px;
`;

const StyledButton = styled.button`
  display: flex;
  width: fit-content;
  align-self: center;
  margin: 10px;
  color: ${({ theme }) => theme.primary};
  background-color: ${({ theme }) => theme.secondary};
  border: 1px solid ${({ theme }) => theme.secondary};
  border-radius: 12px;
  padding: 8px 20px;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px;
  color: ${({ theme }) => theme.primary};
  background-color: ${({ theme }) => theme.background};
`;

const StyledCanvas = styled.canvas`
  margin: 0 0 20px 0;
`;

const StyledSelect = styled.select`
  color: ${({ theme }) => theme.primary};
  background-color: ${({ theme }) => theme.background};
  margin-left: 4px;
  border: 1px solid ${({ theme }) => theme.secondary};
  border-radius: 12px;
  padding: 7px 8px;
`;
