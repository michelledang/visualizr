import styled from 'styled-components';
import { AudioContext } from 'standardized-audio-context';

export default function Home() {
  const generateSineWave = () => {
    const audioContext = new AudioContext();
    const oscillatorNode = audioContext.createOscillator();
    
    oscillatorNode.connect(audioContext.destination);
    oscillatorNode.start();
  };
  
  var audioContext;
  var analyser, dataArray, canvas, ctx; 
  const WIDTH = 1000;
  const HEIGHT = 100;
  
  const exampleSetup = () => {
    var stream = new Audio('/audio/square.wav');
    stream.play();

    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();

    var source = audioContext.createMediaElementSource(stream);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    canvas = document.getElementById('visualization');
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    function draw() {
      var drawVisual = requestAnimationFrame(draw);
      // analyser.getByteTimeDomainData(dataArray); //waveform data
      analyser.getByteFrequencyData(dataArray); //frequency data
  
      ctx.fillStyle = '#36eb7b';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgb(0, 0, 0)';
      ctx.beginPath();
  
      const BUFFER_LEN = dataArray.length;
      var sliceWidth = WIDTH * 1.0 / BUFFER_LEN;
      var x = 0;
  
      for(var i = 0; i < BUFFER_LEN; i++) {
        var v = dataArray[i] / 128.0;
        var y = v * HEIGHT/2;
  
        if(i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
  
        x += sliceWidth;
      }
  
      ctx.lineTo(WIDTH, HEIGHT/2);
      ctx.stroke();
    };

    draw();
  };


  return (
    <Wrapper>
      <Title>Visualizer</Title>
      <StyledButton onClick={generateSineWave}>sine wave</StyledButton>
      <StyledButton onClick={exampleSetup}>example setup</StyledButton>
      <canvas id="visualization" width={WIDTH} height={HEIGHT} style={{marginTop: "50px"}}></canvas>
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
