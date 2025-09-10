const userInput = document.getElementById("user-input");
const button = document.getElementById("send-button");
const default_header = document.getElementById("header");
const content_box = document.getElementById("ai-content");
const history = [{role: "user", parts: [{ text: "i am varun, always refer my name in response" }]}];

userInput.focus();
button.addEventListener("click", function () {
  if (userInput.value.trim() == "") {
    return;
  }
  default_header.remove();
  const user_content = document.createElement("div");
  user_content.className = "user-content-box";
  user_content.innerHTML = `${userInput.value}`;
  content_box.appendChild(user_content);
  user_content.scrollIntoView({ behavior: "smooth" });
  history.push({
    role: "user",
    parts: [{ text: userInput.value }],
  });
  aiResponse();
  userInput.value = "";
  userInput.focus();
});

userInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    button.click();
  }
});

async function aiResponse() {
  const wait_box = document.createElement("div");
  wait_box.className = "wait-box";
  content_box.appendChild(wait_box);
  wait(wait_box);
  let response = await fetch('/api/response', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({contents: history})
  })
  let data = await response.json();
  wait_box.remove();
  let markedformat = data.candidates[0].content.parts[0].text;
  let result1 = marked.parse(markedformat);
  let result2 = DOMPurify.sanitize(result1);
  history.push({
    role: "model",
    parts: [{ text: markedformat }],
  });
  render(result2);
}

function render(content) {
  const response_content = document.createElement("div");
  response_content.className = "response-box";
  response_content.innerHTML = `${content}`;
  content_box.appendChild(response_content);
}

async function wait(wait_box) {
  let dot = "";
  setInterval(() => {
    dot = dot.length < 2 ? dot + "." : "";
    wait_box.innerHTML = `Generating.${dot}`;
  }, 500);
}
