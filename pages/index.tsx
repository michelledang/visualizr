import styled from 'styled-components';
import { AudioContext } from 'standardized-audio-context';

export default function Home() {
  const generateSineWave = () => {
    const audioContext = new AudioContext();
    const oscillatorNode = audioContext.createOscillator();

    oscillatorNode.connect(audioContext.destination);
    oscillatorNode.start();
  };

  const exampleSetup = () => {
    var stream = new Audio('/audio/file1.mp3');
    stream.play();

    const audioContext = new AudioContext();
    var analyser = audioContext.createAnalyser();

    var source = audioContext.createMediaElementSource(stream);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);

    analyser.getByteTimeDomainData(dataArray);
    console.log(dataArray);
  };
  return (
    <Wrapper>
      <Title>Visualizer</Title>
      <StyledButton onClick={generateSineWave}>sine wave</StyledButton>
      <StyledButton onClick={exampleSetup}>example setup</StyledButton>
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
