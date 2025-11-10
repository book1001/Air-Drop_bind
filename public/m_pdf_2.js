const saveBtn = document.getElementById("saveBtn");
const totalBodyPages = 64; // JSON 페이지 수

// 표지 내용
const coverText = `
Bind the Air

Bind the Air is a continuation of Air–Drop, which was exhibited last May at the Open M Art Fair in Hangzhou. This volume was inspired by the abC team’s reflection: “If we could read the messages that each of us dropped into the air, Air–Drop could become a book we all create together.”

In this project, the words we release into the air are gathered and bound into a book, binding us together across distances and borders. Visitors are invited to drift through a globe-shaped sky and leave messages wherever they wish. Each part of the sky is marked not by latitude or longitude, but by page numbers. By scanning the QR code on the wall, the sky’s scattered pages come together on their mobile devices, forming a book that can be flipped through and read.

Throughout the exhibition, not only those in Shenzhen but people from all corners of the world are welcome to leave their messages. Together, as a global community, we bind the air into a shared book, turning borders into pages that connect us.
`;

// 뒷표지 내용
const backCoverText = `
Published by Halim Lee
`;

// JSON 파일 불러오기
async function loadPageJSON(pageNumber) {
  const res = await fetch(`pages/page_${pageNumber}.json`);
  if (!res.ok) {
    console.error(`Failed to load page_${pageNumber}.json`);
    return {};
  }
  return await res.json();
}


// PDF 생성
async function savePDFwithCover() {
  // const pdf = new jsPDF("p", "pt", "a4"); // 포트레이트, pt 단위, A4
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "pt", "a6");

  const cols = 15;
  const minCellWidth = 10;
  const cellHeight = 25;
  const startX = 20;  // 좌측 여백
  const startY = 50;  // 상단 여백
  // const cellWidth = 25;
  // const cellHeight = 25;
  // const startX = 40;
  // const startY = 60;

  const pageWidth = pdf.internal.pageSize.getWidth();

  // 1. 표지
  pdf.setFont("ko"); // 한글 지원
  // pdf.setFont("NotoSansKR"); 
  pdf.setFontSize(14);
  const coverLines = coverText.split("\n").filter(line => line.trim() !== "");
  coverLines.forEach((line, index) => {
    pdf.text(line, pageWidth / 2, startY + index * 18, { align: "center" });
  });

  // 2. JSON 페이지들
  for (let page = 1; page <= totalBodyPages; page++) {
    pdf.addPage();
    const data = await loadPageJSON(page);

    // const pageWidth = pdf.internal.pageSize.getWidth();
    // const totalColsWidth = cols * cellWidth; // 전체 열 너비
    // const startXCentered = (pageWidth - totalColsWidth) / 2; // 페이지 중앙 기준 시작 X
    // const pageWidth = pdf.internal.pageSize.getWidth();

    let i = 0;

    for (let key in data) {
      const value = data[key] || "";
      // const x = startX + (i % cols) * cellWidth;
      // const x = startX + (i % cols) * cellWidth + cellWidth / 2;
      // const y = startY + Math.floor(i / cols) * cellHeight;

      // const x = startXCentered + (i % cols) * cellWidth;
      // const y = startY + Math.floor(i / cols) * cellHeight;

      const textWidth = pdf.getTextWidth(value);

      // 셀 너비 = 최소값 vs 글자 너비 비교
      const cellWidthActual = Math.max(minCellWidth, textWidth);

      // 페이지 중앙 기준 startX 계산
      const totalColsWidth = cols * cellWidthActual;
      const startXCentered = (pageWidth - totalColsWidth) / 2;

      // x 좌표
      const x = startXCentered + (i % cols) * cellWidthActual + cellWidthActual / 2;
      // const x = startXCentered + (i % cols) * cellWidthActual;

      // y 좌표
      const y = startY + Math.floor(i / cols) * cellHeight;

      // pdf.text(value, x, y);
      pdf.setFont("stsongstdlight"); // 중국어 간체
      pdf.text(value, x, y, { align: "center" });
      i++;
      if (i >= inputsCount) break;
    }

    // 페이지 번호 추가 (JSON 페이지들만)
    pdf.setFont("ko");
    pdf.text(`${page}`, pageWidth / 2, pdf.internal.pageSize.getHeight() - 20, { align: "center" });
    // const pageNumber = page; // 1~64
    // pdf.text(
    //   `${pageNumber}`,
    //   pdf.internal.pageSize.getWidth() / 2,
    //   pdf.internal.pageSize.getHeight() - 20,
    //   { align: "center" }
    // );
  }

  // for (let page = 1; page <= totalBodyPages; page++) {
  //   pdf.addPage();
  //   const data = await loadPageJSON(page);

  //   let i = 0;
  //   for (let key in data) {
  //     const value = data[key] || "";
  //     const x = startX + (i % cols) * cellWidth;
  //     const y = startY + Math.floor(i / cols) * cellHeight;
  //     pdf.text(value, x, y);
  //     i++;
  //     if (i >= inputsCount) break;
  //   }
  // }

  // 3. 뒷표지
  pdf.addPage();
  const backLines = backCoverText.split("\n").filter(cols => cols.trim() !== "");
  backLines.forEach((cols, index) => {
    pdf.text(cols, startX, startY + index * 18);
  });

  // 저장
  pdf.save("BindTheAir.pdf");
}

// 버튼 이벤트
saveBtn.addEventListener("click", async () => {
  saveBtn.disabled = true;
  saveBtn.textContent = "Processing...";
  await savePDFwithCover();
  saveBtn.disabled = false;
  saveBtn.textContent = "Save";
});



