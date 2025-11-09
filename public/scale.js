function scaleInputs() {
  const wrapper = document.getElementById("pages-scale");
  const pages = document.getElementById("pages");

  const wrapperW = wrapper.clientWidth;
  const wrapperH = wrapper.clientHeight;

  // 기준 디바이스 크기
  const baseDeviceW = 375;
  const baseDeviceH = 667;

  let scale = Math.min(wrapperW / baseDeviceW, wrapperH / baseDeviceH);

  // 기준 기기보다 작을 경우 scale이 줄어드는 것을 방지
  if (wrapperW <= baseDeviceW && wrapperH <= baseDeviceH) {
    scale = 1;
  }

  pages.style.transform = `scale(${scale})`;
}

window.addEventListener("resize", scaleInputs);
scaleInputs();
