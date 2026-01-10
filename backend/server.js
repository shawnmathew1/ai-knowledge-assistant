const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const app = express();
let documents = [];

app.use(express.json());


const DATA_PATH = path.join(__dirname, "data", "documents.json");

if (fs.existsSync(DATA_PATH)) {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    documents = JSON.parse(raw);
}


function embedText(text) {

    const vector = new Array(10).fill(0);

    for (let i = 0; i < text.length; i++) {
        vector[i % 10] += text.charCodeAt(i);
    }

    return Promise.resolve(vector);
}

function saveDocuments() {
    fs.writeFileSync(DATA_PATH, JSON.stringify(documents, null, 2));
}


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


function scoreChunk(chunkText, question) {
    const chunkWords = chunkText.toLowerCase().split(/\W+/);
    const questionWords = question.toLowerCase().split(/\W+/);

    let score = 0;

    questionWords.forEach(word => {
        if (chunkWords.includes(word)) {
            score++;
        }
    });

    return score;
}




app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});



app.post("/upload", upload.single("document"), async (req, res) => {

    if (!req.file) {
        return res.status(400).json({ error: "No file  uploaded" });
    }

    const filePath = path.join(__dirname, "uploads", req.file.filename);

    const fileContents = fs.readFileSync(filePath, "utf-8");

    const chunks = fileContents.split("\n").map(line => line.trim()).filter(line => line.length > 0);



    for (const chunk of chunks) {
        const embedding = await embedText(chunk);
              
        documents.push({
            text: chunk,
            source: req.file.originalname,
            embedding
        });

   }


    saveDocuments();

    console.log("Stored documents:", documents);

    res.json({ message: "File uploaded and persisted", 
               filename: req.file.originalname,
               chunksStored: chunks.length,
               preview: chunks.slice(0,3)
    });
});

app.get("/documents", (req, res) => {
    res.json(documents);
});

app.post("/query", (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({error: "Question is required" });
    }


    const scoredResults = documents
        .map(doc => ({
            ...doc,
            score: scoreChunk(doc.text, question)
        }))
        .filter(doc => doc.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);



    res.json({
        question,
        matches: scoredResults
    });


});





app.listen(3001, () => {
    console.log("Server running on port 3001");
});