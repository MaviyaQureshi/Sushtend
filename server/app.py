from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from groq import Groq
import json
import os
from dotenv import load_dotenv
import csv

load_dotenv()

app = Flask(__name__)
CORS(app)
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

csv_file = "call_analysis.csv"


@app.route("/analyse", methods=["POST"])
def check():

    data = request.get_json()
    transcript = data.get("transcript", "")
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that summarizes customer support calls and analyzes customer sentiment.",
            },
            {
                "role": "user",
                "content": f"Transcript:\n{transcript}\n\nPlease provide:\n1. A short summary of the call\n2. The customer's sentiment (Positive, Negative, Neutral) without any explanation",
            },
        ],
    )

    result = response.choices[0].message.content
    lines = [line.strip() for line in result.split("\n") if line.strip()]
    summary = lines[0].replace("1. ", "")
    sentiment = lines[1].replace("2. ", "")

    file_exists = os.path.isfile(csv_file)

    with open(csv_file, mode="a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)

        if not file_exists:
            writer.writerow(["Transcript", "Summary", "Sentiment"])

        writer.writerow([transcript, summary, sentiment])

    return jsonify({"summary": summary, "sentiment": sentiment})


@app.route("/download", methods=["GET"])
def download():
    return send_file(csv_file, as_attachment=True)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
