const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const app = express();


app.use(express.json());




function chunkText(text, size = 300) {
    const chunks = [];
    for (let i = 0; i < text.length; i += size) {
        chunks.push(text.slice(i, i + size));
    }
    return chunks;
}


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });


app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});


app.post("/upload", upload.single("document"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({ error: "No file  uploaded" });
    }

    const filePath = path.join(__dirname, "uploads", req.file.filename);

    const fileContents = fs.readFileSync(filePath, "utf-8");

    const chunks = chunkText(fileContents);

    console.log("File contents: ", fileContents);

    console.log("Chunks:", chunks);

    res.json({ message: "File uploaded and processed", filename: req.file.originalname});
});

app.listen(3001, () => {
    console.log("Server running on port 3001");
});