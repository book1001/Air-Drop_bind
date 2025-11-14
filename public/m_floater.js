const letters = ['B','I','N','D','T','H','E','A','I','R'];
const letterElems = [];
const maxVisible = 3;

letters.forEach(l => {
    const span = document.createElement('span');
    span.className = 'floater';
    span.textContent = l;
    document.body.appendChild(span);
    
    letterElems.push({
        el: span,
        rotationY: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2, 
        opacity: 0,
        state: 'idle', 
        waitTime: 0
    });
});

function activateRandomLetter() {
    const inactive = letterElems.filter(obj => obj.state === 'idle');
    if (inactive.length === 0) return;

    const visibleCount = letterElems.filter(obj => obj.state !== 'idle').length;
    if (visibleCount >= maxVisible) return;

    const obj = inactive[Math.floor(Math.random() * inactive.length)];
    obj.state = 'fadeIn';
    obj.opacity = 0;
    obj.waitTime = Math.random() * 60 + 30; 
    obj.el.style.left = `${Math.random() * window.innerWidth}px`;
    obj.el.style.top = `${Math.random() * window.innerHeight}px`;
}

function animate() {
    requestAnimationFrame(animate);

    activateRandomLetter();

    letterElems.forEach(obj => {
        const el = obj.el;

        obj.rotationY += obj.rotationSpeed;
        el.style.transform = `rotateY(${obj.rotationY}deg)`;

        if (obj.state === 'fadeIn') {
            obj.opacity += 0.02;
            if (obj.opacity >= 1) {
                obj.opacity = 1;
                obj.state = 'visible';
            }
        } else if (obj.state === 'visible') {
            obj.waitTime--;
            if (obj.waitTime <= 0) obj.state = 'fadeOut';
        } else if (obj.state === 'fadeOut') {
            obj.opacity -= 0.02;
            if (obj.opacity <= 0) {
                obj.opacity = 0;
                obj.state = 'idle';
            }
        }

        el.style.opacity = obj.opacity;
    });
}

animate();


window.addEventListener('resize', () => {
    letterElems.forEach(obj => {
        obj.el.style.left = `${Math.random() * window.innerWidth}px`;
        obj.el.style.top = `${Math.random() * window.innerHeight}px`;
    });
});
