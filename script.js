class Viewer360 {
    constructor() {
        this.container = document.getElementById('viewer-container');
        this.currentImageIndex = 1; // Start at 1 instead of 0
        this.totalImages = 32;
        this.isDragging = false;
        this.lastX = 0;
        this.sensitivity = 5;
        
        this.setupImageStack();
        this.setupEventListeners();
    }

    setupImageStack() {
        // Create and append all image elements
        for (let i = 1; i <= this.totalImages; i++) { // Start from 1, go up to 32
            const img = document.createElement('img');
            img.alt = `Frame ${i}`;
            // Create padded number for filename (1 becomes 0001)
            const paddedNumber = String(i).padStart(4, '0');
            img.src = `images/yaleLock360_v2_${paddedNumber}.png`;
            img.draggable = false;
            img.fetchPriority = "low";
            
            // Apply Cylindo-like styling
            img.style.cssText = `
                position: absolute;
                display: block;
                z-index: -1;
                opacity: 0;
            `;
            
            this.container.appendChild(img);
        }
        
        // Show initial frame
        this.updateVisibleFrame(1); // Start at frame 1
    }

    updateVisibleFrame(index) {
        // Hide all frames
        const allFrames = this.container.getElementsByTagName('img');
        for (let i = 0; i < allFrames.length; i++) {
            const frame = allFrames[i];
            frame.style.zIndex = '-1';
            frame.style.opacity = '0';
            frame.fetchPriority = 'low';
        }
        
        // Show current frame (subtract 1 from index since array is 0-based)
        const currentFrame = allFrames[index - 1];
        currentFrame.style.removeProperty('z-index');
        currentFrame.style.removeProperty('opacity');
        currentFrame.fetchPriority = 'high';
        
        // Update current index
        this.currentImageIndex = index;
        
        // Preload next and previous frames
        this.updateAdjacentFramesPriority(index);
    }

    updateAdjacentFramesPriority(index) {
        const allFrames = this.container.getElementsByTagName('img');
        
        // Calculate adjacent indices with wrap-around
        const nextIndex = (index % this.totalImages) || this.totalImages; // When index is 32, return 32
        const prevIndex = ((index - 2 + this.totalImages) % this.totalImages) + 1; // Maintain 1-32 range
        
        // Set adjacent frames to high priority (subtract 1 for array index)
        allFrames[nextIndex - 1].fetchPriority = 'high';
        allFrames[prevIndex - 1].fetchPriority = 'high';
    }

    drag(e) {
        if (!this.isDragging) return;

        const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const deltaX = currentX - this.lastX;

        if (Math.abs(deltaX) > this.sensitivity) {
            if (deltaX > 0) {
                const newIndex = (this.currentImageIndex - 1) || this.totalImages; // If result is 0, use 32
                this.updateVisibleFrame(newIndex);
            } else {
                const newIndex = (this.currentImageIndex % this.totalImages) + 1; // If index is 32, wrap to 1
                this.updateVisibleFrame(newIndex);
            }
            this.lastX = currentX;
        }

        if (e.type.includes('touch')) {
            e.preventDefault();
        }
    }

    // Other methods remain unchanged
    startDrag(e) {
        this.isDragging = true;
        this.lastX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        
        if (e.type.includes('touch')) {
            e.preventDefault();
        }
    }

    stopDrag() {
        this.isDragging = false;
    }

    setupEventListeners() {
        // Mouse events
        this.container.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.stopDrag());
        document.addEventListener('mouseleave', () => this.stopDrag());

        // Touch events
        this.container.addEventListener('touchstart', (e) => this.startDrag(e));
        document.addEventListener('touchmove', (e) => this.drag(e));
        document.addEventListener('touchend', () => this.stopDrag());
        document.addEventListener('touchcancel', () => this.stopDrag());
    }
}

// Initialize viewer when page loads
window.addEventListener('load', () => {
    new Viewer360();
});