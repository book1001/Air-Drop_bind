function getCurrentDateTimeString() {
  const now = new Date();

  const pad = (n) => n.toString().padStart(2, "0");

  const month = pad(now.getMonth() + 1); // 월은 0~11
  const day = pad(now.getDate());
  const year = now.getFullYear();
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());

  return `${month}/${day}/${year} ${hours}:${minutes}`;
}

const saveBtn = document.getElementById("saveBtn");
const totalBodyPages = 64; // JSON 페이지 수

const coverTitle = `
Bind the
Air`;
const coverText = `
Bind the Air is a continuation of Air–Drop, which was exhibited last May at the Open M Art Fair in Hangzhou. This volume was inspired by the abC team’s reflection: “If we could read the messages that each of us dropped into the air, Air–Drop could become a book we all create together.”

In this project, the words we release into the air are gathered and bound into a book, binding us together across distances and borders. Visitors are invited to drift through a globe-shaped sky and leave messages wherever they wish. Each part of the sky is marked not by latitude or longitude, but by page numbers. By scanning the QR code on the wall, the sky’s scattered pages come together on their mobile devices, forming a book that can be flipped through and read.

Throughout the exhibition, not only those in Shenzhen but people from all corners of the world are welcome to leave their messages. Together, as a global community, we bind the air into a shared book, turning borders into pages that connect us.
`;

const backCoverText = `
Published for the Open M Art Fair,
abC Art Book in China

With warm regards from Boston,
Halim Lee















© ${getCurrentDateTimeString()}, all contributors
`;

// --------------------------
// JSON 불러오기
// --------------------------
async function loadPageJSON(pageNumber) {
  const res = await fetch(`pages/page_${pageNumber}.json`);
  if (!res.ok) {
    console.error(`Failed to load page_${pageNumber}.json`);
    return {};
  }
  return await res.json();
}

// --------------------------
// 글자별 폰트 선택
// --------------------------
function getFontForText(text) {
  if (/[\uAC00-\uD7A3]/.test(text)) return "NotoSansKR";   // 한글
  if (/[\u4E00-\u9FFF]/.test(text)) return "NotoSansSC";   // 중국어
  return "ABCOracle";                                       // 영어/기타
}

