import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const socket = io();
const inputsCount = 180;
let allInputs = [];
let planeCount = 0; 
let targetQuaternion = new THREE.Quaternion();
let isCameraMoving = false;
let keyRotation = new THREE.Quaternion();
let loadedFont=null;
let font1 = null;
let font2 = null;

new FontLoader().load('font/FKGroteskSemiMonoTrial_Regular.json', f => {
  font1 = f;
  checkAllFontsLoaded();
});

new FontLoader().load('font/ReadyActiveTest-Light5.json', f => {
  font2 = f;
  checkAllFontsLoaded();
});

function checkAllFontsLoaded() {
  if(font1 && font2) {
      init();
      animate();
  }
}



let scene, camera, webGLRenderer, cssRenderer, sphereGroup, backgroundMesh, texture, ctx, canvas;
let rotationX=0, rotationY=0;
let keyRotationX = 0, keyRotationY = 0;
const keys={ArrowUp:false, ArrowDown:false, ArrowLeft:false, ArrowRight:false};
const speed=0.02;
const gltfLoader=new GLTFLoader();
const textMeshes = [];
let cloudSouth;
let isDragging = false;
let prevMouseX = 0;
let prevMouseY = 0;
let lastUpdate = 0;
let autoRotateSpeed = 0.05; 
let manualRotation = new THREE.Vector2(0,0);


function focusCameraOnInput(input) {
if (!input) return; 

const object = input.__threeObj;
if (!object) return;
const targetDir = object.position.clone().normalize();
const m = new THREE.Matrix4().lookAt(new THREE.Vector3(0,0,0), targetDir, new THREE.Vector3(0,1,0));
targetQuaternion.setFromRotationMatrix(m);
isCameraMoving = true;
}

function selectSpanText(el) {
const range = document.createRange();
range.selectNodeContents(el);
const sel = window.getSelection();
sel.removeAllRanges();
sel.addRange(range);
}

function init(){
scene=new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000); 
camera.position.set(0,0,0);

webGLRenderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
webGLRenderer.setClearColor(0x000000, 0);
webGLRenderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(webGLRenderer.domElement);

cssRenderer=new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth,window.innerHeight);
cssRenderer.domElement.id="cssRenderer";
document.body.appendChild(cssRenderer.domElement);

sphereGroup=new THREE.Group();
scene.add(sphereGroup);
scene.background = null;

canvas = document.createElement('canvas');
const dpr = window.devicePixelRatio || 1;
canvas.width = window.innerWidth * dpr;
canvas.height = window.innerHeight * dpr;
ctx = canvas.getContext('2d');
ctx.scale(dpr, dpr);

texture = new THREE.CanvasTexture(canvas);
texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.generateMipmaps = false;
texture.encoding = THREE.sRGBEncoding;
texture.needsUpdate = true;

const radius=500;
const geo=new THREE.SphereGeometry(radius,64,64);
const mat = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  side: THREE.BackSide
});

const sphereMesh=new THREE.Mesh(geo,mat);
sphereGroup.add(sphereMesh);

const letters = ['B','I','N','D','T','H','E','A','I','R'];
const baseOffset = 50;

if (font2) {
  letters.forEach(letter => {
    const textGeo = new TextGeometry(letter, {
      font: font2,
      size: 150,
      height: 2,
      curveSegments: 4,
      bevelEnabled: false
    });
    textGeo.computeBoundingBox();
    const bbox = textGeo.boundingBox;
    const textCenter = new THREE.Vector3(
      (bbox.max.x + bbox.min.x)/2,
      (bbox.max.y + bbox.min.y)/2,
      (bbox.max.z + bbox.min.z)/2
    );
    textGeo.translate(-textCenter.x, -textCenter.y, -textCenter.z);

    const material = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0
    });
    const textMesh = new THREE.Mesh(textGeo, material);
    const speed = (Math.random() * 0.015) + 0.005;
    textMesh.userData.rotationSpeed = Math.random() < 0.5 ? speed : -speed;
    textMesh.userData.fadeSpeed = 0.005 + Math.random() * 0.01; 
    textMesh.userData.fadeDirection = 1;
    textMesh.userData.startDelay = Math.random() * 2000; 
    textMesh.userData.lastChangeTime = performance.now();
    textMesh.userData.setRandomPosition = function(mesh) {
      const offset = baseOffset + Math.random() / 20;
      const phi = Math.random() * Math.PI;
      const theta = Math.random() * 2 * Math.PI;
      mesh.position.set(
        (radius - offset) * Math.sin(phi) * Math.cos(theta),
        (radius - offset) * Math.cos(phi),
        (radius - offset) * Math.sin(phi) * Math.sin(theta)
      );
      mesh.lookAt(new THREE.Vector3(0,0,0));
    };

    textMesh.userData.setRandomPosition(textMesh);
    sphereGroup.add(textMesh);
    textMeshes.push(textMesh);
  });
}

