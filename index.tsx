
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

interface SearchResult {
  text: string;
  chunks: GroundingChunk[];
}

function App() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Find 5 high-quality research articles, papers, or reputable academic sources published in the last 5 years (2020-2025) related to: "${topic}". 
        
        For each article, provide:
        1. Title
        2. Authors (if available)
        3. Year
        4. A brief summary of why it is relevant for a presentation.
        
        Use Markdown formatting (bolding titles, using bullet points) to make it easy to read.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "No results found.";
      const chunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      setResult({ text, chunks });
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching articles.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "40px 24px",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        color: "#1f2937",
      }}
    >
      <header style={{ marginBottom: "40px", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            color: "#111827",
            marginBottom: "12px",
            fontWeight: "800",
            letterSpacing: "-0.025em",
          }}
        >
          Research Article Finder
        </h1>
        <p style={{ color: "#4b5563", fontSize: "1.125rem", maxWidth: "600px", margin: "0 auto" }}>
          Find cited academic sources from the last 5 years to support your presentation.
        </p>
      </header>

      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)",
          padding: "24px",
          marginBottom: "40px",
        }}
      >
        <form
          onSubmit={handleSearch}
          style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
        >
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter presentation topic (e.g., 'CRISPR applications 2024')"
            style={{
              flex: "1 1 300px",
              padding: "14px 20px",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
              fontSize: "1rem",
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#3b82f6";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          <button
            type="submit"
            disabled={loading || !topic}
            style={{
              backgroundColor: loading ? "#9ca3af" : "#2563eb",
              color: "white",
              border: "none",
              padding: "14px 28px",
              borderRadius: "10px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s, transform 0.1s",
              whiteSpace: "nowrap",
            }}
          >
            {loading ? "Searching..." : "Find Articles"}
          </button>
        </form>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "16px",
            borderRadius: "10px",
            marginBottom: "30px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "32px",
            alignItems: "flex-start",
          }}
        >
          {/* Main Content - Markdown Rendered */}
          <div
            style={{
              flex: "2 1 600px",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
              padding: "40px",
              minWidth: "0", // Prevents flex child from overflowing
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "#111827",
                paddingBottom: "16px",
                marginBottom: "24px",
                fontSize: "1.5rem",
                fontWeight: "700",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              Research Suggestions
            </h2>
            <div
              className="markdown-content"
              style={{
                lineHeight: "1.75",
                color: "#374151",
                fontSize: "1.05rem",
              }}
            >
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => (
                    <h3 style={{ fontSize: "1.4em", marginTop: "1.5em", marginBottom: "0.5em", color: "#111827" }} {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h4 style={{ fontSize: "1.25em", marginTop: "1.4em", marginBottom: "0.5em", color: "#1f2937" }} {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h5 style={{ fontSize: "1.1em", marginTop: "1.2em", marginBottom: "0.5em", fontWeight: "bold" }} {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul style={{ paddingLeft: "1.5em", marginBottom: "1em" }} {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol style={{ paddingLeft: "1.5em", marginBottom: "1em" }} {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li style={{ marginBottom: "0.5em" }} {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p style={{ marginBottom: "1.2em" }} {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong style={{ color: "#111827", fontWeight: "600" }} {...props} />
                  ),
                  a: ({ node, ...props }) => (
                    <a style={{ color: "#2563eb", textDecoration: "underline" }} {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      style={{
                        borderLeft: "4px solid #e5e7eb",
                        paddingLeft: "1em",
                        color: "#6b7280",
                        fontStyle: "italic",
                        marginLeft: 0,
                      }}
                      {...props}
                    />
                  ),
                }}
              >
                {result.text}
              </ReactMarkdown>
            </div>
          </div>

          {/* Sources / Links Sidebar - Sticky */}
          <div
            style={{
              flex: "1 1 300px",
              backgroundColor: "#f9fafb",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid #e5e7eb",
              position: "sticky",
              top: "20px",
              maxHeight: "calc(100vh - 40px)",
              overflowY: "auto",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color: "#111827",
                fontSize: "1.1rem",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontWeight: "600",
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>🔗</span> Source Links
            </h3>
            {result.chunks.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {result.chunks.map((chunk, index) => {
                  if (!chunk.web) return null;
                  return (
                    <li
                      key={index}
                      style={{
                        marginBottom: "16px",
                        backgroundColor: "white",
                        padding: "16px",
                        borderRadius: "10px",
                        border: "1px solid #e5e7eb",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.05)";
                        e.currentTarget.style.borderColor = "#d1d5db";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.borderColor = "#e5e7eb";
                      }}
                    >
                      <a
                        href={chunk.web.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: "none",
                          display: "block",
                        }}
                      >
                        <div
                          style={{
                            color: "#1f2937",
                            fontWeight: "600",
                            fontSize: "0.95rem",
                            marginBottom: "6px",
                            lineHeight: "1.4",
                          }}
                        >
                          {chunk.web.title || "Untitled Source"}
                        </div>
                        <div
                          style={{
                            color: "#2563eb",
                            fontSize: "0.8rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                          {new URL(chunk.web.uri).hostname}
                        </div>
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#6b7280" }}>
                <p style={{ fontSize: "0.9rem" }}>No direct source links found.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
