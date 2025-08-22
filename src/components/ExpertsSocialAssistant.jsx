import { useState } from "react";
import SourceCard from "./SourceCard";

const API_ENDPOINT =
  window.AGENT_API ||
  new URLSearchParams(window.location.search).get("api") ||
  "http://localhost:4000/api/agent";

export default function ExpertsSocialAssistant() {
  const [question, setQuestion] = useState("");
  const [modelId, setModelId] = useState("qwen-max");
  const [topk, setTopk] = useState(20);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, model_id: modelId, topk }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("API call failed!");
    } finally {
      setLoading(false);
    }
  };

  const fillExample = () => {
    setQuestion("Hãy cho tôi biết những vấn đề sinh viên băn khoăn về phòng đào tạo?");
    setModelId("qwen-max");
    setTopk(50);
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-6 space-y-6">
      <h1 className="text-2xl font-bold">Experts · Social Assistant</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full border rounded p-3"
          rows={3}
          placeholder="Nhập câu hỏi..."
        />
        <div className="flex gap-4 items-center">
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className="border rounded p-2"
          >
            <option value="qwen-max">qwen-max</option>
            <option value="gpt-4o-mini">gpt-4o-mini</option>
          </select>

          <div className="flex items-center gap-2">
            <label>TopK:</label>
            <input
              type="number"
              value={topk}
              onChange={(e) => setTopk(parseInt(e.target.value))}
              min={1}
              max={100}
              className="w-20 border rounded p-1"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Đang chạy..." : "Hỏi"}
          </button>

          <button
            type="button"
            onClick={fillExample}
            className="bg-gray-200 px-3 py-2 rounded"
          >
            Dùng ví dụ
          </button>
        </div>
      </form>

      {/* Kết quả */}
      {result && (
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold">Câu trả lời</h2>
            <pre className="whitespace-pre-wrap bg-gray-50 p-3 rounded">
              {result.answer?.answer || "Không có câu trả lời"}
            </pre>
          </div>

          {result.retrieved?.social?.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold">Nguồn trích dẫn</h2>
              {result.retrieved.social.map((s, i) => (
                <SourceCard key={i} source={s} />
              ))}
            </div>
          )}

          <details>
            <summary className="cursor-pointer text-blue-600">
              Xem JSON raw
            </summary>
            <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
