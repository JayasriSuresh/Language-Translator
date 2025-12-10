from flask import Flask, request, jsonify
import os
import fitz
import pytesseract
from PIL import Image
import docx
from deep_translator import GoogleTranslator
from indic_transliteration.sanscript import transliterate, DEVANAGARI, TAMIL
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
# ----------- HELPERS --------------

def read_txt(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def read_docx(path):
    doc = docx.Document(path)
    return "\n".join(p.text for p in doc.paragraphs)

def read_pdf(path):
    text = ""
    pdf = fitz.open(path)
    for page in pdf:
        text += page.get_text()
    return text

def read_image(path):
    img = Image.open(path)
    return pytesseract.image_to_string(img)

# ----------- API ROUTES ------------

@app.post("/translate")
def translate():
    data = request.json
    text = data.get("text", "")
    engine = data.get("engine", "deep_translator")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        if engine == "deep_translator":
            translated = GoogleTranslator(source="en", target="ta").translate(text)

        elif engine == "tamil_script_convert":
            dev = transliterate(text, "iast", DEVANAGARI)
            translated = transliterate(dev, DEVANAGARI, TAMIL)

        else:
            return jsonify({"error": "Invalid engine"}), 400

        return jsonify({"translated_text": translated})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.post("/upload-file")
def upload_file():
    file = request.files["file"]
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    ext = file.filename.lower().split(".")[-1]
    temp_path = f"temp.{ext}"
    file.save(temp_path)

    try:
        if ext == "txt":
            text = read_txt(temp_path)
        elif ext == "docx":
            text = read_docx(temp_path)
        elif ext == "pdf":
            text = read_pdf(temp_path)
        elif ext in ["png", "jpg", "jpeg"]:
            text = read_image(temp_path)
        else:
            return jsonify({"error": "Unsupported file type"}), 400

        os.remove(temp_path)
        return jsonify({"text": text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)