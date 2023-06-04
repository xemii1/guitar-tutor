import React from 'react';
import aubio from 'aubiojs';

const start = () => {
    const bufferSize = 4096;
    const audioContext = new window.AudioContext();
    const analyser = audioContext.createAnalyser();
    const scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1);
    scriptProcessor.connect(audioContext.destination);

    aubio().then(({Pitch}) => {
        console.log('aubio then')
        const pitchDetector = new Pitch(
            "default",
            bufferSize,
            1,
            audioContext.sampleRate
        );

        navigator.mediaDevices
            .getUserMedia({audio: true})
            .then(function (stream) {
                console.log('navigator mediaDevices')
                audioContext.createMediaStreamSource(stream).connect(analyser);
                analyser.connect(scriptProcessor);
                scriptProcessor.connect(audioContext.destination);

                scriptProcessor.addEventListener("audioprocess", function (event) {
                    console.log('audioprocess');
                    const data = event.inputBuffer.getChannelData(0);
                    const frequency = pitchDetector.do(data);
                    console.log('audioprocess f', frequency);

                    if (frequency) {
                        console.log(frequency.toFixed(1) + " Hz");
                    }
                });
            })
            .catch(function (error) {
                alert(error.name + ": " + error.message);
            });
    });
}

function App() {
    return (
        <button onClick={() => start()}>TEST</button>
    );
}

export default App;
