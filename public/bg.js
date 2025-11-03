const bg = document.getElementById('bg');
const info = document.getElementById('info');

// 시간대별 linear-gradient + 글자색/그림자
const gradients = [
  { startHour: 5,  gradient: "linear-gradient(0deg, rgba(255, 214, 252, 1) 0%, rgba(255, 255, 255, 1) 9%, rgba(216, 209, 255, 1) 17%, rgb(0 187 255) 65%)",
    color: "black", textShadow: "0 0 6px #ffffff" }, // dawn
  { startHour: 7,  gradient: "linear-gradient(0deg, rgb(238 255 165) 0%, rgba(255, 255, 255, 1) 9%, rgba(244, 250, 225, 1) 18%, rgba(33, 214, 255, 1) 65%)",
    color: "black", textShadow: "0 0 6px #ffffff" }, // morning
  { startHour: 12, gradient: "linear-gradient(0deg,rgba(0, 251, 255, 1) 0%, rgba(255, 255, 255, 1) 9%, rgba(216, 249, 255, 1) 18%, rgba(0, 220, 255, 1) 65%)",
    color: "black", textShadow: "0 0 6px #ffffff" }, // noon
  { startHour: 17, gradient: "linear-gradient(0deg, rgb(255 251 197) 0%, rgba(255, 255, 255, 1) 9%, rgb(255 252 216) 18%, rgb(255 142 48) 65%)",
    color: "black", textShadow: "0 0 6px #ffffff" }, // evening
  { startHour: 20, gradient: "linear-gradient(0deg, rgb(255 115 255) 0%, rgb(199 138 244) 9%, rgb(142 108 255) 17%, rgb(22 9 108) 65%)",
    color: "white", textShadow: "0 0 6px #ffffff" } // night
];

bg.style.transition = "background 2s ease"; // 배경 전환 부드럽게
info.style.transition = "color 2s ease, text-shadow 2s ease"; // 글자 전환 부드럽게

function getNextChangeTime(){
  const now = new Date();
  let nextHour = 24;
  const currentHour = now.getHours() + now.getMinutes()/60;

  for(let i=0; i<gradients.length; i++){
    if(gradients[i].startHour > currentHour){
      nextHour = gradients[i].startHour;
      break;
    }
  }
  if(nextHour <= currentHour) nextHour += 24; // 다음 날로 넘어가는 경우

  const msUntilNext = (nextHour - currentHour) * 60 * 60 * 1000;
  return msUntilNext;
}

function updateBackground(){
  const now = new Date();
  const hour = now.getHours() + now.getMinutes()/60;

  // 현재 시간대 gradient 찾기
  let current = gradients[gradients.length-1]; // 기본: 마지막 (night)
  for(let i=0; i<gradients.length; i++){
    let next = gradients[(i+1)%gradients.length];
    if(hour >= gradients[i].startHour && hour < next.startHour){
      current = gradients[i];
      break;
    }
  }

  bg.style.background = current.gradient;
  info.style.color = current.color;
  info.style.textShadow = current.textShadow;

  // 다음 시간대에 맞춰 다시 호출
  setTimeout(updateBackground, getNextChangeTime());
}

updateBackground();