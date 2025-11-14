const socket = io();

const totalPages = 66;
const inputsCount = 180;
let currentPage = 0;

const coverContainer = document.getElementById("cover-front");
const backcoverContainer = document.getElementById("cover-back");
const inputsContainer = document.getElementById("pages");
const pageIndicator = document.getElementById("pageIndicator");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageSlider = document.getElementById("pageSlider");

const inputElements = [];
let rowContainer = null;

for (let i = 0; i < inputsCount; i++) {
  if (i % 15 === 0) {
    rowContainer = document.createElement("div");
    rowContainer.classList.add("line");
    inputsContainer.appendChild(rowContainer);
  }

  const input = document.createElement("span");
  input.contentEditable = "true"; 
  input.dataset.index = i;
  input.classList.add("letter");
  rowContainer.appendChild(input);
  inputElements.push(input);

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
    let serverIndex = parseInt(input.dataset.index);      
    let focusIndex = inputElements.indexOf(input);    

    chars.forEach((ch) => {
      if (serverIndex >= inputElements.length) return;
      if (focusIndex >= inputElements.length) return;

      const target = inputElements[focusIndex];
      target.value = ch;
      target.classList.add("input-texted");

      socket.emit("inputChange", {
        pageId: currentPage,
        inputIndex: serverIndex,
        value: ch
      });

      serverIndex++;
      focusIndex++;
    });

    if (focusIndex < inputElements.length) {
      inputElements[focusIndex].focus();
    } else {
      inputElements[inputElements.length - 1].focus();
    }
  });

  const applySelected = () => {
    inputElements.forEach(i => i.classList.remove("letter-selected"));
    input.classList.add("letter-selected");
    const range = document.createRange();
    range.selectNodeContents(input);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };
  input.addEventListener("focus", applySelected);
  input.addEventListener("click", applySelected);
  input.addEventListener("input", (e) => {
    if (isComposing) return;

    const index = parseInt(e.target.dataset.index);
    const value = e.target.textContent;

    if (currentPage >= 1 && currentPage <= totalPages - 2) {
      socket.emit("inputChange", {
        pageId: currentPage,
        inputIndex: index,
        value
      });
    }

    if (value.trim() !== "") {
      input.classList.add("input-texted");
    } else {
      input.classList.remove("input-texted");
    }

    const currentIndex = inputElements.indexOf(input);
    if (value.length === 1 && currentIndex < inputElements.length - 1) {
      const nextInput = inputElements[currentIndex + 1];
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(nextInput);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      nextInput.classList.add("letter-selected");
    }
  });

  input.addEventListener("keydown", (e) => {
    const currentIndex = inputElements.indexOf(input);

    if (e.key === "Backspace") {
      if (input.value !== "") {
        socket.emit("inputChange", {
          pageId: currentPage,
          inputIndex: currentIndex,
          value: ""
        });
        input.value = "";
        return;
      }

      if (currentIndex > 0) {
        e.preventDefault();
        const prev = inputElements[currentIndex - 1];
        if (prev) {
          const range = document.createRange();
          const sel = window.getSelection();

          range.selectNodeContents(prev);
          range.collapse(false); 
          sel.removeAllRanges();
          sel.addRange(range);

          prev.classList.add("letter-selected");
          prev.value = "";

          socket.emit("inputChange", {
            pageId: currentPage,
            inputIndex: currentIndex - 1,
            value: ""
          });
        }
      }
    }
  });
}

function loadPage(pageId) {
  if (pageId < 0) pageId = 0;
  if (pageId >= totalPages) pageId = totalPages - 1;
  currentPage = pageId;

  if (currentPage === 0 || currentPage === totalPages - 1) {
    pageIndicator.style.display = "none";
  } else {
    pageIndicator.style.display = "inline-block";
    pageIndicator.textContent = `${currentPage}`;
  }

  pageSlider.value = currentPage;

  if (currentPage === 0) {
    coverContainer.style.display = "block"; 
    backcoverContainer.style.display = "none"; 
    inputElements.forEach(input => input.style.display = "none");
  } else if (currentPage === totalPages - 1) {
    coverContainer.style.display = "none"; 
    backcoverContainer.style.display = "block"; 
    inputElements.forEach(input => input.style.display = "none");
  } else {
    coverContainer.style.display = "none"; 
    backcoverContainer.style.display = "none"; 
    inputElements.forEach(input => input.style.display = "block");

    socket.emit("requestPlaneData", currentPage);
  }
}

socket.on("loadPlaneData", ({ pageId, data }) => {
  if (pageId !== currentPage) return;
  for (let i = 0; i < inputsCount; i++) {
    inputElements[i].textContent = data[`input${i}`] || '';
  }
});

socket.on("updateInput", ({ pageId, inputIndex, value }) => {
  if (pageId === currentPage) {
    const idx = parseInt(inputIndex);
    const input = inputElements[idx];
    if(input) input.textContent = value || '';
  }
});

prevBtn.addEventListener("click", () => loadPage(currentPage - 1));
nextBtn.addEventListener("click", () => loadPage(currentPage + 1));
pageSlider.addEventListener("input", (e) => loadPage(parseInt(e.target.value)));

document.getElementById("title").addEventListener("click", () => {
  loadPage(0);
});

loadPage(0);

const swipeSound = new Audio("sound/page4.mp3");
swipeSound.volume = 1.0; 



let touchStartX = 0;
const swipeThreshold = 50; 
document.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.addEventListener("touchend", (e) => {
  const touchEndX = e.changedTouches[0].screenX;
  const distance = touchEndX - touchStartX;

  const target = e.target;
  if (target.closest("#saveBtn") || target.closest("#soundOn")) {
    return;
  }

  if (distance <= -swipeThreshold) {
    loadPage(currentPage + 1);
    swipeSound.currentTime = 0;
    swipeSound.play();
  } else if (distance >= swipeThreshold) {
    loadPage(currentPage - 1);
    swipeSound.currentTime = 0;
    swipeSound.play();
  }
});

let swipeEnabled = false;

function enableSwipe() {
  if (swipeEnabled) return;
  swipeEnabled = true;

  const soundBtn = document.getElementById("soundOn");
  soundBtn.style.display = "none";  
  soundBtn.removeEventListener("click", enableSwipe);
  soundBtn.removeEventListener("touchstart", enableSwipe);

  // 페이지 전환 사운드 재생
  swipeSound.currentTime = 0;
  swipeSound.play();
}

const soundBtn = document.getElementById("soundOn");
soundBtn.addEventListener("click", enableSwipe);
soundBtn.addEventListener("touchstart", enableSwipe);