import React from 'react';
const aubio = window.aubio;

const context = {
    bufferSize: 4096,
    audioContext: null,
    analyser: null,
    scriptProcessor: null,
}

const noteStrings = [
    "C",
    "C♯",
    "D",
    "D♯",
    "E",
    "F",
    "F♯",
    "G",
    "G♯",
    "A",
    "A♯",
    "B",
];

const getNote = (frequency) => {
    return Math.round(12 * (Math.log(frequency / 440) / Math.log(2))) + 69;
}

const getOctave = (frequency) => {
    const note = getNote(frequency);
    return parseInt(note / 12) - 1;
}

const getNoteName = (frequency) => {
    const note = getNote(frequency);
    return noteStrings[note % 12];
}

const getCents = (frequency) => {
    const note = getNote(frequency);
    const standardFrequency = 440 * Math.pow(2, (note - 69) / 12);
    return Math.floor(
        (1200 * Math.log(frequency / standardFrequency)) / Math.log(2)
    )
}

const start = (onFrequencyGet) => {
    context.audioContext = new window.AudioContext();
    context.analyser = context.audioContext.createAnalyser();
    context.scriptProcessor = context.audioContext.createScriptProcessor(context.bufferSize, 1, 1);
    context.scriptProcessor.connect(context.audioContext.destination);

    aubio().then(({Pitch}) => {
        console.log('aubio then')
        const pitchDetector = new Pitch(
            "default",
            context.bufferSize,
            1,
            context.audioContext.sampleRate
        );

        navigator.mediaDevices
            .getUserMedia({audio: true})
            .then(function (stream) {
                context.audioContext.createMediaStreamSource(stream).connect(context.analyser);
                context.analyser.connect(context.scriptProcessor);
                context.scriptProcessor.connect(context.audioContext.destination);

                context.scriptProcessor.addEventListener("audioprocess", function (event) {
                    const data = event.inputBuffer.getChannelData(0);
                    const frequency = pitchDetector.do(data);

                    if (frequency) {
                        onFrequencyGet(frequency);
                    }
                });
            })
            .catch(function (error) {
                alert(error.name + ": " + error.message);
            });
    });
}

const getRandomNote = () => {
    const minFrequency = 80;
    const maxFrequency = 800;

    const getRandomFrequency = () => {
        return Math.random() * (maxFrequency - minFrequency) + minFrequency;
    }
    let frequency = getRandomFrequency();
    const countRepeat = getOctave(frequency) - 1;

    for (let i = 0; i < countRepeat; i++) {
        if (getOctave(frequency) < 4) {
            return getNoteFromFrequency(frequency);
        }
        frequency = getRandomFrequency();
    }
    return getNoteFromFrequency(frequency);
}

const getNoteFromFrequency = (frequency) => {
    return {
        name: getNoteName(frequency),
        value: getNote(frequency),
        cents: getCents(frequency),
        octave: getOctave(frequency),
        frequency: frequency,
    }
}

function App() {
    const currentNote = React.useRef(null);
    const [currentNoteName, setCurrentNoteName] = React.useState('');

    const checkNote = React.useCallback((frequency) => {
        const note = getNoteFromFrequency(frequency);
        if (note.value === currentNote.current.value) {
            currentNote.current = getRandomNote();
            setCurrentNoteName(currentNote.current.name + '_' + currentNote.current.octave);
        }
    }, []);

    const handleStart = React.useCallback(() => {
        currentNote.current = getRandomNote();
        setCurrentNoteName(currentNote.current.name + '_' + currentNote.current.octave);
        start(checkNote);
    }, [checkNote]);

    return (
        <div>
            <div>{currentNoteName}</div>
            <button onClick={handleStart}>TEST</button>
        </div>
    );
}

export default App;