gltfLoader.load('model/cloud.glb', (gltf) => {
  cloudSouth = gltf.scene;
  cloudSouth.traverse((child)=>{ if(child.isMesh){ child.material = new THREE.MeshBasicMaterial({ map: child.material.map, side: THREE.DoubleSide, transparent: true, opacity: 0.8, depthWrite:false, alphaTest:0.5 }); }});
  cloudSouth.scale.set(50,50,50);
  cloudSouth.position.set(0,-radius,0);
  sphereGroup.add(cloudSouth);
});

const latLines=6, lonLines=16;
const lineThickness = 1;
const verticalLines=[], horizontalLines=[];
const inputsPerPlane = inputsCount;

function createTubeFromPoints(points, radius=1, radialSegments=6){
  class CustomCurve extends THREE.Curve { constructor(points){ super(); this.points=points; } getPoint(t){ const idx=t*(this.points.length-1); const i=Math.floor(idx); const frac=idx-i; if(i>=this.points.length-1) return this.points[this.points.length-1]; return new THREE.Vector3().lerpVectors(this.points[i], this.points[i+1], frac); } }
  const curve = new CustomCurve(points);
  const geom = new THREE.TubeGeometry(curve, points.length*2, radius, radialSegments, false);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  return new THREE.Mesh(geom, mat);
}

for(let i=0;i<=lonLines;i++){
  const phi = (i/lonLines)*2*Math.PI;
  const points=[];
  for(let j=0;j<=latLines;j++){
    const theta=(j/latLines)*Math.PI;
    const x=radius*Math.sin(theta)*Math.cos(phi);
    const y=radius*Math.cos(theta);
    const z=radius*Math.sin(theta)*Math.sin(phi);
    points.push(new THREE.Vector3(x,y,z));
  }
  verticalLines.push(points);
  sphereGroup.add(createTubeFromPoints(points,lineThickness));
}
for(let j=0;j<=latLines;j++){
  const theta=(j/latLines)*Math.PI;
  const points=[];
  for(let i=0;i<=lonLines;i++){
    const phi=(i/lonLines)*2*Math.PI;
    const x=radius*Math.sin(theta)*Math.cos(phi);
    const y=radius*Math.cos(theta);
    const z=radius*Math.sin(theta)*Math.sin(phi);
    points.push(new THREE.Vector3(x,y,z));
  }
  horizontalLines.push(points);
  sphereGroup.add(createTubeFromPoints(points,lineThickness));
}

const planeWidths=[100,100,165,165,100,100];
const planeHeights=[100,250,240,240,250,100];
let inputCount = 1;
let faceCount = 1;