function formatTextForPDF(text) {
  if (/^[A-Za-z0-9\s\.,;!?'"()-]+$/.test(text)) {
    // 영어/숫자/특수문자는 모두 대문자로 변환
    return text.toUpperCase();
  }
  return text; // 한글/중국어 등은 그대로
}

// --------------------------
// PDF 생성
// --------------------------
async function savePDFwithCover() {
  const pdf = new jsPDF("p", "pt", "a6");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const cols = 15;
  const minCellWidth = 15;
  // const minCellWidth = 10;
  const cellHeight = 27;
  const startY = 55;

  const marginX = 0;                                // ✅ 좌우 마진
  const textWidth = pageWidth - marginX * 2;         // ✅ 사용 가능한 폭

  // --------------------------
  // 폰트 등록
  // --------------------------
  // pdf.addFileToVFS("font/NotoSansKR-Bold.ttf", "BASE64_KR"); // 실제 Base64 문자열로 교체
  // pdf.addFont("font/NotoSansKR-Bold.ttf", "NotoSansKR", "normal");

  // pdf.addFileToVFS("font/NotoSansSC-Bold.ttf", "BASE64_SC"); // 실제 Base64 문자열로 교체
  // pdf.addFont("font/NotoSansSC-Bold.ttf", "NotoSansSC", "normal");

  // pdf.addFileToVFS("font/ABCOracle-Bold.ttf", "BASE64_WOFF"); // 실제 Base64 문자열로 교체
  // pdf.addFont("font/ABCOracle-Bold.ttf", "ABCOracle", "normal");


//   pdf.setFillColor("#00dcff");     // ✅ HEX 사용
//   pdf.rect(0, 0, pageWidth, pageHeight, "F");
//   // --------------------------
//   // 1️⃣ 표지
//   // --------------------------
  const coverImg = new Image();
  coverImg.src = "pdf/cover-01.png"; // 커버 이미지 파일
  await new Promise((resolve) => {
    coverImg.onload = () => {
      pdf.addImage(coverImg, "PNG", 0, 0, pageWidth, pageHeight); // 마진 없이 꽉 채움
      resolve();
    };
  });
//   let currentY = startY;

//   // ✅ 1. Cover Title

//   const wrappedTitle = pdf.splitTextToSize(coverTitle, textWidth);

//   wrappedTitle.forEach(line => {
//     pdf.setFont("ReadyActive");
//     pdf.setFontSize(70);
//     pdf.text(line, pageWidth/2, currentY, { align: "center" });
//     // pdf.text(line, startXTitle, currentY, { align: "left" });
//     currentY += 0; // 줄 간격
//   });

//   // ✅ 2. Cover Text
// const coverLines = coverText.split("\n"); // 빈 줄도 유지

// coverLines.forEach(line => {
//   const trimmed = line.trim();
//   if(trimmed === "") {
//     currentY += 18; // 빈 줄이면 줄 간격만
//     return;
//   }
//   const wrapped = pdf.splitTextToSize(trimmed, textWidth);
//   wrapped.forEach(wrapLine => {
//     pdf.setFont("ABCOracle"); // 기본 폰트
//     pdf.setFontSize(18);
//     pdf.text(wrapLine, marginX, currentY, { align: "left" });
//     // pdf.text(wrapLine, pageWidth/2, currentY, { align: "center" });
//     currentY += 18;
//   });
// });

  // const coverLines = coverText.split("\n").filter(line => line.trim() !== "");
  // coverLines.forEach(line => {
  //   const wrapped = pdf.splitTextToSize(line, textWidth);

  //   // 블록 폭 계산 후 중앙 정렬
  //   const blockWidth = pdf.getTextWidth(wrapped.join(" ")) || textWidth;
  //   const startX = (pageWidth - blockWidth) / 2;

  //   wrapped.forEach(wrapLine => {
  //     pdf.setFont(getFontForText(wrapLine));
  //     pdf.text(wrapLine, pageWidth/2, currentY, { align: "center" });
  //     // pdf.text(wrapLine, startX, currentY, { align: "left" });
  //     currentY += 18;
  //   });
  // });

  // const coverLines = coverText.split("\n").filter(line => line.trim() !== "");
  // let coverY = startY;

  // coverLines.forEach((line) => {
  //   pdf.setFont(getFontForText(line));

  //   const formatted = formatTextForPDF(line);

  //   // ✅ 줄바꿈 적용
  //   const wrapped = pdf.splitTextToSize(line, textWidth);

  //   // 좌측 정렬 + 블록 중앙 정렬
  //   const blockWidth = pdf.getTextWidth(wrapped.join(" ")) || textWidth;
  //   const startX = (pageWidth - blockWidth) / 2;

  //   // ✅ 중앙 정렬을 유지하면서 줄바꿈된 블록을 출력
  //   wrapped.forEach((wrapLine) => {
  //     pdf.text(wrapLine, startX, coverY, { align: "left" });
  //     // pdf.text(wrapLine, pageWidth / 2, coverY, { align: "center" });
  //     coverY += 18;
  //   });
  // });
  // // coverLines.forEach((line, index) => {
  //   pdf.setFont(getFontForText(line));
  //   pdf.text(line, pageWidth / 2, startY + index * 18, { align: "center" });
  // });

  // --------------------------
  // 2️⃣ JSON 페이지
  // --------------------------
  for (let page = 1; page <= totalBodyPages; page++) {
    pdf.addPage();
    pdf.setFillColor("#fffef2");
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
    pdf.setFontSize(18);
    const data = await loadPageJSON(page);
    const values = Object.values(data).slice(0, cols * 20); // 한 페이지 최대 20행

    // 한 페이지를 행 단위로 처리
    const rows = [];
    for (let i = 0; i < values.length; i += cols) {
      rows.push(values.slice(i, i + cols));
    }

    rows.forEach((rowValues, rowIndex) => {
      // 해당 행에서 최대 폭 계산
      const rowMaxWidth = Math.max(...rowValues.map(v => pdf.getTextWidth(v)), minCellWidth);

      const totalRowWidth = rowMaxWidth * cols;
      const startX = (pageWidth - totalRowWidth) / 2;

      rowValues.forEach((value, colIndex) => {
        const x = startX + colIndex * rowMaxWidth + rowMaxWidth / 2;
        const y = startY + rowIndex * cellHeight;

        pdf.setFont(getFontForText(value));
        pdf.text(formatTextForPDF(value), x, y, { align: "center" });
        // pdf.text(value, x, y, { align: "center" });
      });
    });

    // 페이지 번호
    pdf.text(`${page}`, pageWidth / 2, pageHeight - 20, { align: "center" });
  }
  // for (let page = 1; page <= totalBodyPages; page++) {
  //   pdf.addPage();
  //   const data = await loadPageJSON(page);

  //   let i = 0;
  //   for (let key in data) {
  //     const value = data[key] || "";

  //     const textWidth = pdf.getTextWidth(value);
  //     const cellWidthActual = Math.max(minCellWidth, textWidth);

  //     const totalColsWidth = cols * cellWidthActual;
  //     const startXCentered = (pageWidth - totalColsWidth) / 2;

  //     const x = startXCentered + (i % cols) * cellWidthActual + cellWidthActual / 2;
  //     const y = startY + Math.floor(i / cols) * cellHeight;

  //     pdf.setFont(getFontForText(value));
  //     pdf.text(value, x, y, { align: "center" });

  //     i++;
  //     if (i >= cols * 20) break; // 한 페이지 최대 20행
  //   }

  //   // 페이지 번호
  //   pdf.text(`${page}`, pageWidth / 2, pageHeight - 20, { align: "center" });
  // }

  // --------------------------
  // 3️⃣ 뒷표지
  // --------------------------
  // pdf.addPage();
  // const backImg = new Image();
  // backImg.src = "pdf/cover-02.png"; // 백커버 이미지 파일
  // await new Promise((resolve) => {
  //   backImg.onload = () => {
  //     pdf.addImage(backImg, "PNG", 0, 0, pageWidth, pageHeight); // 마진 없이 꽉 채움
  //     resolve();
  //   };
  // });
  pdf.addPage();
  pdf.setFillColor("#000000");
  pdf.setTextColor("#FFFFFF");    
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  const backLines = backCoverText.split("\n");
  // const backLines = backCoverText.split("\n").filter(line => line.trim() !== "");
  let backY = 18;
  
  backLines.forEach((line) => {
    const font = getFontForText(line);
    pdf.setFont(font);

    // 빈 줄 처리
    if (line.trim() === "") {
      backY += 18; // 빈 줄이면 줄 간격만 추가
      return;
    }

    const wrapped = pdf.splitTextToSize(line, textWidth);
    const blockWidth = pdf.getTextWidth(wrapped.join(" ")) || textWidth;
    const startX = (pageWidth - blockWidth) / 2;

    wrapped.forEach((wrapLine) => {
      pdf.setFontSize(16);
      // pdf.text(wrapLine, startX, backY, { align: "left" });
      pdf.text(wrapLine, pageWidth / 2, backY, { align: "center" });
      backY += 18;
    });
  });

  // backLines.forEach((line, index) => {
  //   pdf.setFont(getFontForText(line));
  //   pdf.text(line, pageWidth / 2, startY + index * 18, { align: "center" });
  // });

  // --------------------------
  // PDF 저장
  // --------------------------
  pdf.save("BindTheAir.pdf");
}

// --------------------------
// 버튼 이벤트
// --------------------------
saveBtn.addEventListener("click", async () => {
  saveBtn.disabled = true;
  saveBtn.textContent = "Processing...";
  await savePDFwithCover();
  saveBtn.disabled = false;

  // 현재 시간을 HH:MM 형식으로 표시 (24시간제)
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const formattedTime = `${hours}:${minutes}`;

  saveBtn.textContent = `Bound at ${formattedTime}`;
});


// saveBtn.addEventListener("click", async () => {
//   saveBtn.disabled = true;
//   saveBtn.textContent = "Processing...";
//   await savePDFwithCover();
//   saveBtn.disabled = false;

//   // 현재 날짜를 MM/DD/YYYY 형식으로 표시 (미국식)
//   const now = new Date();
//   const month = String(now.getMonth() + 1).padStart(2, "0"); // 월(0~11) → 두 자리로
//   const day = String(now.getDate()).padStart(2, "0");        // 일 → 두 자리로
//   const year = now.getFullYear();
//   const formattedDate = `${month}/${day}/${year}`;

//   saveBtn.textContent = `Bound on ${formattedDate}`;
// });

// saveBtn.addEventListener("click", async () => {
//   saveBtn.disabled = true;
//   saveBtn.textContent = "Processing...";
//   await savePDFwithCover();
//   saveBtn.disabled = false;

//   // 현재 날짜를 'Mon DD, YYYY' 형식으로 변환
//   const now = new Date();
//   const formattedDate = now.toLocaleDateString("en-US", {
//     month: "short",
//     day: "numeric",
//     year: "numeric"
//   });

//   saveBtn.textContent = `Bound on ${formattedDate}`;
// });

// saveBtn.addEventListener("click", async () => {
//   saveBtn.disabled = true;
//   saveBtn.textContent = "Processing...";
//   await savePDFwithCover();
//   saveBtn.disabled = false;
//   saveBtn.textContent = "Saved";
// });