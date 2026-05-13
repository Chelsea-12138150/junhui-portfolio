// ========================================
// 🤖 AI 聊天功能
// ========================================

// ⚠️ 配置区：把下面的 API KEY 换成你自己的
// 免费获取地址：https://aistudio.google.com/apikey
const GEMINI_API_KEY = "在这里粘贴你的_API_KEY";

// AI 的人设（System Prompt）—— 告诉 AI 它是谁
// 👉 你可以改成你自己的介绍，让 AI 代替你回答访客的问题
const AI_PERSONA = `
You are AI-Me, a digital twin of Your Name, a Digital Social Researcher
and student majoring in Digital Social Science at Beijing Normal-Hong Kong
Baptist University.

Your background:
- GPA 3.89/4.0, Rank 1/58, First Class Scholarship
- Exchange student at HKBU (2024)
- Summer school at NUS (Cyberpsychology, Grade A++)
- Research focus: AI Companion Emotional Interaction, Elderly Digital Behavior
- Skills: Python, SQL, Tableau, MAXQDA, Canva
- Interests: AI for Social Science, bridging humanity and technology

Personality: warm, thoughtful, curious, slightly academic but approachable.
Always answer in a friendly, conversational tone. Keep answers concise (2-4 sentences).
You can respond in the language the user writes in (English or Chinese).
`;

// 获取页面元素
const chatBtn = document.getElementById("chatBtn");
const chatWindow = document.getElementById("chatWindow");
const chatClose = document.getElementById("chatClose");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");

// 保存对话历史，这样 AI 能记住上下文
let conversationHistory = [];

// 打开/关闭聊天窗口
chatBtn.addEventListener("click", () => {
  chatWindow.classList.toggle("open");
  if (chatWindow.classList.contains("open")) {
    chatInput.focus();
  }
});
chatClose.addEventListener("click", () => {
  chatWindow.classList.remove("open");
});

// 发送消息
function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  // 1. 把用户的消息显示到聊天窗口
  addMessage(text, "user");
  chatInput.value = "";

  // 2. 显示"正在输入..."
  const typingEl = addMessage("Thinking...", "ai", true);

  // 3. 调用 Gemini API
  callGemini(text)
    .then((reply) => {
      typingEl.remove();
      addMessage(reply, "ai");
    })
    .catch((err) => {
      typingEl.remove();
      addMessage(
        "抱歉，AI 暂时无法回答 😅。请检查 API Key 是否填写正确，或稍后再试。",
        "ai"
      );
      console.error(err);
    });
}

// 按回车发送
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
chatSend.addEventListener("click", sendMessage);

// 在聊天窗口里添加一条消息
function addMessage(text, type, isTyping = false) {
  const div = document.createElement("div");
  div.className = `msg msg-${type}`;
  if (isTyping) div.classList.add("msg-typing");
  div.innerHTML = text.replace(/\n/g, "<br>");
  chatMessages.appendChild(div);
  // 滚动到最下面
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

// 调用 Google Gemini API
async function callGemini(userText) {
  // 如果还没填 API KEY，先返回模拟回复
  if (GEMINI_API_KEY === "在这里粘贴你的_API_KEY" || !GEMINI_API_KEY) {
    await new Promise((r) => setTimeout(r, 800)); // 假装思考 0.8 秒
    return `这是一个模拟回复 🤖\n你问的是："${userText}"\n\n要让我真的回答，请去 script.js 填写你的 Gemini API Key（免费）：\nhttps://aistudio.google.com/apikey`;
  }

  // 把历史记录加进来
  conversationHistory.push({ role: "user", parts: [{ text: userText }] });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: AI_PERSONA }] },
        contents: conversationHistory,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  const reply =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Hmm, I couldn't think of a reply.";

  // 保存 AI 回复到历史
  conversationHistory.push({ role: "model", parts: [{ text: reply }] });

  return reply;
}

// ========================================
// ✨ 滚动时元素渐入动画（可选但很加分）
// ========================================
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  },
  { threshold: 0.1 }
);

// 给所有 section 加上"滚到就显示"的效果
document.querySelectorAll(".section").forEach((sec) => {
  // 跳过第一个 hero，因为 hero 有自己的动画
  if (sec.classList.contains("hero")) return;
  sec.style.opacity = "0";
  sec.style.transform = "translateY(40px)";
  sec.style.transition = "all 0.8s ease-out";
  observer.observe(sec);
});