for(let j=1;j<latLines-1;j++){
  const planeW=planeWidths[j%planeWidths.length];
  const planeH=planeHeights[j%planeHeights.length];

  for(let i=0;i<lonLines;i++){
    const p00 = verticalLines[i][j];
    const p01 = verticalLines[i][j+1];
    const p10 = verticalLines[i+1][j];
    const p11 = verticalLines[i+1][j+1];
    const center=new THREE.Vector3().addVectors(p00,p01).add(p10).add(p11).multiplyScalar(0.25);
    const div=document.createElement('div');
    div.className='plane-wrapper';
    div.style.width=planeW+'px';
    div.style.height=planeH+'px';

    for(let k=0;k<inputsCount;k++){
      const input = document.createElement("span");
      input.contentEditable = "true"; 

      const pageId = Math.floor((inputCount - 1) / inputsCount) + 1;

      if ((pageId >= 1 && pageId <= 16) || (pageId >= 49 && pageId <= 64)) {
        input.className = "inputPlaneTop";
      } else {
        input.className = "inputPlane";
      }

      input.id = "input" + inputCount;

      div.appendChild(input);
      allInputs.push(input);

      const inputIndex = (inputCount-1) % inputsCount;
      setupInput(input, pageId, inputIndex);
      inputCount++;
      input.__threeObj = null; 
      input.addEventListener('input', () => { if(input.textContent.trim()!=='') focusCameraOnInput(input); }); 
    }

    const object = new CSS3DObject(div);
    object.position.copy(center);
    object.lookAt(0, 0, 0);
    sphereGroup.add(object);

    div.querySelectorAll('span').forEach(inp => inp.__threeObj = object);

    if(font1){
      const textGeo = new TextGeometry(faceCount.toString(), {
        font: font1,
        size: 11,
        height: 0.3,
        curveSegments: 4,
        bevelEnabled: false
      });
      textGeo.computeBoundingBox();
      const bbox=textGeo.boundingBox;
      const textCenter = new THREE.Vector3(
        (bbox.max.x + bbox.min.x) / 2,
        (bbox.max.y + bbox.min.y) * 10,
        (bbox.max.z + bbox.min.z) / 2
      );
      textGeo.translate(-textCenter.x,-textCenter.y,-textCenter.z);
      const textMesh=new THREE.Mesh(textGeo,new THREE.MeshBasicMaterial({color:0xffffff}));
      textMesh.position.copy(center);
      textMesh.lookAt(camera.position);
      sphereGroup.add(textMesh);
    }

    faceCount++;
  }
}

planeCount = Math.ceil(allInputs.length/inputsCount);
requestAllPages();

isCameraMoving = false;
targetQuaternion = new THREE.Quaternion();
keyRotation.identity();

function rotateCamera(deltaX, deltaY) {
  const qx = new THREE.Quaternion();
  const qy = new THREE.Quaternion();
  qx.setFromAxisAngle(new THREE.Vector3(1,0,0), deltaY);
  qy.setFromAxisAngle(new THREE.Vector3(0,1,0), deltaX);

  keyRotation.multiplyQuaternions(qy, keyRotation);
  keyRotation.multiplyQuaternions(qx, keyRotation);

  clampEuler(keyRotation);
}

function clampEuler(quat){
  const euler = new THREE.Euler().setFromQuaternion(quat,'YXZ');
  const maxX = Math.PI/2 - 0.01;
  const minX = -Math.PI/2 + 0.01;
  euler.x = Math.max(minX, Math.min(maxX, euler.x));
  quat.setFromEuler(euler);
}



window.addEventListener('keyup', (e) => {
  if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  webGLRenderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
});

selectRandomInput();

}

function selectRandomInput() {
const randomInput = allInputs[Math.floor(Math.random() * allInputs.length)];

allInputs.forEach(i => i.classList.remove("input-selected"));
randomInput.classList.add("input-selected");

setTimeout(() => {
  randomInput.focus();        
  selectSpanText(randomInput); 
}, 30);
focusCameraOnInput(randomInput);
}


