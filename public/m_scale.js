function scaleInputs() {
  const wrapper = document.getElementById("pages-scale");
  const coverFront = document.getElementById("cover-front");
  const coverBack = document.getElementById("cover-back");
  const pages = document.getElementById("pages");

  const wrapperW = wrapper.clientWidth;
  const wrapperH = wrapper.clientHeight;

  // base device size
  const baseDeviceW = 375;
  const baseDeviceH = 667;

  let scale = Math.min(wrapperW / baseDeviceW, wrapperH / baseDeviceH);

  // 기준 기기보다 작을 경우 scale이 줄어드는 것을 방지
  if (wrapperW <= baseDeviceW && wrapperH <= baseDeviceH) {
    scale = 1;
  }

  coverFront.style.transform = `translate(-50%, -50%) scale(${scale})`;
  coverBack.style.transform = `translate(-50%, -50%) scale(${scale})`;
  pages.style.transform = `scale(${scale})`;
  pageIndicator.style.transform = `translateX(-50%) scale(${scale})`;
}

window.addEventListener("resize", scaleInputs);
scaleInputs();
