const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const fs = require("fs");
const path = require("path");

const inputsCount = 180;

const PORT = process.env.PORT || 8080;

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// Health Check
app.get("/", (req, res) => res.send("OK"));

app.get("/pages/:file", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages", req.params.file));
});


io.on("connection", (socket) => {
  console.log("A user connected ✅");

  socket.on("requestPlaneData", (pageId) => {
    const filePath = path.join(__dirname, "public/pages", `page_${pageId}.json`);
    let data = {};

    if (fs.existsSync(filePath)) {
      try {
        data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      } catch (err) {
        console.error("JSON parse error:", err);
      }
    } else {
      // page_1.json 부터 생성
      for (let i = 0; i < inputsCount; i++) {
        data[`input${i}`] = '';
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }

    socket.emit("loadPlaneData", { pageId, data });
  });

  socket.on("inputChange", ({ pageId, inputIndex, value }) => {
    const filePath = path.join(__dirname, "public/pages", `page_${pageId}.json`);
    let data = {};

    if (fs.existsSync(filePath)) {
      try {
        data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      } catch (err) {
        console.error("JSON parse error:", err);
      }
    }

    data[`input${inputIndex}`] = value;

    // page_1.json 부터 저장
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    io.emit("updateInput", { pageId, inputIndex, value });
  });

  socket.on("disconnect", () => console.log("A user disconnected ❌"));
});


// 0.0.0.0으로 바인딩
http.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running at http://0.0.0.0:${PORT}/`);
});
