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

const gradients = [
  { startHour: 5,  gradient: "linear-gradient(0deg, rgba(255, 204, 251, 1) 0%, rgba(216, 209, 255, 1) 17%, rgba(0, 187, 255, 1) 65%)",
    color: "white", textShadow: "0 0 6px #ffffff" }, 
  { startHour: 7,  gradient: "linear-gradient(0deg, rgba(117, 255, 154, 1) 0%, rgba(127, 254, 252, 1) 18%, rgba(33, 214, 255, 1) 65%)",
    color: "white", textShadow: "0 0 6px #ffffff" }, 
  { startHour: 12, gradient: "linear-gradient(0deg,rgba(0, 225, 255, 1) 0%, rgba(169, 242, 255, 1) 18%, rgba(0, 220, 255, 1) 65%)",
    color: "white", textShadow: "0 0 6px #ffffff" }, 
  { startHour: 17, gradient: "linear-gradient(0deg, rgba(255, 197, 197, 1) 0%, rgba(253, 219, 204, 1) 9%, rgba(241, 216, 255, 1) 18%, rgba(50, 174, 255, 1) 65%)",
    color: "white", textShadow: "0 0 6px #ffffff" }, 
  { startHour: 20, gradient: "linear-gradient(0deg,rgba(0, 225, 255, 1) 0%, rgba(169, 242, 255, 1) 18%, rgba(0, 220, 255, 1) 65%)",
    color: "white", textShadow: "0 0 6px #ffffff" }
  // { startHour: 20, gradient: "linear-gradient(0deg, rgba(255, 115, 255, 1) 0%, rgba(199, 138, 244, 1) 9%, rgba(142, 108, 255, 1) 17%, rgba(22, 9, 108, 1) 65%)",
  //   color: "white", textShadow: "0 0 6px #ffffff" }
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

  bg.style.background = current.gradient;
  pageSlider.style.background = current.color;

  variBtns.forEach(btn => {
    btn.style.color = current.color;
    btn.style.webkitTextFillColor = current.color;
  });

  variBgs.forEach(bg => {
    bg.style.background = current.color;
  });

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

updateBackground();