// function getCurrentDateTimeString() {
//   const now = new Date();

//   const pad = (n) => n.toString().padStart(2, "0");

//   const month = pad(now.getMonth() + 1);
//   const day = pad(now.getDate());
//   const year = now.getFullYear();
//   const hours = pad(now.getHours());
//   const minutes = pad(now.getMinutes());

//   return `${month}/${day}/${year} ${hours}:${minutes}`;
// }

function getCurrentDateTimeString() {
  const now = new Date();

  const pad = (n) => n.toString().padStart(2, "0");

  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const year = now.getFullYear();

  let hours = now.getHours(); 
  const minutes = pad(now.getMinutes());

  // 12시간제로 변환
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const hourStr = pad(hours);

  return `${month}/${day}/${year} ${hourStr}:${minutes}`;
}


const saveBtn = document.getElementById("saveBtn");
const totalBodyPages = 64;

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

async function loadPageJSON(pageNumber) {
  const res = await fetch(`pages/page_${pageNumber}.json`);
  if (!res.ok) {
    console.error(`Failed to load page_${pageNumber}.json`);
    return {};
  }
  return await res.json();
}

function getFontForText(text) {
  if (/[\uAC00-\uD7A3]/.test(text)) return "NotoSansKR";  
  if (/[\u4E00-\u9FFF]/.test(text)) return "NotoSansSC"; 
  return "ABCOracle";                                   
}

function formatTextForPDF(text) {
  if (/^[A-Za-z0-9\s\.,;!?'"()-]+$/.test(text)) {
    return text.toUpperCase();
  }
  return text; 
}

async function savePDFwithCover() {
  const pdf = new jsPDF("p", "pt", "a6");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const cols = 15;
  const minCellWidth = 15;
  const cellHeight = 27;
  const startY = 55;

  const marginX = 0;                             
  const textWidth = pageWidth - marginX * 2;       
  const coverImg = new Image();
  coverImg.src = "pdf/cover-01.png";
  await new Promise((resolve) => {
    coverImg.onload = () => {
      pdf.addImage(coverImg, "PNG", 0, 0, pageWidth, pageHeight);
      resolve();
    };
  });


  for (let page = 1; page <= totalBodyPages; page++) {
    pdf.addPage();
    pdf.setFillColor("#fffef2");
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
    pdf.setFontSize(18);
    const data = await loadPageJSON(page);
    const values = Object.values(data).slice(0, cols * 20); 
    const rows = [];
    for (let i = 0; i < values.length; i += cols) {
      rows.push(values.slice(i, i + cols));
    }

    rows.forEach((rowValues, rowIndex) => {
      const rowMaxWidth = Math.max(...rowValues.map(v => pdf.getTextWidth(v)), minCellWidth);

      const totalRowWidth = rowMaxWidth * cols;
      const startX = (pageWidth - totalRowWidth) / 2;

      rowValues.forEach((value, colIndex) => {
        const x = startX + colIndex * rowMaxWidth + rowMaxWidth / 2;
        const y = startY + rowIndex * cellHeight;

        pdf.setFont(getFontForText(value));
        pdf.text(formatTextForPDF(value), x, y, { align: "center" });
      });
    });
    pdf.text(`${page}`, pageWidth / 2, pageHeight - 20, { align: "center" });
  }
  
  pdf.addPage();
  pdf.setFillColor("#000000");
  pdf.setTextColor("#FFFFFF");    
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  const backLines = backCoverText.split("\n");
  let backY = 18;
  
  backLines.forEach((line) => {
    const font = getFontForText(line);
    pdf.setFont(font);

    if (line.trim() === "") {
      backY += 18; 
      return;
    }

    const wrapped = pdf.splitTextToSize(line, textWidth);
    const blockWidth = pdf.getTextWidth(wrapped.join(" ")) || textWidth;
    const startX = (pageWidth - blockWidth) / 2;

    wrapped.forEach((wrapLine) => {
      pdf.setFontSize(16);
      pdf.text(wrapLine, pageWidth / 2, backY, { align: "center" });
      backY += 18;
    });
  });
  pdf.save("BindTheAir.pdf");
}

// saveBtn.addEventListener("click", async () => {
//   saveBtn.disabled = true;
//   saveBtn.textContent = "Processing...";
//   await savePDFwithCover();
//   saveBtn.disabled = false;

//   const now = new Date();
//   const hours = String(now.getHours()).padStart(2, "0");
//   const minutes = String(now.getMinutes()).padStart(2, "0");
//   const formattedTime = `${hours}:${minutes}`;

//   saveBtn.textContent = `Bound at ${formattedTime}`;
// });


saveBtn.addEventListener("click", async () => {
  saveBtn.disabled = true;
  saveBtn.textContent = "Processing...";
  await savePDFwithCover();
  saveBtn.disabled = false;

  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");

  hours = hours % 12;
  if (hours === 0) hours = 12;
  const hourStr = String(hours).padStart(2, "0");

  saveBtn.textContent = `Bound at ${hourStr}:${minutes}`;
});
