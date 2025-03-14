const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'electronAPI',
    {
        send: (channel, data) => {
            const validChannels = ['instrument-selected', 'create-software-instrument-track', 'open-instrument-library'];
            if (validChannels.includes(channel)) {
                console.log(`Sending ${channel}:`, data);
                ipcRenderer.send(channel, data);
            }
        },
        onInstrumentSelected: (callback) => {
            ipcRenderer.on('instrument-selected', (event, ...args) => callback(...args))
        }
    }
)

// Add event listener for instrument selection
window.addEventListener('DOMContentLoaded', () => {
    const instrumentList = document.getElementById('instrument-list');
    if (instrumentList) {
        instrumentList.addEventListener('click', (event) => {
            const instrument = event.target.dataset.instrument;
            if (instrument) {
                console.log('Instrument selected:', instrument);
                window.electronAPI.send('instrument-selected', instrument);
            }
        });
    } else {
        console.error('Instrument list element not found');
    }
});

// Example logic for handling computer keyboard input
document.addEventListener('keydown', (event) => {
    const note = mapKeyToNote(event.key);
    if (note) {
        playNote(note);
    }
});

function mapKeyToNote(key) {
    // Map keys to MIDI notes
    const keyMap = {
        'a': 'C4',
        's': 'D4',
        'd': 'E4',
        'f': 'F4',
        // Add more mappings as needed
    };
    return keyMap[key];
}

function playNote(note) {
    // Logic to play the note using a library like Tone.js
    console.log('Playing note:', note);
} 