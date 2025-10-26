// const express = require("express");
// const app = express();
// const http = require("http").createServer(app);
// const io = require("socket.io")(http);
// const fs = require("fs");
// const path = require("path");

// // // 정적 파일 제공 (rooms 폴더)
// // app.use(express.static('rooms'));

// // // 가능한 조합들 생성
// // const colors = ["color1", "color2", "color3"];
// // const roofs = ["roof1", "roof2", "roof3-R", "roof3-G", "roof3-B"];
// // const walls = ["wall1", "wall2", "wall3"];
// // const sizes = ["size1", "size2", "size3"];
// // let fileNames = [];

// // // 파일 이름 조합 생성
// // colors.forEach(color => {
// //   roofs.forEach(roof => {
// //     walls.forEach(wall => {
// //       sizes.forEach(size => {
// //         fileNames.push(`${color}_${roof}_${wall}_${size}`);
// //       });
// //     });
// //   });
// // });

// // // 각 조합에 대한 초기 데이터 설정 및 파일 로드
// // let textDataMap = {};
// // fileNames.forEach(fileName => {
// //   const dataFilePath = path.join(__dirname, "data", `${fileName}.json`);
  
// //   if (fs.existsSync(dataFilePath)) {
// //     textDataMap[fileName] = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
// //   } else {
// //     console.log(dataFilePath + " is not exist");
// //     textDataMap[fileName] = {};
// //     for (let i = 1; i <= 4200; i++) {
// //       textDataMap[fileName][`input${i}`] = "";
// //     }
// //     fs.writeFileSync(dataFilePath, JSON.stringify(textDataMap[fileName], null, 2), "utf8");
// //   }
// // });

// // HTML 파일 제공
// app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static('pages'));

// // app.get("/:filename", (req, res) => {
// //   const filePath = path.join(__dirname, "rooms", `${req.params.filename}.html`);
// //   res.sendFile(filePath);
// // });

// // // JSON 파일 제공
// // app.get("/data/:filename", (req, res) => {
// //   const filePath = path.join(__dirname, "data", `${req.params.filename}.json`);
// //   if (fs.existsSync(filePath)) {
// //     res.sendFile(filePath);
// //   } else {
// //     res.status(404).send({ error: "File not found" });
// //   }
// // });

// // // 클라이언트 접속 처리
// // io.on("connection", (socket) => {
// //   console.log("🟢 A user connected");

// //   // 모든 파일의 데이터를 클라이언트로 전송
// //   fileNames.forEach(fileName => {
// //     socket.emit(`update_data_${fileName}`, textDataMap[fileName]);
// //   });

// //   // 데이터 업데이트 및 전송 처리
// //   fileNames.forEach(fileName => {
// //     socket.on(`new_data_${fileName}`, (data) => {
// //       textDataMap[fileName][data.id] = data.value;
// //       io.emit(`update_data_${fileName}`, textDataMap[fileName]);

// //       const dataFilePath = path.join(__dirname, "data", `${fileName}.json`);
// //       fs.writeFile(dataFilePath, JSON.stringify(textDataMap[fileName], null, 2), (err) => {
// //         if (err) console.error(`Error writing file ${dataFilePath}:`, err);
// //       });
// //     });

// //     socket.on(`delete_data_${fileName}`, (data) => {
// //       textDataMap[fileName][data.id] = ''; // 텍스트 삭제
// //       io.emit(`update_data_${fileName}`, textDataMap[fileName]);

// //       const dataFilePath = path.join(__dirname, "data", `${fileName}.json`);
// //       fs.writeFile(dataFilePath, JSON.stringify(textDataMap[fileName], null, 2), (err) => {
// //         if (err) console.error(`Error writing file ${dataFilePath}:`, err);
// //       });
// //     });

// //     socket.on(`focus_change_${fileName}`, (data) => {
// //       io.emit(`focus_change_${fileName}`, data);
// //     });
// //   });

// //   socket.on("disconnect", () => {
// //     console.log("🔴 A user disconnected");
// //   });
// // });

