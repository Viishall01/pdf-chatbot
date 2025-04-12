

import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker";
import { useEffect, useRef, useState } from "react";
import { Upload, Send, Menu, X, FileUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import chatWithGPT from "./config/GenAi";
import ReactMarkdown from "react-markdown";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState("");
  const [initialPrompt, setInitialPrompt] = useState("");
  const [docData, setDocData] = useState();
  const [aiResponse, setAiResponse] = useState();
  let textContent = "";
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = async (event) => {
    setIsLoading(true);
    setError("");
    const uploadedFile = event.target.files[0];
    setSelectedFile(uploadedFile);
    if (!uploadedFile) return;

    if (uploadedFile.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      return;
    }

    if (uploadedFile.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result);
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        textContent += text.items.map((item) => item.str).join(" ") + "\n";
      }
      setDocData(textContent);
    };

    reader.readAsArrayBuffer(uploadedFile);
    setIsLoading(false);
  };

  const sendToGpt = async () => {
    setIsLoading(true);
    const result = await chatWithGPT(docData, initialPrompt);
    setInitialPrompt("");
    setAiResponse(result);
    setMessages([...messages, { text: initialPrompt, type: "user" }, { text: result, type: "bot" }]);
    setIsLoading(false);
  };
                                                                                        
  return (
  <div className="flex justify-center items-center">
    <div className={`md:w-3xl flex flex-col h-[92vh] md:h-screen w-full bg-gray-100`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white shadow-md">
        <h2 className="text-lg font-semibold">Let's Chat with Your Doc</h2>
        <button onClick={() => setIsSidebarOpen(true)}>
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Sidebar with Animation */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Sidebar</h3>
              <button onClick={() => setIsSidebarOpen(false)}>
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="p-2 bg-blue-500 text-white text-center rounded-full mb-2">Sign-In</div>
            <div className="p-2 bg-blue-500 text-white text-center rounded-full mb-2">Contact-us</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`p-4 rounded-2xl max-w-lg shadow-md 
            ${msg.type === "user" ? "bg-blue-500 text-white self-end ml-auto" : "bg-gray-100 text-gray-900"}`}
        >
          <ReactMarkdown className="prose max-w-none">{msg.text}</ReactMarkdown>
        </div>
      ))}
      {isLoading && (
        <div className="text-gray-400 flex items-center gap-2">
          <FileUp className="animate-spin" />
          <span>Loading file...</span>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>

      {/* Input Field with Upload Icon */}
      
       <div className="px-2 pb-3 pt-2 bg-white border-t border-slate-300 flex flex-col">
        {selectedFile && (
          <div onClick={(e)=>setSelectedFile(null)} className="text-gray-600 text-sm mx-1 mb-2 px-3 py-1 bg-gray-200 rounded-md text-ellipsis overflow-hidden whitespace-nowrap">
            {selectedFile.name}
          </div>
        )}
        <div className="mb-5 md:mb-0 flex items-center gap-2 p-2 bg-gray-100 rounded-full shadow-sm w-full relative">
          <label htmlFor="pdfUpload" className="cursor-pointer flex items-center px-1">
            <Upload className="w-6 h-6 text-gray-500" />
          </label>
          <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" id="pdfUpload" />
          <input
            type="text"
            className="flex-1 bg-transparent w-full focus:outline-none text-sm sm:text-base p-1 h-12"
            placeholder="Ask a question..."
            value={initialPrompt}
            onChange={(e) => setInitialPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendToGpt()}
          />
          <button onClick={sendToGpt} disabled={isLoading} className="px-1 absolute right-2 m-1">
            <Send className="w-6 h-6 text-blue-500" />
          </button>
        </div>
      </div> 
    </div>
    </div>
  );
}


