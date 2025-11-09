function scaleInputs() {
  const wrapper = document.getElementById("pages-scale");
  const pages = document.getElementById("pages");

  const wrapperW = wrapper.clientWidth;
  const wrapperH = wrapper.clientHeight;

  // 기준 디바이스 크기
  const baseDeviceW = 375;
  const baseDeviceH = 667;

  const scale = Math.min(wrapperW / baseDeviceW, wrapperH / baseDeviceH);

  pages.style.transform = `scale(${scale})`;
}

window.addEventListener("resize", scaleInputs);
scaleInputs();