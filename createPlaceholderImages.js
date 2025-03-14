// Create placeholder images for missing instrument images
document.addEventListener('DOMContentLoaded', () => {
    // Create a canvas for piano image
    const pianoCanvas = document.createElement('canvas');
    pianoCanvas.width = 200;
    pianoCanvas.height = 100;
    const pianoCtx = pianoCanvas.getContext('2d');
    
    // Draw piano placeholder
    pianoCtx.fillStyle = '#333';
    pianoCtx.fillRect(0, 0, 200, 100);
    pianoCtx.fillStyle = 'white';
    pianoCtx.font = '16px Arial';
    pianoCtx.fillText('Piano', 80, 50);
    
    // Convert to data URL
    const pianoDataUrl = pianoCanvas.toDataURL();
    
    // Create a canvas for drums image
    const drumsCanvas = document.createElement('canvas');
    drumsCanvas.width = 200;
    drumsCanvas.height = 100;
    const drumsCtx = drumsCanvas.getContext('2d');
    
    // Draw drums placeholder
    drumsCtx.fillStyle = '#333';
    drumsCtx.fillRect(0, 0, 200, 100);
    drumsCtx.fillStyle = 'white';
    drumsCtx.font = '16px Arial';
    drumsCtx.fillText('Drums', 80, 50);
    
    // Convert to data URL
    const drumsDataUrl = drumsCanvas.toDataURL();
    
    // Create image elements and add to document
    const pianoImg = new Image();
    pianoImg.src = pianoDataUrl;
    pianoImg.id = 'piano-image';
    pianoImg.style.display = 'none';
    
    const drumsImg = new Image();
    drumsImg.src = drumsDataUrl;
    drumsImg.id = 'drums-image';
    drumsImg.style.display = 'none';
    
    document.body.appendChild(pianoImg);
    document.body.appendChild(drumsImg);
}); 