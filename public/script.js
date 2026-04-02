const userInput = document.getElementById("user-input");
const button = document.getElementById("send-button");
const default_header = document.getElementById("header");
const content_box = document.getElementById("ai-content");
const history = [{ role: "user", parts: [{ text: "i am varun, always refer my name in response" }] }];

// 1. Improved Marked Configuration
marked.setOptions({
    highlight: function (code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true
});

button.addEventListener("click", function () {
    if (userInput.value.trim() == "") return;
    if (default_header) default_header.remove();

    const user_content = document.createElement("div");
    user_content.className = "user-content-box";
    user_content.textContent = userInput.value;
    content_box.appendChild(user_content);
    
    history.push({ role: "user", parts: [{ text: userInput.value }] });
    aiResponse();
    
    userInput.value = "";
    userInput.focus();
});

async function aiResponse() {
    const wait_box = document.createElement("div");
    wait_box.className = "wait-box";
    content_box.appendChild(wait_box);
    
    let dots = 0;
    const waitTimer = setInterval(() => {
        dots = (dots + 1) % 4;
        wait_box.innerText = "Generating" + ".".repeat(dots);
    }, 400);

    try {
        let response = await fetch('/api/response', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: history })
        });
        let data = await response.json();
        
        clearInterval(waitTimer);
        wait_box.remove();

        const rawText = data.candidates[0].content.parts[0].text;
        history.push({ role: "model", parts: [{ text: rawText }] });
        
        renderAIResponse(rawText);
    } catch (err) {
        clearInterval(waitTimer);
        if(wait_box) wait_box.remove();
        console.error("Error:", err);
    }
}

function renderAIResponse(text) {
    const response_container = document.createElement("div");
    response_container.className = "response-box";
    
    // Convert Markdown to HTML & Sanitize
    let html = marked.parse(text);
    response_container.innerHTML = DOMPurify.sanitize(html);
    
    // 2. TRIGGER THE COLORS: Highlight all code blocks found in the response
    const codeBlocks = response_container.querySelectorAll('pre code');
    codeBlocks.forEach((block) => {
        hljs.highlightElement(block);
    });
    
    // 3. Add Copy Buttons and Wrapper logic
    const preTags = response_container.querySelectorAll('pre');
    preTags.forEach((pre) => {
        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'code-container';
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        // Create Button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerText = 'Copy';
        
        copyBtn.addEventListener('click', () => {
            const code = pre.querySelector('code').innerText;
            navigator.clipboard.writeText(code).then(() => {
                copyBtn.innerText = 'Copied!';
                copyBtn.classList.add('secondary'); 
                setTimeout(() => {
                    copyBtn.innerText = 'Copy';
                    copyBtn.classList.add(''); 
                }, 2000);
            });
        });

        wrapper.appendChild(copyBtn);
    });

    content_box.appendChild(response_container);
    response_container.scrollIntoView({ behavior: "smooth" });
}

userInput.addEventListener("keydown", (e) => { if (e.key === "Enter") button.click(); });