const express = require("express");
const multer = require("multer");
const app = express();

app.use(express.json());


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
        return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({ message: "File uploaded sucessfully", filename: req.file.originalname});
});

app.listen(3001, () => {
    console.log("Server running on port 3001");
});