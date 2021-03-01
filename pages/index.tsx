import styled from 'styled-components';
import { AudioContext } from 'standardized-audio-context';
import SpotifyPlayer from 'react-spotify-web-playback';

export default function Home() {
  var audioContext;
  var analyser, dataArray, canvas, ctx;
  const WIDTH = 1000;
  const HEIGHT = 100;

  const draw = () => {
    canvas = document.getElementById('visualization');
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    var drawVisual = requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);

    ctx.fillStyle = '#36eb7b';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgb(0, 0, 0)';
    ctx.beginPath();

    const BUFFER_LEN = dataArray.length;
    var sliceWidth = (WIDTH * 1.0) / BUFFER_LEN;
    var x = 0;

    for (var i = 0; i < BUFFER_LEN; i++) {
      var v = dataArray[i] / 128.0;
      var y = (v * HEIGHT) / 2;

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
  const generateSineWave = () => {
    const audioContext = new AudioContext();
    const oscillatorNode = audioContext.createOscillator();

    oscillatorNode.connect(audioContext.destination);
    oscillatorNode.start();
  };

  const exampleSetup = () => {
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

    draw();
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

    analyser.getByteTimeDomainData(dataArray);
    console.log(dataArray);

    draw();
  };

  // this doesn't work lol
  const spotifySetup = () => {
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();

    navigator.mediaDevices
      // @ts-ignore
      .getDisplayMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        if (stream.getVideoTracks().length > 0) {
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

    analyser.getByteTimeDomainData(dataArray);
    console.log(dataArray);

    draw();
  };

  return (
    <Wrapper>
      <Title>Visualizer</Title>
      <StyledButton onClick={generateSineWave}>sine wave</StyledButton>
      <StyledButton onClick={exampleSetup}>example setup</StyledButton>
      <StyledButton onClick={microphoneSetup}>microphone setup</StyledButton>
      <StyledButton onClick={spotifySetup}>spotify setup</StyledButton>
      <canvas
        id="visualization"
        width={WIDTH}
        height={HEIGHT}
        style={{ marginTop: '50px' }}
      ></canvas>
      <SpotifyPlayer
        token="BQD33hGqZk6PhHt-SRuIRPEcX-WXCBD8L0Iw9v5XI6HixmyF2S4hutEwfEQ_kjCcE7XI1RXi0CJe57yvHgyDq84jbjBkVvAVrYMORoVuuJ0yyvaITDjOyDpyU7EVWyK_Eww0CvsglaV9cTWfj5MDJed5WRbVtUvMCIosmc6nZYY_cjew3VHJc_3QeMpIzD5UQw"
        uris={['spotify:track:3X4dCNeVxPCqiRfyB5hJeH']}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  font-size: 50px;
  text-align: center;
  color: ${({ theme }) => theme.colors.primary};
`;

const StyledButton = styled.button`
  display: flex;
  width: fit-content;
  align-self: center;
  margin: 10px;
`;
