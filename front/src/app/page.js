"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Prism from "prismjs";
import ReactMarkdown from "react-markdown"; // Importing react-markdown
import "prismjs/themes/prism-tomorrow.css"; // Importing Prism.js theme

export default function Home() {
  const [file, setFile] = useState(null);
  const [codeFiles, setCodeFiles] = useState([]);
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Prism.highlightAll(); // Highlight code when component updates
  }, [codeFiles]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const base64String = canvas.toDataURL("image/jpeg", 0.95);
          resolve(base64String.split(",")[1]);
        };

        img.onerror = (error) => {
          reject(error);
        };
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadFile = async () => {
    if (!file) {
      alert("Please select a file.");
      return;
    }

    setIsLoading(true);

    try {
      const base64Image = await convertImageToBase64(file);

      const response = await axios.post(
        "https://2nhekfwic2myrtzgawnqeod24e0nbrke.lambda-url.eu-west-1.on.aws/ProcessInfrastructureImage",
        { image_url: `data:image/jpeg;base64,${base64Image}` },
      );

      const { code_files, explanation } = response.data;
      setCodeFiles(code_files);
      setExplanation(explanation);
    } catch (error) {
      console.error("Error uploading or processing the image", error);
      alert("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadZip = () => {
    const zip = new JSZip();

    codeFiles.forEach((file) => {
      zip.file(file.filename, file.code);
    });

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "infrastructure.zip");
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-100 text-gray-900">
      {/* Top navigation menu */}
      <nav className="bg-black text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <a href="/" className="text-2xl font-bold">
              Infrastructure Generator
            </a>
          </div>
          <div>
            <a href="/" className="mx-4 hover:underline">
              Home
            </a>
            <a
              href="https://nebux.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-4 hover:underline"
            >
              Nebux Cloud
            </a>
          </div>
        </div>
      </nav>

      {/* Main container */}
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-semibold mb-4">
          Upload Image & Generate Infrastructure Code
        </h1>

        <div className="flex flex-col items-center mb-6">
          <input
            type="file"
            onChange={handleFileChange}
            className="mb-4 p-2 bg-gray-200 rounded cursor-pointer"
          />
          <button
            onClick={uploadFile}
            disabled={isLoading}
            className={`${
              isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white font-medium py-2 px-4 rounded transition duration-200`}
          >
            {isLoading ? "Uploading..." : "Upload & Generate Code"}
          </button>
        </div>

        {explanation && (
          <div className="mt-6 bg-gray-100 p-4 rounded-lg text-left">
            <h2 className="text-2xl font-medium mb-2">Explanation</h2>
            <ReactMarkdown>{explanation}</ReactMarkdown>
          </div>
        )}

        {codeFiles.length > 0 && (
          <div className="mt-6 bg-gray-100 p-4 rounded-lg">
            <h2 className="text-2xl font-medium mb-4">Generated Code</h2>
            {codeFiles.map((file, index) => (
              <details key={index} className="mb-4">
                <summary className="cursor-pointer font-semibold">
                  {file.filename}
                </summary>
                <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-auto">
                  <code className="language-hcl">{file.code}</code>
                </pre>
              </details>
            ))}

            <button
              onClick={downloadZip}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition duration-200 mt-4"
            >
              Download as ZIP
            </button>
          </div>
        )}
      </div>

      {/* Footer with Nebux credit and GitHub link */}
      <footer className="bg-black text-white text-center p-4 mt-auto">
        <p className="text-sm mb-2">Powered by</p>
        <a href="https://nebux.cloud" target="_blank" rel="noopener noreferrer">
          <img
            src="https://nebux.cloud/_next/static/media/imagotype.b5293ecd.svg"
            alt="Nebux Logo"
            className="w-40 mx-auto"
          />
        </a>
        <p className="mt-4">
          Check the code on{" "}
          <a
            href="https://github.com/NebuxCloud/infra-to-code"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-400"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
