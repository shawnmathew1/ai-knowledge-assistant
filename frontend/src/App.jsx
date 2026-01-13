import { useState } from 'react'
import './App.css'

function App() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question) return;

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error(err);
      setResponse({ error: "Something went wrong" });
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>AI Knowledge Assistant</h1>

      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question..."
        style={{ padding: "0.5rem", width: "300px" }}
      />

      <button
        onClick={handleAsk}
        style={{ marginLeft: "1rem", padding: "0.5rem" }}
      >
        {loading ? "Thinking..." : "Ask"}
      </button>

      {response && (
        <div style={{ marginTop: "2rem" }}>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
