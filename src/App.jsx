import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Send } from "lucide-react";

// Tích hợp models trực tiếp
const MODELS = {
  "gpt-5": { provider: "openai", label: "gpt-5 (OpenAI)" },
  "gpt-5-mini": { provider: "openai", label: "gpt-5-mini (OpenAI)" },
  "gpt-4.1": { provider: "openai", label: "gpt-4.1 (OpenAI)" },
  "gpt-4.1-mini": { provider: "openai", label: "gpt-4.1-mini (OpenAI)" },
  "gemini-2.5-pro": { provider: "gemini", label: "gemini-2.5-pro (Gemini)" },
  "gemini-2.5-flash": { provider: "gemini", label: "gemini-2.5-flash (Gemini)" },
  "gemini-2.5-flash-lite": {
    provider: "gemini",
    label: "gemini-2.5-flash-lite (Gemini)",
  },
  "qwen-max": { provider: "qwen", label: "qwen-max (Qwen)" },
  "qwen-plus": { provider: "qwen", label: "qwen-plus (Qwen)" },
  "qwen-flash": { provider: "qwen", label: "qwen-flash (Qwen)" },
};

function shortenUrl(url) {
  try {
    const u = new URL(url);
    return `${u.hostname}/...`;
  } catch {
    return url;
  }
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("qwen-max");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://neu-scholar-backend.vercel.app/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          model_id: model,
          topk: 50,
        }),
      });

      const data = await res.json();
      let answerText = "";
      let references = [];

      if (data?.answer?.answer) {
        answerText = data.answer.answer;
        references = data.answer.references || [];
      } else if (data?.answer) {
        try {
          const parsed = JSON.parse(data.answer);
          answerText = parsed.answer || "";
          references = parsed.references || [];
        } catch {
          answerText =
            typeof data.answer === "string"
              ? data.answer
              : JSON.stringify(data, null, 2);
        }
      } else {
        answerText = "⚠️ Không có dữ liệu phản hồi từ API.";
      }

      // ✅ Lấy danh sách social posts
      let socialList = [];
      if (data?.retrieved?.social && Array.isArray(data.retrieved.social)) {
        socialList = data.retrieved.social;

        // Lấy top 5 bài tham khảo
        const socialRefs = socialList
          .filter((s) => s.url)
          .slice(0, 5)
          .map((s) => ({
            title: s.noi_dung_bai_viet?.slice(0, 60) + "...",
            url: s.url,
          }));

        references = [...references, ...socialRefs];
      }

      // ✅ Gắn link trực tiếp vào nội dung (theo index)
      answerText = answerText.replace(/Bài viết\s*(\d+)/g, (match, num) => {
        const idx = parseInt(num) - 1;
        if (socialList[idx]?.url) {
          const url = socialList[idx].url;
          return `[Bài viết ${num}](${url})`;
        }
        return match;
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: answerText, references, model },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Lỗi khi gọi API. Vui lòng thử lại.",
          references: [],
          model,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-2 text-lg font-semibold">
        <span className="text-green-600">🤖 NEU-SCHOLAR</span>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`rounded-2xl px-4 py-2 max-w-lg shadow ${
                msg.role === "user"
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-900 border"
              }`}
            >
              {msg.role === "assistant" ? (
                <>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:underline hover:bg-gray-100 rounded px-1"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>

                  {/* Tham khảo */}
                  {msg.references && msg.references.length > 0 && (
                    <div className="mt-3 text-sm border-t pt-2">
                      <div className="font-semibold mb-1 text-gray-700">
                        📚 Tham khảo:
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {msg.references.map((ref, idx) => (
                          <li key={idx}>
                            <a
                              href={ref.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:underline hover:bg-gray-100 rounded px-1 break-words"
                            >
                              {ref.title || shortenUrl(ref.url)}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-sm text-gray-500">Đang suy nghĩ...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input + Model select */}
      <div className="p-3 border-t flex items-center gap-2">
        <select
          className="h-11 border rounded-xl px-2 text-sm focus:ring-0"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          {Object.entries(MODELS).map(([id, { label }]) => (
            <option key={id} value={id}>
              {id === model ? "🟢" : "⚪"} {label}
            </option>
          ))}
        </select>

        <input
          className="flex-1 border rounded-xl px-3 h-11 focus:outline-none"
          placeholder="Nhập câu hỏi..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-4 rounded-xl flex items-center gap-1 h-11"
          onClick={sendMessage}
          disabled={loading}
        >
          <Send size={18} />
          Gửi
        </button>
      </div>
    </div>
  );
}