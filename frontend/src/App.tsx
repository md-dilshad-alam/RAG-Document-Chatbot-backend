import { useState } from "react";
import "./App.css";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const API_URL =
  "https://rag-document-chatbot-backend.onrender.com";

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file.");
      return;
    }

    setSelectedFile(file);
    setDocumentId("");
    setUploaded(false);
    setMessages([]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      setDocumentId(data.document_id);
      setUploaded(true);

      setMessages([
        {
          role: "assistant",
          content:
            "Your PDF has been processed successfully. You can now ask questions about the document.",
        },
      ]);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async () => {
    if (!question.trim()) return;

    if (!documentId) {
      alert("Please upload a PDF first.");
      return;
    }

    const userQuestion = question.trim();

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: userQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userQuestion,
          document_id: documentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to get answer"
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleNewDocument = () => {
    setSelectedFile(null);
    setDocumentId("");
    setUploaded(false);
    setMessages([]);
    setQuestion("");
  };

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-icon">AI</div>

          <div>
            <h1>RAG Document Chatbot</h1>
            <p>
              Ask questions from your documents using AI
            </p>
          </div>
        </div>

        <div className="backend-status">
          <span className="status-dot"></span>
          Backend Online
        </div>
      </header>

      {!uploaded ? (
        <main className="upload-section">
          <div className="upload-card">
            <div className="upload-icon">
              PDF
            </div>

            <h2>Chat with your PDF</h2>

            <p className="upload-description">
              Upload a PDF document and ask questions
              using Retrieval-Augmented Generation.
            </p>

            <label className="select-button">
              Select PDF

              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                hidden
              />
            </label>

            <p className="file-hint">
              Supported format: PDF
            </p>

            {selectedFile && (
              <div className="selected-file">
                <div className="file-info">
                  <div className="file-icon">
                    PDF
                  </div>

                  <div className="file-details">
                    <span className="file-label">
                      Selected document
                    </span>

                    <strong>
                      {selectedFile.name}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="upload-button"
                >
                  {uploading
                    ? "Processing..."
                    : "Upload & Process"}
                </button>
              </div>
            )}
          </div>
        </main>
      ) : (
        <main className="chat-container">
          <div className="document-bar">
            <div className="document-info">
              <div className="document-icon">
                PDF
              </div>

              <div>
                <span>Active document</span>
                <strong>
                  {selectedFile?.name}
                </strong>
              </div>
            </div>

            <button
              className="new-document-button"
              onClick={handleNewDocument}
            >
              + New Document
            </button>
          </div>

          <div className="messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message-row ${message.role}`}
              >
                <div className="message-avatar">
                  {message.role === "assistant"
                    ? "AI"
                    : "You"}
                </div>

                <div
                  className={`message ${message.role}`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="message-row assistant">
                <div className="message-avatar">
                  AI
                </div>

                <div className="message assistant">
                  <span className="thinking">
                    Thinking...
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="input-area">
            <div className="input-container">
              <textarea
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about your document..."
                rows={1}
                disabled={loading}
              />

              <button
                onClick={handleSend}
                disabled={
                  loading ||
                  !question.trim()
                }
                className="send-button"
              >
                {loading ? "..." : "Send"}
              </button>
            </div>

            <p className="input-hint">
              Press Enter to send • Shift + Enter
              for a new line
            </p>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;