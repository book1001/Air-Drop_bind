const letters = ['B','I','N','D','T','H','E','A','I','R'];
const letterElems = [];
const maxVisible = 3;

// 글자 요소 생성
letters.forEach(l => {
    const span = document.createElement('span');
    span.className = 'floater';
    span.textContent = l;
    document.body.appendChild(span);
    
    letterElems.push({
        el: span,
        rotationY: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2, // y축 회전 속도
        opacity: 0,
        state: 'idle', // idle, fadeIn, visible, fadeOut
        waitTime: 0
    });
});

// 랜덤 글자 활성화 함수
function activateRandomLetter() {
    const inactive = letterElems.filter(obj => obj.state === 'idle');
    if (inactive.length === 0) return;

    const visibleCount = letterElems.filter(obj => obj.state !== 'idle').length;
    if (visibleCount >= maxVisible) return;

    const obj = inactive[Math.floor(Math.random() * inactive.length)];
    obj.state = 'fadeIn';
    obj.opacity = 0;
    obj.waitTime = Math.random() * 60 + 30; // visible 유지 시간
    obj.el.style.left = `${Math.random() * window.innerWidth}px`;
    obj.el.style.top = `${Math.random() * window.innerHeight}px`;
}

// 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);

    // 랜덤 글자 활성화
    activateRandomLetter();

    letterElems.forEach(obj => {
        const el = obj.el;

        // y축 회전
        obj.rotationY += obj.rotationSpeed;
        el.style.transform = `rotateY(${obj.rotationY}deg)`;

        // 상태별 opacity 처리
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

// 창 크기 변경 대응
window.addEventListener('resize', () => {
    letterElems.forEach(obj => {
        obj.el.style.left = `${Math.random() * window.innerWidth}px`;
        obj.el.style.top = `${Math.random() * window.innerHeight}px`;
    });
});
