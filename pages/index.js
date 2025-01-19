import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      const fileName = file.name;

      try {
        const response = await axios.post("/api/upload", {
          file: base64,
          fileName,
        });
        setMessage(`File uploaded successfully: ${response.data.filePath}`);
      } catch (error) {
        setMessage("File upload failed!");
        console.error(error);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Next.js File Upload</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && (
        <div style={{ margin: "20px 0" }}>
          <h4>Preview:</h4>
          <img src={preview} alt="Preview" style={{ width: "200px", height: "auto" }} />
        </div>
      )}
      <button onClick={handleUpload} style={{ marginTop: "10px" }}>
        Upload
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
