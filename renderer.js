const Metronome = require('./metronome');

let audioContext;
let metronome;
let isMetronomeEnabled = false;
let isTransportPlaying = false;

// Initialize audio context and metronome when the page loads
document.addEventListener('DOMContentLoaded', () => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    metronome = new Metronome(audioContext);

    // Transport controls
    const playButton = document.querySelector('.play-button');
    const stopButton = document.querySelector('.stop-button');

    if (playButton) {
        playButton.addEventListener('click', () => {
            isTransportPlaying = !isTransportPlaying;
            
            if (isTransportPlaying) {
                // Always resume from current position unless explicitly stopped
                if (isMetronomeEnabled) {
                    metronome.start(true); // Always resume from current position
                }
            } else {
                // Pause playback
                if (isMetronomeEnabled) {
                    metronome.pause();
                }
            }
        });
    }

    if (stopButton) {
        stopButton.addEventListener('click', () => {
            isTransportPlaying = false;
            if (isMetronomeEnabled) {
                metronome.stop(); // Only reset position when explicitly stopped
            }
        });
    }

    // Metronome toggle
    const metronomeButton = document.querySelector('.metronome-button');
    if (metronomeButton) {
        metronomeButton.addEventListener('click', () => {
            isMetronomeEnabled = !isMetronomeEnabled;
            
            if (isMetronomeEnabled && isTransportPlaying) {
                metronome.start(true); // Resume from current position
            } else if (isMetronomeEnabled) {
                // Just enable but don't start if transport isn't playing
                metronome.pause();
            } else {
                metronome.pause();
            }
        });
    }

    // Tempo control
    const tempoInput = document.querySelector('.tempo-input');
    if (tempoInput) {
        tempoInput.addEventListener('change', (e) => {
            const newTempo = parseInt(e.target.value, 10);
            metronome.setTempo(newTempo);
        });
    }

    // Handle window visibility
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (isTransportPlaying && isMetronomeEnabled) {
                metronome.pause();
            }
        } else if (isTransportPlaying && isMetronomeEnabled) {
            metronome.start(true); // Resume from current position
        }
    });
}); 