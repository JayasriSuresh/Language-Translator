import { useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  const [text, setText] = useState("");
  const [engine, setEngine] = useState("deep_translator");
  const [output, setOutput] = useState("");

  const translateText = async () => {
  try {
    const res = await axios.post("http://127.0.0.1:5000/translate", { text, engine });
    setOutput(res.data.translated_text);
  } catch (err) {
    console.error("Translate error:", err);
    alert("Translate Error: " + err.message);
  }
};

const uploadFile = async (e) => {
  try {
    const file = e.target.files[0];
    let formData = new FormData();
    formData.append("file", file);

    const res = await axios.post("http://127.0.0.1:5000/upload-file", formData);
    setText(res.data.text);
  } catch (err) {
    console.error("Upload error:", err);
    alert("Upload Error: " + err.message);
  }
};


  return (
  <div className="d-flex justify-content-center align-items-center vh-100 w-100 bg-light">

    <div className="card p-4 shadow" style={{ width: "600px", maxWidth: "90%" }}>
      <h3 className="text-center mb-4">English → Tamil Translator</h3>

      {/* Engine Selector */}
      <div className="mb-3">
        <label className="form-label fw-bold">Translation Engine</label>
        <select
          className="form-select"
          value={engine}
          onChange={(e) => setEngine(e.target.value)}
        >
          <option value="deep_translator">Deep Translator</option>
          <option value="tamil_script_convert">Tamil Script Convert</option>
        </select>
      </div>

      {/* Text Input */}
      <div className="mb-3">
        <label className="form-label fw-bold">Input Text</label>
        <textarea
          className="form-control"
          rows="5"
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
      </div>

      {/* File Upload */}
      <div className="mb-3">
        <label className="form-label fw-bold">Upload File</label>
        <input
          type="file"
          className="form-control"
          onChange={uploadFile}
        />
      </div>

      {/* Button */}
      <div className="text-center">
        <button className="btn btn-primary px-4" onClick={translateText}>
          Translate
        </button>
      </div>

      {/* Output */}
      <div className="mt-4">
        <label className="form-label fw-bold">Translated Output</label>
        <textarea
          className="form-control bg-light"
          rows="5"
          value={output}
          readOnly
        ></textarea>
      </div>
    </div>

  </div>
);
}

export default App;