// // 서버 실행 (127.0.0.1:8080)
// const PORT = 8080;
// const HOST = "127.0.0.1";
// http.listen(PORT, HOST, () => {
//   console.log(`✅ Server running at http://${HOST}:${PORT}/`);
// });



// // 터미널에서 실행: vi ./data/color1_roof1_wall1_size1.json
// // vi: 파일 편집기 실행


// //====================================================================
// const express = require("express");
// const app = express();
// const http = require("http").createServer(app);
// const io = require("socket.io")(http);
// const fs = require("fs");
// const path = require("path");

// // HTML 파일 제공
// app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static('pages'));

// // Socket.io 연결
// io.on('connection', (socket) => {
//   console.log('A user connected ✅');

//   // ✅ 새로 연결된 클라이언트가 데이터 요청하면
//   socket.on('requestPlaneData', (planeId) => {
//     const filePath = path.join(__dirname, 'pages', `plane_${planeId}.json`);

//     if (fs.existsSync(filePath)) {
//       const raw = fs.readFileSync(filePath, 'utf8');
//       const data = JSON.parse(raw);

//       socket.emit('loadPlaneData', { planeId, data });
//     } else {
//       socket.emit('loadPlaneData', { planeId, data: [] });
//     }
//   });

//   // ✅ 클라이언트에서 입력이 오면 저장 + 방송
//   socket.on('inputChange', ({ planeId, inputIndex, value }) => {
//     console.log(`Plane ${planeId}, Input ${inputIndex}: ${value}`);

//     const filePath = path.join(__dirname, 'pages', `plane_${planeId}.json`);

//     let data = [];
//     if (fs.existsSync(filePath)) {
//       try {
//         const raw = fs.readFileSync(filePath, 'utf8');
//         data = JSON.parse(raw);
//       } catch (err) {
//         console.error('JSON parse error:', err);
//         data = [];
//       }
//     }

//     data[inputIndex] = value;
//     fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

//     io.emit('updateInput', { planeId, inputIndex, value });
//   });

//   socket.on('disconnect', () => {
//     console.log('A user disconnected ❌');
//   });
// });


// // 서버 실행 (127.0.0.1:8080)
// const PORT = 8080;
// const HOST = "127.0.0.1";
// http.listen(PORT, HOST, () => {
//   console.log(`✅ Server running at http://${HOST}:${PORT}/`);
// });
// //====================================================================

const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const fs = require("fs");
const path = require("path");

const inputsCount = 180;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("pages"));

io.on("connection", (socket) => {
  console.log("A user connected ✅");

  // 클라이언트가 plane 데이터 요청
  socket.on("requestPlaneData", (planeId) => {
    const filePath = path.join(__dirname, "pages", `plane_${planeId}.json`);
    let data = {};

    if (fs.existsSync(filePath)) {
      try { data = JSON.parse(fs.readFileSync(filePath, "utf8")); }
      catch(err){ console.error("JSON parse error:", err); }
    } else {
      for(let i=0;i<inputsCount;i++) data[`input${i}`]='';
      fs.writeFileSync(filePath, JSON.stringify(data, null,2));
    }

    socket.emit("loadPlaneData", { planeId, data });
  });

  // 입력 변경: 모든 클라이언트에 broadcast
  socket.on("inputChange", ({ planeId, inputIndex, value }) => {
    const filePath = path.join(__dirname, "pages", `plane_${planeId}.json`);
    let data = {};

    if(fs.existsSync(filePath)){
      try{ data = JSON.parse(fs.readFileSync(filePath,"utf8")); } 
      catch(err){ console.error("JSON parse error:", err); }
    }

    data[`input${inputIndex}`] = value;
    fs.writeFileSync(filePath, JSON.stringify(data,null,2));

    io.emit("updateInput", { planeId, inputIndex, value });
  });

  socket.on("disconnect", ()=> console.log("A user disconnected ❌"));
});


// 서버 실행
const PORT = 8080;
http.listen(PORT, "127.0.0.1", () => {
  console.log(`✅ Server running at http://127.0.0.1:${PORT}/`);
});
