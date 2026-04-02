import express from "express";
import 'dotenv/config'

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

app.post('/api/response', async(req, res) => {
    try {
        const data = req.body
        let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.Gemini_API_Key}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        let result = await response.json();
        if (result.error) {
            console.error("Gemini API Error:", result.error.message);
            return res.status(400).json({ error: result.error.message });
        }
        res.json(result);
    } catch(err) {
        console.error("Server crash: ", err);
        res.status(505).json({error: err});
    }
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:3000`);
})