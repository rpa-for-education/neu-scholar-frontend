import { useState } from "react";

// 🔹 URL backend online
const API_URL = "https://neu-scholar-backend.vercel.app";

const Section = ({ title, children }) => (
  <section style={{ margin: "18px 0", padding: 16, border: "1px solid #e5e7eb", borderRadius: 12 }}>
    <h2 style={{ margin: 0, marginBottom: 8, fontSize: 18 }}>{title}</h2>
    {children}
  </section>
);

const Box = ({ children }) => (
  <div style={{ display: "grid", gap: 8 }}>{children}</div>
);

const Field = ({ label, children }) => (
  <label style={{ display: "grid", gap: 6 }}>
    <span style={{ fontSize: 13, color: "#334155" }}>{label}</span>
    {children}
  </label>
);

const Button = ({ children, ...props }) => (
  <button
    {...props}
    style={{
      padding: "8px 14px",
      borderRadius: 10,
      border: "1px solid #cbd5e1",
      background: "#0ea5e9",
      color: "white",
      fontWeight: 600,
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);

const GhostButton = ({ children, ...props }) => (
  <button
    {...props}
    style={{
      padding: "6px 10px",
      borderRadius: 8,
      border: "1px solid #e2e8f0",
      background: "white",
      color: "#0f172a",
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);

const Input = (props) => (
  <input
    {...props}
    style={{
      padding: "8px 12px",
      borderRadius: 10,
      border: "1px solid #cbd5e1",
      outline: "none",
    }}
  />
);

const Select = (props) => (
  <select
    {...props}
    style={{
      padding: "8px 12px",
      borderRadius: 10,
      border: "1px solid #cbd5e1",
      outline: "none",
      background: "white",
    }}
  />
);

const JSONView = ({ data }) => (
  <pre
    style={{
      background: "#0b1020",
      color: "#e6eaff",
      padding: 12,
      borderRadius: 12,
      overflow: "auto",
      border: "1px solid #1f2937",
      maxHeight: 420,
    }}
  >
    {data ? JSON.stringify(data, null, 2) : "// (chưa có dữ liệu)"}
  </pre>
);

// 🔹 API helper function
async function api(path, opts) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt}`);
  }
  return res.json();
}

export default function App() {
  const [tab, setTab] = useState("agent");
  const [limit, setLimit] = useState(5);

  // Journals
  const [jQ, setJQ] = useState("Education");
  const [jUseVector, setJUseVector] = useState(true);
  const [jData, setJData] = useState(null);
  const fetchJournals = async () => {
    const path = jUseVector
      ? `/api/journals/search?q=${encodeURIComponent(jQ)}&limit=${limit}`
      : `/api/journals?q=${encodeURIComponent(jQ)}&limit=${limit}`;
    const data = await api(path);
    setJData(data);
  };

  // Conferences
  const [cQ, setCQ] = useState("Robotics");
  const [cUseVector, setCUseVector] = useState(true);
  const [cData, setCData] = useState(null);
  const fetchConferences = async () => {
    const path = cUseVector
      ? `/api/conferences/search?q=${encodeURIComponent(cQ)}&limit=${limit}`
      : `/api/conferences?q=${encodeURIComponent(cQ)}&limit=${limit}`;
    const data = await api(path);
    setCData(data);
  };

  // Search all
  const [aQ, setAQ] = useState("Education");
  const [allData, setAllData] = useState(null);
  const fetchAll = async () => {
    const data = await api(`/api/search/all?q=${encodeURIComponent(aQ)}&limit=${limit}`);
    setAllData(data);
  };

  // Agent
  const [question, setQuestion] = useState("Các hội thảo Education nổi bật?");
  const [provider, setProvider] = useState("gemini");
  const [topk, setTopk] = useState(5);
  const [agentResp, setAgentResp] = useState(null);
  const askAgent = async () => {
    const data = await api("/api/agent", {
      method: "POST",
      body: JSON.stringify({ question, provider, topk }),
    });
    setAgentResp(data);
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: "linear-gradient(135deg,#7c9cff,#22d3ee)",
          display: "grid", placeItems: "center", color: "white", fontWeight: 800
        }}>NEU</div>
        <div>
          <h1 style={{ margin: 0 }}>Dữ liệu Journal, Conference</h1>
          <div style={{ color: "#64748b" }}>Kết nối API: <code>{API_URL}</code></div>
        </div>
      </header>

      <nav style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["agent", "journals", "conferences", "all"].map(k => (
          <GhostButton key={k} onClick={() => setTab(k)}>{k.toUpperCase()}</GhostButton>
        ))}
      </nav>

      {tab === "agent" && (
        <Section title="Agent">
          <Box>
            <Field label="Câu hỏi">
              <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Nhập câu hỏi…" />
            </Field>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Field label="Provider">
                <Select value={provider} onChange={(e) => setProvider(e.target.value)}>
                  <option value="gemini">gemini</option>
                  <option value="qwen">qwen</option>
                </Select>
              </Field>
              <Field label="TopK">
                <Input type="number" min={1} value={topk} onChange={(e) => setTopk(+e.target.value)} />
              </Field>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Button onClick={askAgent}>Gửi</Button>
              <GhostButton onClick={() => setQuestion("Các hội thảo Robotics hàng đầu năm nay?")}>Ví dụ Robotics</GhostButton>
              <GhostButton onClick={() => setQuestion("Có tạp chí Education Q1 nào phù hợp?")}>Ví dụ Education</GhostButton>
            </div>
            <JSONView data={agentResp} />
          </Box>
        </Section>
      )}

      {tab === "journals" && (
        <Section title="Journals">
          <Box>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Field label="Từ khóa">
                <Input value={jQ} onChange={(e) => setJQ(e.target.value)} />
              </Field>
              <Field label="Limit">
                <Input type="number" min={1} value={limit} onChange={(e) => setLimit(+e.target.value)} />
              </Field>
              <Field label="Chế độ">
                <Select value={String(jUseVector)} onChange={(e) => setJUseVector(e.target.value === "true")}>
                  <option value="true">Vector first (/api/journals/search)</option>
                  <option value="false">Text regex (/api/journals)</option>
                </Select>
              </Field>
            </div>
            <Button onClick={fetchJournals}>Tìm</Button>
            <JSONView data={jData} />
          </Box>
        </Section>
      )}

      {tab === "conferences" && (
        <Section title="Conferences">
          <Box>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Field label="Từ khóa">
                <Input value={cQ} onChange={(e) => setCQ(e.target.value)} />
              </Field>
              <Field label="Limit">
                <Input type="number" min={1} value={limit} onChange={(e) => setLimit(+e.target.value)} />
              </Field>
              <Field label="Chế độ">
                <Select value={String(cUseVector)} onChange={(e) => setCUseVector(e.target.value === "true")}>
                  <option value="true">Vector first (/api/conferences/search)</option>
                  <option value="false">Text regex (/api/conferences)</option>
                </Select>
              </Field>
            </div>
            <Button onClick={fetchConferences}>Tìm</Button>
            <JSONView data={cData} />
          </Box>
        </Section>
      )}

      {tab === "all" && (
        <Section title="Search All (journals + conferences)">
          <Box>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Field label="Từ khóa">
                <Input value={aQ} onChange={(e) => setAQ(e.target.value)} />
              </Field>
              <Field label="Limit">
                <Input type="number" min={1} value={limit} onChange={(e) => setLimit(+e.target.value)} />
              </Field>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Button onClick={fetchAll}>Tìm</Button>
              <GhostButton onClick={() => setAQ("Education")}>Ví dụ Education</GhostButton>
              <GhostButton onClick={() => setAQ("Robotics")}>Ví dụ Robotics</GhostButton>
            </div>
            <JSONView data={allData} />
          </Box>
        </Section>
      )}
    </div>
  );
}
