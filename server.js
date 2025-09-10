import express from "express";
import 'dotenv/config'

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

app.post('/api/response', async(req, res) => {
    try {
        const data = req.body
        let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.Gemini_API_Key}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        let result = await response.json();
        res.json(result);
    } catch(err) {
        res.status(505).json({error: err});
    }
})

app.listen(port, () => {
    console.log(`Server is running on https://localhost:3000`);
})