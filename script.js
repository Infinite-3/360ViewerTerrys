class Viewer360 {
    constructor() {
        this.container = document.getElementById('viewer-container');
        this.currentImageIndex = 1;
        this.totalImages = 32;
        this.isDragging = false;
        this.lastX = 0;
        this.sensitivity = 5;
        
        this.setupImageStack();
        this.setupEventListeners();
    }

    setupImageStack() {
        for (let i = 1; i <= this.totalImages; i++) {
            const img = document.createElement('img');
            img.alt = `Frame ${i}`;
            const paddedNumber = String(i).padStart(4, '0');
            img.src = `images/yaleLock360_v2_${paddedNumber}.webp`;
            img.draggable = false;
            img.fetchPriority = "low";
            
            img.style.cssText = `
                position: absolute;
                display: block;
                z-index: -1;
                opacity: 0;
            `;
            
            this.container.appendChild(img);
        }
        
        this.updateVisibleFrame(1);
    }

    updateVisibleFrame(index) {
        const allFrames = this.container.getElementsByTagName('img');
        for (let i = 0; i < allFrames.length; i++) {
            const frame = allFrames[i];
            frame.style.zIndex = '-1';
            frame.style.opacity = '0';
            frame.fetchPriority = 'low';
        }
        
        const currentFrame = allFrames[index - 1];
        currentFrame.style.removeProperty('z-index');
        currentFrame.style.removeProperty('opacity');
        currentFrame.fetchPriority = 'high';
        
        this.currentImageIndex = index;
        
        this.updateAdjacentFramesPriority(index);
    }

    updateAdjacentFramesPriority(index) {
        const allFrames = this.container.getElementsByTagName('img');
        
        const nextIndex = (index % this.totalImages) || this.totalImages;
        const prevIndex = ((index - 2 + this.totalImages) % this.totalImages) + 1;
        
        allFrames[nextIndex - 1].fetchPriority = 'high';
        allFrames[prevIndex - 1].fetchPriority = 'high';
    }

    drag(e) {
        if (!this.isDragging) return;

        const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const deltaX = currentX - this.lastX;

        if (Math.abs(deltaX) > this.sensitivity) {
            if (deltaX < 0) { // Changed from deltaX > 0 to deltaX < 0
                const newIndex = (this.currentImageIndex - 1) || this.totalImages;
                this.updateVisibleFrame(newIndex);
            } else { // Changed from deltaX < 0 to else (deltaX > 0)
                const newIndex = (this.currentImageIndex % this.totalImages) + 1;
                this.updateVisibleFrame(newIndex);
            }
            this.lastX = currentX;
        }

        if (e.type.includes('touch')) {
            e.preventDefault();
        }
    }

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
        this.container.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.stopDrag());
        document.addEventListener('mouseleave', () => this.stopDrag());

        this.container.addEventListener('touchstart', (e) => this.startDrag(e));
        document.addEventListener('touchmove', (e) => this.drag(e));
        document.addEventListener('touchend', () => this.stopDrag());
        document.addEventListener('touchcancel', () => this.stopDrag());
    }
}

window.addEventListener('load', () => {
    new Viewer360();
});