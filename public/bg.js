const bg = document.getElementById('bg');
const info = document.getElementById('info');

const icons = [
  { id: "icon_cmd_arrows", src: "icon/icon_cmd_arrows2.svg" },
  { id: "icon_arrows", src: "icon/icon_arrows2.svg" }
];

const gradients = [
  { startHour: 5,  gradient: "linear-gradient(0deg, rgba(255, 214, 252, 1) 0%, rgba(255, 255, 255, 1) 9%, rgba(216, 209, 255, 1) 17%, rgb(0 187 255) 65%)",
    color: "white", textShadow: "0 0 6px #ffffff", 
    iconColor: "white", dropShadow: "drop-shadow(0 0 6px white)" },
  { startHour: 7,  gradient: "linear-gradient(0deg, rgb(238 255 165) 0%, rgba(255, 255, 255, 1) 9%, rgba(244, 250, 225, 1) 18%, rgba(33, 214, 255, 1) 65%)",
    color: "black", textShadow: "0 0 6px #ffffff", 
    iconColor: "black", dropShadow: "drop-shadow(0 0 6px white)" }, 
  { startHour: 12, gradient: "linear-gradient(0deg,rgba(0, 251, 255, 1) 0%, rgba(255, 255, 255, 1) 9%, rgba(216, 249, 255, 1) 18%, rgba(0, 220, 255, 1) 65%)",
    color: "black", textShadow: "0 0 6px #ffffff", 
    iconColor: "black", dropShadow: "drop-shadow(0 0 6px white)" }, 
  { startHour: 17, gradient: "linear-gradient(0deg, rgb(255 197 197) 0%, rgb(253 219 204) 9%, rgb(241 216 255) 18%, rgb(50 174 255) 65%)",
    color: "white", textShadow: "0 0 6px #ffffff", 
    iconColor: "white", dropShadow: "drop-shadow(0 0 6px white)" },
  { startHour: 20, gradient: "linear-gradient(0deg, rgb(255 115 255) 0%, rgb(199 138 244) 9%, rgb(142 108 255) 17%, rgb(22 9 108) 65%)",
    color: "white", textShadow: "0 0 6px #ffffff", 
    iconColor: "white", dropShadow: "drop-shadow(0 0 6px white)" }
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
  info.style.color = current.color;
  info.style.textShadow = current.textShadow;

  icons.forEach(icon => {
    const container = document.getElementById(icon.id);
    if(container){
      container.querySelectorAll('path').forEach(path => {
        path.setAttribute('fill', current.iconColor);
      });
      container.style.filter = current.dropShadow;
    }
  });

  setTimeout(updateBackground, getNextChangeTime());
}

Promise.all(icons.map(icon =>
  fetch(icon.src)
    .then(res => res.text())
    .then(svgText => {
      const container = document.getElementById(icon.id);
      container.innerHTML = svgText;
      const now = new Date();
      const hour = now.getHours() + now.getMinutes()/60;
      const current = getCurrentGradient(hour);
      container.querySelectorAll('path').forEach(path => {
        path.setAttribute('fill', current.iconColor);
      });
      container.style.filter = current.dropShadow;
    })
)).then(() => {
  updateBackground();
});
