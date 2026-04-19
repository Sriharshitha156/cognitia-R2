import { useState, useRef, useEffect } from "react";
import styles from "./App.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function App() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null); // { question, answer, responseTimeMs }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  }, [question]);

  const handleSubmit = async () => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setResult(data);
      setQuestion("");
    } catch {
      setError("Could not connect to the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleReset = () => {
    setResult(null);
    setError("");
    setQuestion("");
    textareaRef.current?.focus();
  };

  return (
    <div className={styles.root}>
      {/* Background grid */}
      <div className={styles.grid} aria-hidden />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>C</span>
          <span>OGNITIA</span>
        </div>
        <div className={styles.badge}>llama-3.1-8b · groq</div>
      </header>

      <main className={styles.main}>
        {/* Hero */}
        <div className={styles.hero}>
          <h1 className={styles.title}>
            Ask anything.<br />
            <span className={styles.titleAccent}>Get answers.</span>
          </h1>
          <p className={styles.subtitle}>
            One question. One answer. No noise.
          </p>
        </div>

        {/* Input card */}
        <div className={styles.card}>
          <div className={styles.inputWrapper}>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              placeholder="Type your question and press Enter…"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={1}
              maxLength={2000}
            />
            <div className={styles.inputFooter}>
              <span className={styles.charCount}>
                {question.length}/2000
              </span>
              <button
                className={styles.sendBtn}
                onClick={handleSubmit}
                disabled={loading || !question.trim()}
                aria-label="Send question"
              >
                {loading ? (
                  <span className={styles.spinner} />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className={styles.loadingCard}>
            <div className={styles.loadingDots}>
              <span /><span /><span />
            </div>
            <p className={styles.loadingText}>Thinking…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className={styles.errorCard}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className={styles.resultCard}>
            <div className={styles.resultQuestion}>
              <span className={styles.resultLabel}>You asked</span>
              <p className={styles.questionText}>{result.question}</p>
            </div>
            <div className={styles.divider} />
            <div className={styles.resultAnswer}>
              <span className={styles.resultLabel}>
                <span className={styles.aiDot} />
                Cognitia
              </span>
              <p className={styles.answerText}>{result.answer}</p>
            </div>
            <div className={styles.resultFooter}>
              <span className={styles.responseTime}>
                ⚡ {result.responseTimeMs}ms
              </span>
              <button className={styles.askAgainBtn} onClick={handleReset}>
                Ask another question
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        Built for Cognitia Round 2 · Powered by Groq &amp; LLaMA 3.1
      </footer>
    </div>
  );
}