function setupInput(input, pageId, inputIndex){
let isComposing = false;
let composedText = "";

input.addEventListener("compositionstart", () => {
  isComposing = true;
  composedText = "";
});

input.addEventListener("compositionupdate", (e) => {
  composedText = e.data || "";
});

input.addEventListener("compositionend", (e) => {
  isComposing = false;
  const text = e.data || composedText;
  composedText = "";

  if (!text || text.trim().length === 0) return;

  const chars = [...text];
  let serverIndex = inputIndex;               
  let focusIndex = allInputs.indexOf(input);    

  chars.forEach((ch) => {
    if (serverIndex >= allInputs.length) return;
    if (focusIndex >= allInputs.length) return;

    const target = allInputs[focusIndex];
    target.textContent = ch;
    target.classList.add("input-texted");

    socket.emit("inputChange", {
      pageId,
      inputIndex: serverIndex,
      value: ch
    });

    serverIndex++;
    focusIndex++;
  });

  if (focusIndex < allInputs.length) {
    allInputs[focusIndex].focus();
  } else {
    allInputs[allInputs.length - 1].focus();
  }
});

const applySelected = () => {
  allInputs.forEach(i => i.classList.remove('input-selected'));
  input.classList.add('input-selected'); 
  selectSpanText(input);
};

input.addEventListener('focus', applySelected);
input.addEventListener('click', applySelected);

input.addEventListener('input', (e) => {
  if(isComposing) return;
  const value = input.textContent;
  socket.emit('inputChange', { pageId, inputIndex, value });
  input.textContent.trim() !== '' 
    ? input.classList.add('input-texted')
    : input.classList.remove('input-texted');

  const currentIndex = allInputs.indexOf(input);

  if(input.textContent.length === 1 && currentIndex < allInputs.length - 1){
    const nextInput = allInputs[currentIndex + 1];
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(nextInput);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    nextInput.classList.add('input-selected');
  }
});

input.addEventListener('keydown', (e) => {
  const currentIndex = allInputs.indexOf(input);
  if(e.key === 'Backspace' && input.textContent === '' && currentIndex > 0){
    e.preventDefault();
    input.textContent = '';
    socket.emit('inputChange', { pageId, inputIndex, value: '' });
    const prev = allInputs[currentIndex - 1];
    if (prev) {
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(prev);
      range.collapse(false); 
      sel.removeAllRanges();
      sel.addRange(range);

      prev.classList.add('input-selected');
      selectSpanText(prev);
      prev.textContent = '';
      socket.emit('inputChange', { pageId, inputIndex, value: '' });
    }
  }

  if(e.key === 'ArrowLeft' && currentIndex > 0){
    e.preventDefault();
    if(isComposing) return; 
    const prev = allInputs[currentIndex - 1];
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(prev);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    prev.classList.add('input-selected');
  }

  if(e.key === 'ArrowRight' && currentIndex < allInputs.length - 1){
    e.preventDefault();
    if(isComposing) return; 
    const next = allInputs[currentIndex + 1];
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(next);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);  
    next.classList.add('input-selected');
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (isComposing) return;
    const step = (pageId >= 1 && pageId <= 16) || (pageId >= 49 && pageId <= 64)
      ? 10
      : 15;

    const up = allInputs[currentIndex - step];

    if (up) {
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(up);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      up.classList.add("input-selected");
    }
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (isComposing) return;

    const step = (pageId >= 1 && pageId <= 16) || (pageId >= 49 && pageId <= 64)
      ? 10
      : 15;

    const down = allInputs[currentIndex + step];

    if (down) {
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(down);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      down.classList.add("input-selected");
    }
  }

  if ((e.metaKey || e.ctrlKey) && e.keyCode === 37) { 
    e.preventDefault();
    const prev = allInputs[currentIndex - 180];
    if(prev){
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(prev);
      range.collapse(false); 
      sel.removeAllRanges();
      sel.addRange(range);
      prev.classList.add('input-selected');
      focusCameraOnInput(prev);
    }
  }

  if ((e.metaKey || e.ctrlKey) && e.keyCode === 39) { 
    e.preventDefault();
    const next = allInputs[currentIndex + 180];
    if(next){
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(next);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      next.classList.add('input-selected');
      focusCameraOnInput(next);
    }
  }

  if ((e.metaKey || e.ctrlKey) && e.keyCode === 38) { 
    const up = allInputs[currentIndex - 2880];
    if(up){
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(up);
      range.collapse(false); 
      sel.removeAllRanges();
      sel.addRange(range);
      up.classList.add('input-selected');
      focusCameraOnInput(up);
    }
  }

  if ((e.metaKey || e.ctrlKey) && e.keyCode === 40) { 
    e.preventDefault();
    const down = allInputs[currentIndex + 2880];
    if(down){
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(down);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      down.classList.add('input-selected');
      focusCameraOnInput(down);
    }
  }

});

}

function moveToNextSpan(current) {
const idx = allInputs.indexOf(current);
if (idx >= 0 && idx < allInputs.length - 1) {
  const next = allInputs[idx + 1];
  const sel = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(next);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}
}

