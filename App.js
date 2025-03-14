import React, { useEffect, useRef, useState } from 'react';
import './styles.css';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [currentTime, setCurrentTime] = useState({
    bar: 1,
    beat: 1,
    subBeat: 1,
    tick: 0
  });
  const [realTime, setRealTime] = useState('01:33');
  const [key, setKey] = useState({ note: 'C', type: 'maj' });
  const [cpuUsage, setCpuUsage] = useState(0);
  const [tracks, setTracks] = useState([]);
  const [zoom, setZoom] = useState(60); // Base zoom level
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const timelineRef = useRef(null);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const [showTrackSelection, setShowTrackSelection] = useState(false);
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [showKeySelector, setShowKeySelector] = useState(false);
  const [currentKey, setCurrentKey] = useState({ note: 'C', type: 'maj' });
  const [followSongKey, setFollowSongKey] = useState(false);
  const keySelectorRef = useRef(null);
  const [showTrackSelector, setShowTrackSelector] = useState(false);
  const [selectedTrackType, setSelectedTrackType] = useState(null);
  const [showInstrumentSelector, setShowInstrumentSelector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Audio context for metronome
  const audioContextRef = useRef(null);
  const metronomeIntervalRef = useRef(null);

  const lastTempoUpdateRef = useRef(null);
  const tempoTimeoutRef = useRef(null);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  // Simple metronome beep function
  const playBeep = (frequency = 880, duration = 0.05) => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.1;

    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  // Handle play/pause
  const handlePlayPause = () => {
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);

    if (newIsPlaying && isMetronomeOn) {
      // Start metronome
      const interval = (60 / tempo) * 1000; // Convert BPM to milliseconds
      metronomeIntervalRef.current = setInterval(() => {
        playBeep();
      }, interval);
    } else {
      // Stop metronome
      clearInterval(metronomeIntervalRef.current);
    }
  };

  // Handle metronome toggle
  const toggleMetronome = () => {
    const newIsMetronomeOn = !isMetronomeOn;
    setIsMetronomeOn(newIsMetronomeOn);

    if (!newIsMetronomeOn || !isPlaying) {
      clearInterval(metronomeIntervalRef.current);
    } else if (isPlaying) {
      const interval = (60 / tempo) * 1000;
      metronomeIntervalRef.current = setInterval(() => {
        playBeep();
      }, interval);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearInterval(metronomeIntervalRef.current);
    };
  }, []);

  // Update metronome when tempo changes
  useEffect(() => {
    if (isPlaying && isMetronomeOn) {
      clearInterval(metronomeIntervalRef.current);
      const interval = (60 / tempo) * 1000;
      metronomeIntervalRef.current = setInterval(() => {
        playBeep();
      }, interval);
    }
  }, [tempo]);

  // Update playhead position and time display
  useEffect(() => {
    const ticksPerBeat = 960;
    const beatsPerBar = 4;
    
    const totalTicks = playheadPosition * beatsPerBar * ticksPerBeat;
    const bar = Math.floor(playheadPosition) + 1;
    const beat = Math.floor((totalTicks / ticksPerBeat) % beatsPerBar) + 1;
    const subBeat = Math.floor((totalTicks % ticksPerBeat) / 240) + 1;
    const tick = Math.floor(totalTicks % 240);

    setCurrentTime({ bar, beat, subBeat, tick });
  }, [playheadPosition]);

  // Calculate subdivisions based on zoom level
  const getSubdivisions = (zoomLevel) => {
    if (zoomLevel >= 150) return 16; // Show 16th notes
    if (zoomLevel >= 100) return 8;  // Show 8th notes
    if (zoomLevel >= 60) return 4;   // Show quarter notes
    return 1;                        // Show only bars
  };

  // Handle zoom with improved precision
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        setZoom(prevZoom => {
          const zoomSpeed = prevZoom > 100 ? 2 : 1; // Faster zoom at higher levels
          const newZoom = prevZoom + (e.deltaY > 0 ? -5 : 5) * zoomSpeed;
          return Math.min(Math.max(newZoom, 30), 200); // Limit zoom range
        });
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Improved playback timing
  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = performance.now() - (playheadPosition * (60000 / tempo));
      
      const animate = (currentTime) => {
        const elapsedTime = currentTime - startTimeRef.current;
        const beatsElapsed = (elapsedTime * tempo) / 60000;
        const newPosition = beatsElapsed / 4; // Convert to bars
        setPlayheadPosition(newPosition);
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isPlaying, tempo]);

  // Improved grid snapping
  const snapToGrid = (position) => {
    const snapIncrement = 1/4; // Snap to quarter notes
    return Math.round(position / snapIncrement) * snapIncrement;
  };

  // Generate grid markers based on zoom level
  const generateGridMarkers = () => {
    const subdivisions = getSubdivisions(zoom);
    const visibleBars = Math.ceil(window.innerWidth / zoom) + 1; // Add 1 to ensure first bar is visible
    
    return Array.from({ length: visibleBars }, (_, barIndex) => {
      const subMarkers = Array.from({ length: subdivisions }, (_, subIndex) => ({
        position: barIndex + (subIndex / subdivisions),
        isMajor: subIndex === 0,
        label: subIndex === 0 ? (barIndex + 1).toString() : ''
      }));
      return subMarkers;
    }).flat();
  };

  const gridMarkers = generateGridMarkers();

  // Generate bar numbers starting from 1
  const generateBars = () => {
    const visibleBars = Math.ceil(window.innerWidth / zoom);
    return Array.from({ length: visibleBars }, (_, i) => i + 1);
  };

  const bars = generateBars();

  // Improved playhead positioning calculation
  const getPlayheadStyle = () => {
    // No additional offset needed, position 0 = bar 1
    return {
      left: `${playheadPosition * zoom}px`
    };
  };

  // Handle rewind
  const handleRewind = () => {
    setIsPlaying(false);
    clearInterval(metronomeIntervalRef.current);
    setPlayheadPosition(0);
  };

  // Handle playhead dragging
  const handlePlayheadMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setIsPlaying(false);
    
    const startX = e.clientX;
    const startPosition = playheadPosition;
    
    const handleDrag = (moveEvent) => {
      if (timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const deltaX = moveEvent.clientX - startX;
        const barsPerPixel = 1 / zoom;
        let newPosition = startPosition + (deltaX * barsPerPixel);
        newPosition = Math.max(0, snapToGrid(newPosition));
        setPlayheadPosition(newPosition);
      }
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
    };

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleAddTrack = () => {
    setShowTrackSelection(true);
  };

  // All possible keys
  const keys = [
    'C', 'Db', 'D', 'Eb', 'E', 'F',
    'F#', 'G', 'Ab', 'A', 'Bb', 'B'
  ];

  // Handle click outside key selector
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (keySelectorRef.current && !keySelectorRef.current.contains(event.target)) {
        setShowKeySelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Key selector component
  const KeySelector = () => (
    <div className="key-selector-modal" ref={keySelectorRef}>
      <div className="key-selector-header">
        <button className="back-button" onClick={() => setShowKeySelector(false)}>
          ← Settings
        </button>
        <h2>Key Signature</h2>
      </div>

      <div className="key-grid">
        {keys.map((key) => (
          <button
            key={key}
            className={`key-button ${currentKey.note === key ? 'selected' : ''}`}
            onClick={() => setCurrentKey({ ...currentKey, note: key })}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="scale-toggle">
        <button
          className={`scale-button ${currentKey.type === 'maj' ? 'selected' : ''}`}
          onClick={() => setCurrentKey({ ...currentKey, type: 'maj' })}
        >
          major
        </button>
        <button
          className={`scale-button ${currentKey.type === 'min' ? 'selected' : ''}`}
          onClick={() => setCurrentKey({ ...currentKey, type: 'min' })}
        >
          minor
        </button>
      </div>

      <div className="follow-key-toggle">
        <span>Follow Song Key</span>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={followSongKey}
            onChange={(e) => setFollowSongKey(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>

      <p className="key-description">
        Each song has a key, which defines the central note to which other notes in the music relate.
      </p>
    </div>
  );

  // Optimized tempo change handler
  const handleTempoChange = (newValue) => {
    // Clear any pending updates
    if (tempoTimeoutRef.current) {
      clearTimeout(tempoTimeoutRef.current);
    }

    // Clamp tempo between reasonable values
    const newTempo = Math.min(Math.max(newValue, 20), 300);
    
    // Update immediately for UI responsiveness
    setTempo(newTempo);

    // Debounce the actual tempo update
    const now = Date.now();
    if (!lastTempoUpdateRef.current || now - lastTempoUpdateRef.current > 50) {
      // If it's been more than 50ms since last update, update immediately
      updateTempoNow(newTempo);
      lastTempoUpdateRef.current = now;
    } else {
      // Otherwise, schedule an update
      tempoTimeoutRef.current = setTimeout(() => {
        updateTempoNow(newTempo);
      }, 50);
    }
  };

  // Immediate tempo update function
  const updateTempoNow = (newTempo) => {
    // Update playback speed, metronome, etc.
    if (isPlaying && isMetronomeOn) {
      // Update metronome timing
      clearInterval(metronomeIntervalRef.current);
      const interval = (60 / newTempo) * 1000;
      metronomeIntervalRef.current = setInterval(() => {
        playBeep();
      }, interval);
    }
    
    // Update playhead movement speed if needed
    if (isPlaying) {
      // Reset animation timing
      cancelAnimationFrame(animationFrameRef.current);
      startTimeRef.current = performance.now() - (playheadPosition * (60000 / newTempo));
      requestAnimationFrame(animate);
    }
  };

  // Handle tempo input with arrow keys
  const handleTempoKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleTempoChange(tempo + 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleTempoChange(tempo - 1);
    }
  };

  const trackTypes = [
    {
      id: 'software-instrument',
      name: 'Software Instrument',
      description: 'Use a MIDI keyboard to play virtual instruments',
      icon: '🎹'
    },
    {
      id: 'audio',
      name: 'Audio',
      description: 'Record using a microphone or audio interface',
      icon: '🎤'
    },
    {
      id: 'guitar',
      name: 'Guitar',
      description: 'Record guitar or bass through an audio interface',
      icon: '🎸'
    },
    {
      id: 'drummer',
      name: 'Drummer',
      description: 'Add dynamic drum tracks to your project',
      icon: '🥁'
    }
  ];

  const handleCreateTrack = () => {
    if (!selectedTrackType) return;

    const newTrack = {
      id: Date.now(),
      type: selectedTrackType,
      name: `Track ${tracks.length + 1}`
    };

    setTracks([...tracks, newTrack]);
    setShowTrackSelector(false);
    setSelectedTrackType(null);
  };

  const TrackSelector = () => (
    <div className="modal-overlay">
      <div className="track-selector-modal">
        <div className="modal-header">
          <h2>New Track</h2>
          <button 
            className="close-button"
            onClick={() => setShowTrackSelector(false)}
          >
            ✕
          </button>
        </div>

        <div className="track-types-grid">
          {trackTypes.map((type) => (
            <button
              key={type.id}
              className={`track-type-button ${selectedTrackType === type.id ? 'selected' : ''}`}
              onClick={() => setSelectedTrackType(type.id)}
            >
              <span className="track-type-icon">{type.icon}</span>
              <div className="track-type-info">
                <h3>{type.name}</h3>
                <p>{type.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="modal-footer">
          <button 
            className="cancel-button"
            onClick={() => {
              setShowTrackSelector(false);
              setSelectedTrackType(null);
            }}
          >
            Cancel
          </button>
          <button
            className={`create-button ${selectedTrackType ? 'active' : ''}`}
            onClick={handleCreateTrack}
            disabled={!selectedTrackType}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );

  // Instrument categories and data
  const instrumentLibrary = {
    'Synthesizers': {
      icon: '🎹',
      instruments: [
        { id: 'analog-pad', name: 'Analog Pad', image: 'analog-pad.png' },
        { id: 'arp-synth', name: 'Arpeggiator', image: 'arp-synth.png' },
        { id: 'lead-synth', name: 'Lead Synth', image: 'lead-synth.png' },
      ]
    },
    'Orchestral': {
      icon: '🎻',
      subcategories: {
        'Strings': {
          instruments: [
            { id: 'string-ensemble', name: 'String Ensemble', image: 'strings.png' },
            { id: 'solo-violin', name: 'Solo Violin', image: 'violin.png' },
          ]
        },
        'Brass': {
          instruments: [
            { id: 'brass-section', name: 'Brass Section', image: 'brass.png' },
            { id: 'solo-trumpet', name: 'Solo Trumpet', image: 'trumpet.png' },
          ]
        }
      }
    },
    'Bass': {
      icon: '🎸',
      instruments: [
        { id: 'electric-bass', name: 'Electric Bass', image: 'ebass.png' },
        { id: 'synth-bass', name: 'Synth Bass', image: 'synth-bass.png' },
      ]
    }
  };

  const InstrumentSelector = () => (
    <div className="instrument-selector-modal">
      <div className="instrument-library-panel">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search instruments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="category-list">
          {Object.entries(instrumentLibrary).map(([category, data]) => (
            <div key={category} className="category-item">
              <div 
                className={`category-header ${selectedCategory === category ? 'selected' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                <span className="category-icon">{data.icon}</span>
                <span className="category-name">{category}</span>
              </div>
              
              {selectedCategory === category && (
                <div className="instrument-list">
                  {data.subcategories ? (
                    Object.entries(data.subcategories).map(([subcat, subdata]) => (
                      <div key={subcat} className="subcategory">
                        <div className="subcategory-header">{subcat}</div>
                        {subdata.instruments.map(instrument => (
                          <div
                            key={instrument.id}
                            className={`instrument-item ${selectedInstrument?.id === instrument.id ? 'selected' : ''}`}
                            onClick={() => setSelectedInstrument(instrument)}
                          >
                            {instrument.name}
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    data.instruments.map(instrument => (
                      <div
                        key={instrument.id}
                        className={`instrument-item ${selectedInstrument?.id === instrument.id ? 'selected' : ''}`}
                        onClick={() => setSelectedInstrument(instrument)}
                      >
                        {instrument.name}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="instrument-preview-panel">
        {selectedInstrument ? (
          <>
            <div className="instrument-image">
              <img src={selectedInstrument.image} alt={selectedInstrument.name} />
            </div>
            <h2>{selectedInstrument.name}</h2>
          </>
        ) : (
          <div className="no-selection">
            Select an instrument to preview
          </div>
        )}
      </div>

      <div className="track-settings-panel">
        <div className="settings-header">
          <h3>Track Settings</h3>
        </div>
        <div className="settings-content">
          <div className="setting-group">
            <label>MIDI Input</label>
            <select>
              <option>All MIDI Inputs</option>
            </select>
          </div>
          <div className="setting-group">
            <label>Channel</label>
            <select>
              <option>Channel 1</option>
            </select>
          </div>
          <div className="setting-group">
            <label>Transpose</label>
            <input type="number" defaultValue="0" />
          </div>
          <div className="setting-group">
            <label>Velocity</label>
            <input type="range" min="0" max="127" defaultValue="100" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="daw-container">
      <div className="transport-bar">
        <div className="transport-section left">
          <button 
            className="transport-button rewind"
            onClick={handleRewind}
          >
            ◁
          </button>
          <button 
            className={`transport-button play ${isPlaying ? 'active' : ''}`}
            onClick={handlePlayPause}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button 
            className={`transport-button record ${isRecording ? 'active' : ''}`}
            onClick={() => setIsRecording(!isRecording)}
          >
            ●
          </button>
          <button 
            className={`transport-button loop ${isLooping ? 'active' : ''}`}
            onClick={() => setIsLooping(!isLooping)}
          >
            ↻
          </button>
        </div>

        <div className="transport-section center">
          <div className="time-display">
            <div className="position-display">
              <span>{String(currentTime.bar).padStart(2, '0')}</span>
              <span>{String(currentTime.beat).padStart(2, '0')}</span>
              <span>{String(currentTime.subBeat).padStart(2, '0')}</span>
              <span>{String(currentTime.tick).padStart(3, '0')}</span>
            </div>
            <span>{realTime}</span>
            
            <div className="tempo-control">
              <input
                type="number"
                value={Math.round(tempo)}
                onChange={(e) => handleTempoChange(parseFloat(e.target.value))}
                onKeyDown={handleTempoKeyDown}
                className="tempo-input"
                min="20"
                max="300"
              />
              <span>BPM</span>
            </div>
            
            <button 
              className={`metronome-button ${isMetronomeOn ? 'active' : ''}`}
              onClick={toggleMetronome}
              title="Metronome"
            >
              <svg viewBox="0 0 24 24" className="metronome-icon">
                <path d="M12 1L4 22h16L12 1zm0 4.2l5.8 15.3H6.2L12 5.2z"/>
                <path d="M12 12v6" className="metronome-pendulum"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="transport-section right">
          <button
            className="key-display-button"
            onClick={() => setShowKeySelector(true)}
          >
            {currentKey.note} {currentKey.type}
          </button>
          <button className="transport-button link">Link</button>
          <div className="midi-indicator"></div>
          <div className="cpu-meter">
            <div className="cpu-fill"></div>
          </div>
          <button className="transport-button count-in">1234</button>
        </div>
      </div>

      <div className="track-list-panel">
        <div className="tracks-container">
          {tracks.map((track, index) => (
            <div key={index} className="track-info">
              {/* Track info */}
            </div>
          ))}
        </div>
        <div className="track-controls">
          <button 
            className="add-track-button"
            onClick={() => setShowTrackSelector(true)}
            title="Add Track"
          >
            +
          </button>
        </div>
      </div>

      {showKeySelector && <KeySelector />}
      
      {/* Main Timeline Area */}
      <div className="timeline-container" ref={timelineRef}>
        <div className="bar-numbers">
          {bars.map(num => (
            <div key={num} className="bar-number">{num}</div>
          ))}
        </div>
        
        <div 
          className={`playhead-container ${isPlaying ? 'playing' : ''} ${isDragging ? 'dragging' : ''}`}
          style={getPlayheadStyle()}
        >
          <div 
            className="playhead-handle"
            onMouseDown={handlePlayheadMouseDown}
          />
          <div className="playhead-line" />
        </div>

        <div 
          className="tracks-area" 
          style={{ 
            '--bar-width': `${zoom}px`,
            '--subdivision-count': getSubdivisions(zoom)
          }}
        >
          <div className="grid-overlay">
            {gridMarkers.map((marker, i) => (
              <div
                key={i}
                className={`grid-line ${marker.isMajor ? 'major' : 'minor'}`}
                style={{ left: `${marker.position * zoom}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      {showTrackSelector && <TrackSelector />}
      
      {showInstrumentSelector && <InstrumentSelector />}
      
      {/* Add button to show instrument selector */}
      <button onClick={() => setShowInstrumentSelector(true)}>
        Add Software Instrument
      </button>
    </div>
  );
}

export default App; 