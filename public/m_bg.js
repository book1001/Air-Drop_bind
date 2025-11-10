const bg = document.getElementById('bg');
// const pageSlider = document.getElementById('pageSlider');
const variBtns = document.querySelectorAll('.variBtn');
const variBgs = document.querySelectorAll('.variBg');

let sliderStyleTag = document.getElementById('slider-style');
if (!sliderStyleTag) {
  sliderStyleTag = document.createElement('style');
  sliderStyleTag.id = 'slider-style';
  document.head.appendChild(sliderStyleTag);
}


// 시간대별 linear-gradient + 글자색/그림자
const gradients = [
  { startHour: 5,  gradient: "linear-gradient(0deg, rgba(255, 214, 252, 1) 0%, rgba(255, 255, 255, 1) 9%, rgba(216, 209, 255, 1) 17%, rgb(0 187 255) 65%)",
    color: "white", textShadow: "0 0 6px #ffffff" }, // dawn
  { startHour: 7,  gradient: "linear-gradient(0deg, rgb(238 255 165) 0%, rgba(255, 255, 255, 1) 9%, rgba(244, 250, 225, 1) 18%, rgba(33, 214, 255, 1) 65%)",
    color: "black", textShadow: "0 0 6px #ffffff" }, // morning
  { startHour: 12, gradient: "linear-gradient(0deg,rgba(0, 251, 255, 1) 0%, rgba(255, 255, 255, 1) 9%, rgba(216, 249, 255, 1) 18%, rgba(0, 220, 255, 1) 65%)",
    color: "black", textShadow: "0 0 6px #ffffff" }, // noon
  { startHour: 17, gradient: "linear-gradient(0deg, rgb(255 197 197) 0%, rgb(253 219 204) 9%, rgb(241 216 255) 18%, rgb(50 174 255) 65%)",
    color: "white", textShadow: "0 0 6px #ffffff" }, // evening
  { startHour: 20, gradient: "linear-gradient(0deg, rgb(255 115 255) 0%, rgb(199 138 244) 9%, rgb(142 108 255) 17%, rgb(22 9 108) 65%)",
    color: "white", textShadow: "0 0 6px #ffffff" } // night
];

function getCurrentGradient(hour){
  for(let i=gradients.length-1; i>=0; i--){
    if(hour >= gradients[i].startHour){
      return gradients[i];
    }
  }
  return gradients[0];
}

function getNextChangeTime(){
  const now = new Date();
  const hour = now.getHours() + now.getMinutes()/60;
  for(let i=0; i<gradients.length; i++){
    if(gradients[i].startHour > hour){
      return (gradients[i].startHour - hour) * 3600 * 1000;
    }
  }
  return (24 + gradients[0].startHour - hour) * 3600 * 1000;
}

function updateBackground(){
  const now = new Date();
  const hour = now.getHours() + now.getMinutes()/60;
  const current = getCurrentGradient(hour);

  // 배경 & 글자
  bg.style.background = current.gradient;
  pageSlider.style.background = current.color;
  // info.style.color = current.color;
  // info.style.textShadow = current.textShadow;

  // variBtns 글자 색
  variBtns.forEach(btn => {
    btn.style.color = current.color;
    btn.style.webkitTextFillColor = current.color;
    // btn.style.textShadow = current.textShadow;
  });

  variBgs.forEach(bg => {
    bg.style.background = current.color;
  });

  // input[type="range"] thumb 색상 적용
  if(pageSlider){
    sliderStyleTag.innerHTML = `
      #pageSlider::-webkit-slider-thumb {
        background: ${current.color};
      }
      #pageSlider::-moz-range-thumb {
        background: ${current.color};
      }
    `;
  }

  setTimeout(updateBackground, getNextChangeTime());
}

// 바로 실행
updateBackground();


// function getNextChangeTime(){
//   const now = new Date();
//   let nextHour = 24;
//   const currentHour = now.getHours() + now.getMinutes()/60;

//   for(let i=0; i<gradients.length; i++){
//     if(gradients[i].startHour > currentHour){
//       nextHour = gradients[i].startHour;
//       break;
//     }
//   }
//   if(nextHour <= currentHour) nextHour += 24; // 다음 날로 넘어가는 경우

//   const msUntilNext = (nextHour - currentHour) * 60 * 60 * 1000;
//   return msUntilNext;
// }

// function updateBackground(){
//   const now = new Date();
//   const hour = now.getHours() + now.getMinutes()/60;

//   // 현재 시간대 gradient 찾기
//   let current = gradients[gradients.length-1]; // 기본: 마지막 (night)
//   for(let i=0; i<gradients.length; i++){
//     let next = gradients[(i+1)%gradients.length];
//     if(hour >= gradients[i].startHour && hour < next.startHour){
//       current = gradients[i];
//       break;
//     }
//   }

//   bg.style.background = current.gradient;
//   info.style.color = current.color;
//   info.style.textShadow = current.textShadow;

//   // 각 요소에 -webkit-text-fill-color 적용
//   variBtns.forEach(btn => {
//     // current.color를 적용한다고 가정
//     btn.style.color = current.color;
//     btn.style.webkitTextFillColor = current.color;
//     btn.style.textShadow = current.textShadow;
//     // 또는 setProperty 방식
//     // btn.style.setProperty('-webkit-text-fill-color', current.color);
//   });

//   // 다음 시간대에 맞춰 다시 호출
//   setTimeout(updateBackground, getNextChangeTime());
// }

// updateBackground();