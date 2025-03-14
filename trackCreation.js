// Track creation script
document.addEventListener('DOMContentLoaded', () => {
    console.log('Track creation script loaded');
    
    const trackCreationDialog = document.querySelector('.track-creation-dialog');
    const softwareInstrumentButton = document.querySelector('.software-instrument-button');
    const createButton = document.querySelector('.create-button');
    const cancelButton = document.querySelector('.cancel-button');
    
    // Show dialog function (can be called from elsewhere)
    window.showTrackCreationDialog = function() {
        if (trackCreationDialog) {
            trackCreationDialog.style.display = 'flex';
        }
    };
    
    // Hide dialog function
    function hideTrackCreationDialog() {
        if (trackCreationDialog) {
            trackCreationDialog.style.display = 'none';
        }
    }
    
    // Select track type
    if (softwareInstrumentButton) {
        softwareInstrumentButton.addEventListener('click', () => {
            // Highlight the selected button
            document.querySelectorAll('.track-type-button').forEach(btn => {
                btn.classList.remove('selected');
            });
            softwareInstrumentButton.classList.add('selected');
        });
        
        // Select by default
        softwareInstrumentButton.classList.add('selected');
    }
    
    // Handle create button
    if (createButton) {
        createButton.addEventListener('click', () => {
            console.log('Create button clicked');
            
            // Check which track type is selected
            const selectedTrackType = document.querySelector('.track-type-button.selected');
            if (selectedTrackType && selectedTrackType.classList.contains('software-instrument-button')) {
                console.log('Software instrument track selected');
                
                // Hide the dialog first
                hideTrackCreationDialog();
                
                // Ensure the instrument library exists and is initialized
                if (!window.instrumentLibrary) {
                    console.log('Creating instrument library on demand');
                    try {
                        // Try to load the InstrumentLibrary class
                        window.instrumentLibrary = new InstrumentLibrary();
                    } catch (error) {
                        console.error('Error creating instrument library:', error);
                        
                        // As a fallback, reload the script
                        const script = document.createElement('script');
                        script.src = '../scripts/instrumentLibrary.js';
                        script.onload = () => {
                            console.log('Instrument library script loaded');
                            if (window.instrumentLibrary) {
                                window.instrumentLibrary.openLibrary();
                            }
                        };
                        document.head.appendChild(script);
                        return;
                    }
                }
                
                // Open the instrument library with a slight delay to ensure the dialog is hidden
                setTimeout(() => {
                    console.log('Opening instrument library directly...');
                    window.instrumentLibrary.openLibrary();
                    console.log('Library open state:', window.instrumentLibrary.isOpen);
                }, 50);
            } else {
                // For other track types, just hide the dialog
                hideTrackCreationDialog();
            }
        });
    }
    
    // Handle cancel button
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            hideTrackCreationDialog();
        });
    }
}); 