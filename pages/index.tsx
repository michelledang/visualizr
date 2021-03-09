import styled from 'styled-components';
import { AudioContext } from 'standardized-audio-context';
// import SpotifyPlayer from 'react-spotify-web-playback';
import { useState } from 'react';
import THEMES from '../data/themes';

export default function Home(props) {
  var audioContext;
  var analyser, dataArray, canvas, ctx;
  const WIDTH = 1000;
  const HEIGHT = 350;

  const [isWaveform, setIsWaveform] = useState(true);
  const { selectTheme } = props;

  const handleVisualizationToggle = (event) => {
    setIsWaveform(event.target.checked);
  }

  const drawOscillator = () => {
    canvas = document.getElementById('visualization');
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // use a delay for waveform only
    if (isWaveform) {
      setTimeout(() => {
        var drawVisual = requestAnimationFrame(drawOscillator);
      }, 100);
    } else {
      var drawVisual = requestAnimationFrame(drawOscillator);
    }

    if (isWaveform) {
      analyser.getByteTimeDomainData(dataArray); //waveform data
    } else {
      analyser.getByteFrequencyData(dataArray); //frequency data
    }

    ctx.fillStyle = props.theme.background;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.lineWidth = 1;
    ctx.strokeStyle = props.theme.secondary;
    ctx.beginPath();

    const BUFFER_LEN = dataArray.length;
    var sliceWidth = (WIDTH * 1.0) / BUFFER_LEN;
    var x = 0;

    for (var i = 0; i < BUFFER_LEN; i++) {
      if (isWaveform) {
        var v = dataArray[i] / 128.0;
        var y = (v * HEIGHT) / 2;
      } else {
        var v = dataArray[i] / 400.0;
        var y = (v * HEIGHT) / 2 + 50.0;
      }

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(WIDTH, HEIGHT / 2);
    ctx.stroke();
  };

  const drawBar = () => {
    canvas = document.getElementById('visualization');
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // use a delay for waveform only
    if (isWaveform) {
      setTimeout(() => {
        var drawVisual = requestAnimationFrame(drawBar);
      }, 100);
    } else {
      var drawVisual = requestAnimationFrame(drawBar);
    }

    if (isWaveform) {
      analyser.getByteTimeDomainData(dataArray); //waveform data
    } else {
      analyser.getByteFrequencyData(dataArray); //frequency data
    }

    ctx.fillStyle = props.theme.background;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    const BUFFER_LEN = dataArray.length;
    var barWidth = (WIDTH / BUFFER_LEN) * 20;
    var barHeight;
    var x = 0;

    for (var i = 0; i < BUFFER_LEN; i++) {
      if (isWaveform) {
        barHeight = dataArray[i] * 3;
      } else {
        barHeight = dataArray[i] * 2;
      }

      ctx.fillStyle = props.theme.secondary;
      ctx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight);

      x += barWidth + 1;
    }
  };

  const generateSineWave = () => {
    const audioContext = new AudioContext();
    const oscillatorNode = audioContext.createOscillator();

    oscillatorNode.connect(audioContext.destination);
    oscillatorNode.start();
  };

  const oscillator = () => {
    var stream = new Audio('/audio/file1.mp3');
    stream.play();

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
    var stream = new Audio('/audio/file1.mp3');
    stream.play();

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

  const microphoneSetup = () => {
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();

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

    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    drawOscillator();
  };

  // this doesn't work lol
  const spotifySetup = () => {
  //   audioContext = new AudioContext();
  //   analyser = audioContext.createAnalyser();

  //   navigator.mediaDevices
  //     // @ts-ignore
  //     .getDisplayMedia({
  //       video: true,
  //       audio: true,
  //     })
  //     .then((stream) => {
  //       if (stream.getVideoTracks().length > 0) {
  //         var source = audioContext.createMediaStreamSource(stream);
  //         source.connect(analyser);

  //         document.body.classList.add('ready');
  //       } else {
  //         console.log(
  //           'Failed to get stream. Audio not shared or browser not supported'
  //         );
  //       }
  //     })
  //     .catch((err) => console.log('Unable to open capture: ', err));

  //   analyser.fftSize = 2048;
  //   var bufferLength = analyser.frequencyBinCount;
  //   dataArray = new Uint8Array(bufferLength);

  //   analyser.getByteTimeDomainData(dataArray);
  //   console.log(dataArray);

  //   draw();
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
        <StyledButton onClick={oscillator}>oscillator</StyledButton>
        <StyledButton onClick={bar}>bar</StyledButton>
        <StyledButton onClick={microphoneSetup}>microphone setup</StyledButton>
        {/* <StyledButton onClick={generateSineWave}>sine wave</StyledButton> */}
        {/* <StyledButton onClick={spotifySetup}>spotify setup</StyledButton> */}
        <InputWrapper>
          <label>theme: </label>
          <StyledSelect id="themes" name="themes" onChange={selectTheme}>
            {Object.keys(THEMES).map(key => {
              return <option value={key}>{THEMES[key].name}</option>;
            })}
          </StyledSelect>
        </InputWrapper>
        <InputWrapper>
          <label>isWaveform: </label>
          <input
            name="visualization-type"
            type="checkbox"
            checked={isWaveform}
            onChange={handleVisualizationToggle} />
        </InputWrapper>
        {/* <SpotifyPlayer
          token="BQD33hGqZk6PhHt-SRuIRPEcX-WXCBD8L0Iw9v5XI6HixmyF2S4hutEwfEQ_kjCcE7XI1RXi0CJe57yvHgyDq84jbjBkVvAVrYMORoVuuJ0yyvaITDjOyDpyU7EVWyK_Eww0CvsglaV9cTWfj5MDJed5WRbVtUvMCIosmc6nZYY_cjew3VHJc_3QeMpIzD5UQw"
          uris={['spotify:track:3X4dCNeVxPCqiRfyB5hJeH']}
        /> */}
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