function requestAllPages(){
for(let pageId=1; pageId<=planeCount; pageId++){
  socket.emit('requestPlaneData', pageId);
}
}

socket.on('loadPlaneData', ({pageId,data})=>{
for(let i=0;i<inputsCount;i++){
  const globalIndex=(pageId-1)*inputsCount + i;
  const input=allInputs[globalIndex];
  if(!input) continue;
  const value=data['input'+i]||'';
  input.textContent=value;
  value.trim()!=='' ? input.classList.add('input-texted') : input.classList.remove('input-texted');
}
});

socket.on('updateInput', ({pageId,inputIndex,value})=>{
const globalIndex=(pageId-1)*inputsCount + inputIndex;
const input=allInputs[globalIndex];
if(!input) return;
input.textContent=value||'';
if(value && value.trim()!=='') input.classList.add('input-texted');
else input.classList.remove('input-texted');
});

const bgSound = new Audio('sound/air1.mp3');
bgSound.loop = true; 

const arrowSound = new Audio('sound/page4.mp3');
arrowSound.loop = false; 

const typingSound = new Audio('sound/snap1.mp3');
typingSound.loop = false;  

const eraseSound = new Audio('sound/erase1.mp3'); 
eraseSound.loop = false; 

let isBgPlaying = false;

window.addEventListener('keydown', (e) => {
if ((e.metaKey || e.ctrlKey) && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
  arrowSound.currentTime = 0;
  arrowSound.play().catch(err => console.log(err));
}
if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
  arrowSound.currentTime = 0;
  arrowSound.play().catch(err => console.log(err));
} else if (e.key === 'Backspace') {
  eraseSound.currentTime = 0;
  eraseSound.play().catch(err => console.log(err));
} else {
  typingSound.currentTime = 0;
  typingSound.play().catch(err => console.log(err));
}
});


const minRotationX = -Math.PI/2;
const maxRotationX = Math.PI/2;

function animate(time = 0){
requestAnimationFrame(animate);
if(keys.ArrowUp) rotationX -= speed;
if(keys.ArrowDown) rotationX += speed;
if(keys.ArrowLeft) rotationY -= speed;
if(keys.ArrowRight) rotationY += speed;
rotationX = Math.max(minRotationX, Math.min(maxRotationX, rotationX));
sphereGroup.rotation.x = rotationX;
sphereGroup.rotation.y = rotationY;
if(cloudSouth) cloudSouth.rotation.y -= 0.001;

if (isCameraMoving) {
  camera.quaternion.slerp(targetQuaternion, autoRotateSpeed);
  if (camera.quaternion.angleTo(targetQuaternion) < 0.001) {
    isCameraMoving = false;
  }
} else {
  camera.rotateX(manualRotation.x);
  camera.rotateY(manualRotation.y);
  manualRotation.set(0, 0); 
}

const now = performance.now();
textMeshes.forEach(mesh => {
  mesh.rotation.y += mesh.userData.rotationSpeed;

  const fullRotation = 2 * Math.PI;
  let normalizedRotation = Math.abs(mesh.rotation.y % fullRotation);

  if (normalizedRotation < 0.2) {
    mesh.userData.fadeDirection = 1;  
    mesh.userData.fadeSpeed = 0.08;   
  }

  if (normalizedRotation > fullRotation - 0.2) {
    mesh.userData.fadeDirection = -1;  
    mesh.userData.fadeSpeed = 0.08;    
  }

  if (mesh.userData.fadeDirection === 1) {
    mesh.material.opacity += mesh.userData.fadeSpeed;
    if (mesh.material.opacity > 1) mesh.material.opacity = 1;
  } else if (mesh.userData.fadeDirection === -1) {
    mesh.material.opacity -= mesh.userData.fadeSpeed;
    if (mesh.material.opacity <= 0) {
      mesh.material.opacity = 0;
      mesh.userData.setRandomPosition(mesh);
      mesh.rotation.y = 0; 
      mesh.userData.fadeDirection = 1; 
    }
  }
});

webGLRenderer.render(scene, camera);
cssRenderer.render(scene, camera);
}