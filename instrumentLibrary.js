console.log('Instrument library script loaded');

// Simple InstrumentLibrary class
class InstrumentLibrary {
    constructor() {
        console.log('InstrumentLibrary constructor called');
        this.isOpen = false;
        
        // Piano-only presets
        this.pianoPresets = [
            { name: 'Grand Piano', rating: 5, type: 'acoustic' },
            { name: 'Concert Grand', rating: 5, type: 'acoustic' },
            { name: 'Studio Grand', rating: 4, type: 'acoustic' },
            { name: 'Upright Piano', rating: 4, type: 'acoustic' },
            { name: 'Jazz Piano', rating: 4, type: 'acoustic' },
            { name: 'Classical Piano', rating: 5, type: 'acoustic' },
            { name: 'Honky Tonk Piano', rating: 3, type: 'acoustic' },
            { name: 'Electric Piano', rating: 4, type: 'electric' },
            { name: 'Electric Grand', rating: 4, type: 'electric' },
            { name: 'Rhodes Piano', rating: 5, type: 'electric' },
            { name: 'Wurlitzer', rating: 4, type: 'electric' },
            { name: 'DX Piano', rating: 3, type: 'digital' },
            { name: 'Digital Piano', rating: 3, type: 'digital' },
            { name: 'Bright Piano', rating: 4, type: 'digital' },
            { name: 'Dark Piano', rating: 4, type: 'digital' }
        ];
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        console.log('Initializing instrument library');
        this.createLibraryDOM();
        
        // Connect to track creation dialog
        const createButton = document.querySelector('.create-button');
        if (createButton) {
            createButton.addEventListener('click', () => {
                console.log('Create button clicked');
                this.openLibrary();
            });
        }
        
        // Add keyboard shortcut (Ctrl/Cmd + B)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.toggleLibrary();
            }
        });
    }
    
    createLibraryDOM() {
        // Create main container with absolute positioning and high z-index
        this.container = document.createElement('div');
        this.container.className = 'instrument-browser';
        this.container.style.position = 'fixed';
        this.container.style.top = '50%';
        this.container.style.left = '50%';
        this.container.style.transform = 'translate(-50%, -50%)';
        this.container.style.width = '80%';
        this.container.style.height = '70%';
        this.container.style.backgroundColor = '#2c2c2c';
        this.container.style.display = 'none';
        this.container.style.flexDirection = 'column';
        this.container.style.borderRadius = '8px';
        this.container.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
        this.container.style.zIndex = '9999'; // Extremely high z-index
        this.container.style.color = '#fff';
        this.container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        this.container.style.overflow = 'hidden';
        
        // Create header with styles
        const header = document.createElement('div');
        header.className = 'browser-header';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.padding = '15px 20px';
        header.style.borderBottom = '1px solid #444';
        header.style.backgroundColor = '#1c1c1c';
        
        const title = document.createElement('div');
        title.className = 'browser-title';
        title.textContent = 'Piano Library';
        title.style.fontSize = '18px';
        title.style.fontWeight = 'bold';
        header.appendChild(title);
        
        // Create close button with styles
        this.closeButton = document.createElement('button');
        this.closeButton.className = 'browser-close';
        this.closeButton.innerHTML = '&times;';
        this.closeButton.style.background = 'none';
        this.closeButton.style.border = 'none';
        this.closeButton.style.color = '#999';
        this.closeButton.style.fontSize = '24px';
        this.closeButton.style.cursor = 'pointer';
        this.closeButton.style.padding = '0 5px';
        this.closeButton.addEventListener('click', () => this.closeLibrary());
        
        // Add hover effect to close button
        this.closeButton.addEventListener('mouseover', () => {
            this.closeButton.style.color = '#fff';
        });
        this.closeButton.addEventListener('mouseout', () => {
            this.closeButton.style.color = '#999';
        });
        
        header.appendChild(this.closeButton);
        this.container.appendChild(header);
        
        // Create main content area - horizontal scrollable layout
        const content = document.createElement('div');
        content.className = 'browser-content';
        content.style.flex = '1';
        content.style.overflowX = 'auto';
        content.style.overflowY = 'hidden';
        content.style.display = 'flex';
        content.style.flexDirection = 'row';
        content.style.padding = '20px';
        content.style.backgroundColor = '#252525';
        
        // Create piano presets grid
        this.pianoPresets.forEach(preset => {
            const presetCard = document.createElement('div');
            presetCard.className = 'preset-card';
            presetCard.style.minWidth = '200px';
            presetCard.style.height = '180px'; // Increased height for icon
            presetCard.style.margin = '0 10px';
            presetCard.style.backgroundColor = '#1c1c1c';
            presetCard.style.borderRadius = '8px';
            presetCard.style.padding = '15px';
            presetCard.style.display = 'flex';
            presetCard.style.flexDirection = 'column';
            presetCard.style.justifyContent = 'space-between';
            presetCard.style.cursor = 'pointer';
            presetCard.style.transition = 'all 0.2s ease';
            presetCard.style.border = '2px solid transparent';
            
            // Add piano icon
            const pianoIcon = this.createPianoIcon();
            presetCard.appendChild(pianoIcon);
            
            // Preset name
            const presetName = document.createElement('div');
            presetName.textContent = preset.name;
            presetName.style.fontSize = '16px';
            presetName.style.fontWeight = 'bold';
            presetName.style.color = '#fff';
            presetCard.appendChild(presetName);
            
            // Preset type
            const presetType = document.createElement('div');
            presetType.textContent = preset.type.charAt(0).toUpperCase() + preset.type.slice(1);
            presetType.style.fontSize = '12px';
            presetType.style.color = '#999';
            presetCard.appendChild(presetType);
            
            // Rating stars
            const ratingStars = document.createElement('div');
            ratingStars.className = 'rating-stars';
            ratingStars.style.display = 'flex';
            
            for (let i = 0; i < 5; i++) {
                const star = document.createElement('span');
                star.className = i < preset.rating ? 'star filled' : 'star';
                star.innerHTML = '★';
                star.style.color = i < preset.rating ? '#ffcc00' : '#555';
                star.style.marginRight = '2px';
                ratingStars.appendChild(star);
            }
            
            presetCard.appendChild(ratingStars);
            
            // Add click event with visual feedback
            presetCard.addEventListener('click', () => {
                // Remove selection from all cards
                document.querySelectorAll('.preset-card').forEach(card => {
                    card.style.border = '2px solid transparent';
                    card.style.backgroundColor = '#1c1c1c';
                });
                
                // Highlight this card
                presetCard.style.border = '2px solid #4c8bf5';
                presetCard.style.backgroundColor = '#2a2a2a';
                
                // Select the preset
                this.selectPreset(preset);
            });
            
            // Add hover effect
            presetCard.addEventListener('mouseover', () => {
                presetCard.style.backgroundColor = '#2a2a2a';
            });
            
            presetCard.addEventListener('mouseout', () => {
                presetCard.style.backgroundColor = '#1c1c1c';
            });
            
            content.appendChild(presetCard);
        });
        
        this.container.appendChild(content);
        
        // Add to document body
        document.body.appendChild(this.container);
        
        console.log('Piano library DOM created');
    }
    
    selectPreset(preset) {
        console.log('Selected preset:', preset.name);
        
        // Create a loading indicator
        const loadingOverlay = document.createElement('div');
        loadingOverlay.style.position = 'absolute';
        loadingOverlay.style.top = '0';
        loadingOverlay.style.left = '0';
        loadingOverlay.style.width = '100%';
        loadingOverlay.style.height = '100%';
        loadingOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.justifyContent = 'center';
        loadingOverlay.style.alignItems = 'center';
        loadingOverlay.style.zIndex = '10000';
        loadingOverlay.style.borderRadius = '8px';
        
        const loadingText = document.createElement('div');
        loadingText.textContent = `Loading ${preset.name}...`;
        loadingText.style.color = '#fff';
        loadingText.style.fontSize = '18px';
        
        loadingOverlay.appendChild(loadingText);
        this.container.appendChild(loadingOverlay);
        
        // Simulate loading time before closing
        setTimeout(() => {
            this.closeLibrary();
            console.log(`${preset.name} loaded successfully!`);
        }, 800);
    }
    
    toggleLibrary() {
        if (this.isOpen) {
            this.closeLibrary();
        } else {
            this.openLibrary();
        }
    }
    
    openLibrary() {
        console.log('Opening piano library');
        
        // Create a loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.style.position = 'fixed';
        loadingOverlay.style.top = '0';
        loadingOverlay.style.left = '0';
        loadingOverlay.style.width = '100%';
        loadingOverlay.style.height = '100%';
        loadingOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.flexDirection = 'column';
        loadingOverlay.style.justifyContent = 'center';
        loadingOverlay.style.alignItems = 'center';
        loadingOverlay.style.zIndex = '9998';
        
        const loadingText = document.createElement('div');
        loadingText.textContent = 'Loading Piano Library...';
        loadingText.style.color = '#fff';
        loadingText.style.fontSize = '18px';
        loadingText.style.marginTop = '15px';
        
        loadingOverlay.appendChild(this.createLoadingSpinner());
        loadingOverlay.appendChild(loadingText);
        
        document.body.appendChild(loadingOverlay);
        
        // Force the container to be visible with inline styles
        this.container.style.display = 'flex';
        this.container.style.zIndex = '9999';
        this.container.style.visibility = 'visible';
        this.container.style.opacity = '1';
        this.isOpen = true;
        
        // Force a reflow to ensure the browser renders it
        void this.container.offsetWidth;
        
        // Add the container to the body again to ensure it's at the top of the stacking context
        document.body.appendChild(this.container);
        
        // Remove the loading overlay after a short delay
        setTimeout(() => {
            document.body.removeChild(loadingOverlay);
        }, 500);
        
        // Log the current state for debugging
        console.log('Library container display:', this.container.style.display);
        console.log('Library container visibility:', window.getComputedStyle(this.container).visibility);
        console.log('Library container dimensions:', this.container.offsetWidth, 'x', this.container.offsetHeight);
    }
    
    closeLibrary() {
        console.log('Closing piano library');
        this.container.style.display = 'none';
        this.isOpen = false;
    }
    
    // Add a method to create a piano icon SVG
    createPianoIcon() {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "40");
        svg.setAttribute("height", "40");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.style.marginBottom = "10px";
        
        // Piano keys background
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", "2");
        rect.setAttribute("y", "4");
        rect.setAttribute("width", "20");
        rect.setAttribute("height", "16");
        rect.setAttribute("rx", "1");
        rect.setAttribute("ry", "1");
        rect.setAttribute("fill", "#444");
        svg.appendChild(rect);
        
        // White keys
        for (let i = 0; i < 7; i++) {
            const whiteKey = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            whiteKey.setAttribute("x", (2 + i * 2.85).toString());
            whiteKey.setAttribute("y", "4");
            whiteKey.setAttribute("width", "2.85");
            whiteKey.setAttribute("height", "16");
            whiteKey.setAttribute("fill", "#fff");
            svg.appendChild(whiteKey);
        }
        
        // Black keys
        const blackKeyPositions = [1, 2, 4, 5, 6];
        for (let i = 0; i < 5; i++) {
            const blackKey = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            blackKey.setAttribute("x", (3.5 + blackKeyPositions[i] * 2.85).toString());
            blackKey.setAttribute("y", "4");
            blackKey.setAttribute("width", "1.75");
            blackKey.setAttribute("height", "10");
            blackKey.setAttribute("fill", "#000");
            svg.appendChild(blackKey);
        }
        
        return svg;
    }
    
    // Add a loading spinner to make the experience more polished
    createLoadingSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.style.width = '40px';
        spinner.style.height = '40px';
        spinner.style.margin = '20px auto';
        spinner.style.borderRadius = '50%';
        spinner.style.border = '4px solid rgba(255, 255, 255, 0.1)';
        spinner.style.borderTopColor = '#4c8bf5';
        spinner.style.animation = 'spin 1s linear infinite';
        
        // Add the keyframes animation
        if (!document.getElementById('spinner-style')) {
            const style = document.createElement('style');
            style.id = 'spinner-style';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        return spinner;
    }
}

// Create a global instance
try {
    console.log('Creating instrumentLibrary instance');
    window.instrumentLibrary = new InstrumentLibrary();
    console.log('Instrument library initialized');
} catch (error) {
    console.error('Error initializing instrument library:', error);
} 