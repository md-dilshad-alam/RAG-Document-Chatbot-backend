import { useState } from "react";
import "./App.css";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [documentId, setDocumentId] = useState<string>("");

  const [uploading, setUploading] = useState(false);

  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);

  const [loading, setLoading] = useState(false);

  const [uploaded, setUploaded] = useState(false);


  // -----------------------------
  // Select PDF
  // -----------------------------

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file.");
      return;
    }

    setSelectedFile(file);

    setDocumentId("");

    setUploaded(false);

    setMessages([]);
  };


  // -----------------------------
  // Upload PDF
  // -----------------------------

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append(
        "file",
        selectedFile
      );


      const response = await fetch(
        "http://localhost:8000/upload",
        {
          method: "POST",
          body: formData,
        }
      );


      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          data.detail || "Upload failed"
        );
      }


      setDocumentId(
        data.document_id
      );

      setUploaded(true);


      setMessages([
        {
          role: "assistant",
          content:
            "PDF uploaded successfully. You can now ask questions about this document.",
        },
      ]);

    } catch (error) {

      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );

    } finally {

      setUploading(false);
    }
  };


  // -----------------------------
  // Ask question
  // -----------------------------

  const handleSend = async () => {

    if (!question.trim()) {
      return;
    }


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

      const response = await fetch(
        "http://localhost:8000/ask",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            question: userQuestion,
            document_id: documentId,
          }),
        }
      );


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


  // -----------------------------
  // Enter key
  // -----------------------------

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


  return (
    <div className="app">

      {/* Header */}

      <header className="header">

        <div>
          <h1>RAG Document Chatbot</h1>

          <p>
            {uploaded
              ? "PDF selected successfully"
              : "Pehle apna PDF document select karein."}
          </p>
        </div>


        <div className="backend-status">
          <span></span>
          Backend
        </div>

      </header>


      {/* Upload Section */}

      {!uploaded && (

        <section className="upload-section">

          <div className="upload-card">

            <h2>
              Upload your PDF
            </h2>

            <p>
              Select a PDF document to start chatting.
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


            {selectedFile && (

              <div className="selected-file">

                <p>
                  Selected:
                  <strong>
                    {" "}
                    {selectedFile.name}
                  </strong>
                </p>


                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="upload-button"
                >

                  {uploading
                    ? "Uploading..."
                    : "Upload PDF"}

                </button>

              </div>
            )}

          </div>

        </section>
      )}


      {/* Chat Section */}

      {uploaded && (

        <main className="chat-container">

          <div className="messages">

            {messages.map(
              (message, index) => (

                <div
                  key={index}
                  className={`message ${
                    message.role
                  }`}
                >

                  {message.content}

                </div>

              )
            )}


            {loading && (

              <div className="message assistant">
                Thinking...
              </div>

            )}

          </div>


          {/* Input */}

          <div className="input-container">

            <textarea
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Apna question type karein..."
              rows={3}
            />


            <button
              onClick={handleSend}
              disabled={
                loading ||
                !question.trim()
              }
            >

              {loading
                ? "..."
                : "Send"}

            </button>

          </div>

        </main>
      )}

    </div>
  );
}

export default App;