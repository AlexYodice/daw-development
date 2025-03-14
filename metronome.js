class Metronome {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.isPlaying = false;
        this.scheduleAheadTime = 0.1;
        this.lookahead = 25.0;
        this.tempo = 120;
        this.intervalID = null;

        // Simple position tracking
        this.currentBar = 1;        // Current bar (starting from 1)
        this.currentBeat = 0;       // Current beat in bar (0-3)
        this.nextNoteTime = 0;      // Next scheduled note time
    }

    getCurrentPosition() {
        return {
            bar: this.currentBar,
            beat: this.currentBeat
        };
    }

    scheduleNote(time) {
        if (!this.isPlaying) return;

        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // First beat of the bar
        if (this.currentBeat === 0) {
            osc.frequency.value = 1000;
            gainNode.gain.value = 0.3;
        } else {
            osc.frequency.value = 800;
            gainNode.gain.value = 0.2;
        }

        osc.start(time);
        osc.stop(time + 0.05);
    }

    scheduler() {
        if (!this.isPlaying) return;

        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            // Schedule current beat
            this.scheduleNote(this.nextNoteTime);
            
            // Advance to next beat
            this.currentBeat++;
            if (this.currentBeat >= 4) {
                this.currentBeat = 0;
                this.currentBar++;
            }

            // Calculate next note time
            const secondsPerBeat = 60.0 / this.tempo;
            this.nextNoteTime += secondsPerBeat;
        }
    }

    start() {
        if (this.isPlaying) return;

        // Start from current position - don't modify currentBar or currentBeat
        console.log('Starting at bar:', this.currentBar, 'beat:', this.currentBeat);
        
        this.nextNoteTime = this.audioContext.currentTime;
        this.isPlaying = true;
        this.intervalID = setInterval(() => this.scheduler(), this.lookahead);
    }

    pause() {
        if (!this.isPlaying) return;

        console.log('Pausing at bar:', this.currentBar, 'beat:', this.currentBeat);
        
        this.isPlaying = false;
        if (this.intervalID !== null) {
            clearInterval(this.intervalID);
            this.intervalID = null;
        }
    }

    stop() {
        this.isPlaying = false;
        // Only reset position on explicit stop
        this.currentBar = 1;
        this.currentBeat = 0;
        this.nextNoteTime = 0;
        
        if (this.intervalID !== null) {
            clearInterval(this.intervalID);
            this.intervalID = null;
        }
    }

    setTempo(newTempo) {
        this.tempo = Math.max(1, Math.min(999, newTempo));
        if (this.isPlaying) {
            this.nextNoteTime = this.audioContext.currentTime;
        }
    }

    // Method to manually set position
    setPosition(bar, beat) {
        this.currentBar = Math.max(1, bar);
        this.currentBeat = Math.min(3, Math.max(0, beat));
        if (this.isPlaying) {
            this.nextNoteTime = this.audioContext.currentTime;
        }
    }
}

module.exports = Metronome; 