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

  const [selectedFile, setSelectedFile] = useState({ name: "" });
  const { selectTheme } = props;
  var shouldStopOs = false;
  var shouldStopBar = false;
  var shouldStopCircle = false;
  var canvasTheme = "default";
  const hiddenFileInput = React.useRef(null);

  const handleStop = () => {
    shouldStopOs = true;
    shouldStopBar = true;
    shouldStopCircle = true;
  };

  const handleCanvasTheme = (event) => {
    canvasTheme = event.target.value;
    handleStop();
  };

  const handleFileUpload = (event) => {
    setSelectedFile(event.target.files[0]);
    handleStop();
  };

  const handleClick = (event) => {
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
      stream.pause();
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
      stream.pause();
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
      stream.pause();
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }
  };

  const generateSineWave = () => {
    const audioContext = new AudioContext();
    const oscillatorNode = audioContext.createOscillator();

    oscillatorNode.connect(audioContext.destination);
    oscillatorNode.start();
  };

  const oscillator = () => {
    if (stream) {
      handleStop();
      stream.pause();
    }
    if (ctx) {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }

    if (selectedFile.name.length) {
      const soundSrc = URL.createObjectURL(selectedFile);
      stream = new Audio(soundSrc);
    } else {
      stream = new Audio(FILES[0]);
    }
    shouldStopOs = false;

    setTimeout(() => {
      stream.play();
    }, 100);

    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();

    var source = audioContext.createMediaElementSource(stream);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    drawOscillator();
  };

  const bar = () => {
    if (stream) {
      handleStop();
      stream.pause();
    }
    if (ctx) {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }

    if (selectedFile.name.length) {
      const soundSrc = URL.createObjectURL(selectedFile);
      stream = new Audio(soundSrc);
    } else {
      stream = new Audio(FILES[0]);
    }
    shouldStopBar = false;

    setTimeout(() => {
      stream.play();
    }, 100);

    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();

    var source = audioContext.createMediaElementSource(stream);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    drawBar();
  };

  const circle = () => {
    if (stream) {
      handleStop();
      stream.pause();
    }
    if (ctx) {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }

    if (selectedFile.name.length) {
      const soundSrc = URL.createObjectURL(selectedFile);
      stream = new Audio(soundSrc);
    } else {
      stream = new Audio(FILES[0]);
    }
    shouldStopCircle = false;

    setTimeout(() => {
      stream.play();
    }, 100);

    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();

    var source = audioContext.createMediaElementSource(stream);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    drawCircle();
  };

  const microphoneSetup = () => {
    if (stream) {
      handleStop();
      stream.pause();
    }
    if (ctx) {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }

    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();

    shouldStopOs = false;

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

    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    drawOscillator();
  };

  return (
    <Wrapper>
      <Title>visualizer</Title>
      <StyledLabel>
        <label>
          {selectedFile && selectedFile.name !== ""
            ? selectedFile.name
            : "no file selected"}
        </label>
      </StyledLabel>
      <InputWrapper>
        <StyledButton onClick={handleClick}>upload</StyledButton>
        <input
          type="file"
          ref={hiddenFileInput}
          name="file"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
      </InputWrapper>
      <StyledCanvas
        id="visualization"
        width={WIDTH}
        height={HEIGHT}
      ></StyledCanvas>
      <SettingsWrapper>
        <StyledButton onClick={oscillator}>oscillator</StyledButton>
        <StyledButton onClick={bar}>bar</StyledButton>
        <StyledButton onClick={circle}>circle</StyledButton>
        <StyledButton onClick={microphoneSetup}>microphone setup</StyledButton>
        {/* <StyledButton onClick={spotifySetup}>spotify setup</StyledButton> */}
        <InputWrapper>
          <label>theme: </label>
          <StyledSelect
            id="themes"
            name="themes"
            onChange={(e) => {
              handleCanvasTheme(e);
              selectTheme(e);
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

const StyledButton = styled.button`
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

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px;
  color: ${({ theme }) => theme.primary};
  background-color: ${({ theme }) => theme.background};
`;

const StyledLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -10px;
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
