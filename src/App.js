import React from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import NoteLabel from "./components/NoteLabel";

const muiCache = createCache({
    key: 'mui',
    prepend: true,
});
const materialTheme = createTheme();

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
    const standardFrequency = getReferenceFrequency(frequency)
    return Math.floor(
        (1200 * Math.log(frequency / standardFrequency)) / Math.log(2)
    )
}

const getReferenceFrequency = (frequency) => {
    const note = getNote(frequency);
    return 440 * Math.pow(2, (note - 69) / 12);
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
    const referenceNote = React.useRef(null);
    const counter = React.useRef(0);
    const [currentNote, setCurrentNote] = React.useState(null);
    const [noteRange, setNoteRange] = React.useState(0);

    const checkNote = React.useCallback((frequency) => {
        const note = getNoteFromFrequency(frequency);
        setNoteRange(note.value - referenceNote.current.value);
        if (note.value === referenceNote.current.value) {
            counter.current++;
        }
        if (counter.current > 5) {
            referenceNote.current = getRandomNote();
            counter.current = 0;
            setCurrentNote({
                name: referenceNote.current.name,
                octave: referenceNote.current.octave
            });
        }
    }, []);

    const handleStart = React.useCallback(() => {
        referenceNote.current = getRandomNote();
        setCurrentNote({
            name: referenceNote.current.name,
            octave: referenceNote.current.octave
        });
        start(checkNote);
    }, [checkNote]);

    return (
        <CacheProvider value={muiCache}>
            <ThemeProvider theme={materialTheme}>
                <CssBaseline />
                <Box display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'} position={'absolute'} width={'100%'} height={'100%'}>
                    <Box width={200} display={'flex'} justifyContent={'center'} flexDirection={'column'}>
                        {currentNote && <NoteLabel name={currentNote.name} octave={currentNote.octave} />}
                        {currentNote && <div>{noteRange}</div>}
                        {!currentNote && <Box>
                            <Button onClick={handleStart} variant={'contained'}>Начать</Button>
                        </Box> }
                    </Box>
                </Box>
            </ThemeProvider>
        </CacheProvider>
    );
}

export default App;
