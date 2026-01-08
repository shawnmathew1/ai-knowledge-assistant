const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const app = express();
const documents = [];

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

    const chunks = fileContents.split("\n").map(line => line.trim()).filter(line => line.length > 0);

    chunks.forEach(chunk => {
        documents.push({
            text: chunk,
            source: req.file.originalname
        });
    });

    console.log("Stored documents:", documents);

    res.json({ message: "File uploaded and processed", 
               filename: req.file.originalname,
               chunksStored: chunks.length,
               preview: chunks.slice(0,3)
    });
});

app.listen(3001, () => {
    console.log("Server running on port 3001");
});