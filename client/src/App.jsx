import { useState } from "react";

function App() {
  const maxLength = 12000;
  const [text, setText] = useState("");
  const [sentiment, setSentiment] = useState(null);
  const [summary, setSummary] = useState(null);
  const [resultsReady, setResultsReady] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/analyse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript: text }),
      });

      const data = await response.json();
      setSentiment(data.sentiment);
      setSummary(data.summary);
      setResultsReady(true);
    } catch (error) {
      console.error("Error posting transcript:", error);
    }
  };


  const handleDownload = () => {
    window.open("http://localhost:5000/download", "_blank");
  };

  return (
    <div className="flex items-center justify-center h-screen gap-10 bg-slate-200">

      <form onSubmit={handleSubmit} method="post" className="h-[90%]">
        <div className="flex flex-col h-full">
          <textarea
            className="p-10 py-8 h-full w-[40rem] overflow-y-scroll resize-none shadow-md outline-none rounded-md"
            maxLength={maxLength}
            placeholder="Enter Transcript here...."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className="text-sm text-gray-500 mt-2 text-right">
            {maxLength - text.length} characters left
          </p>
          <div className="flex gap-2 mt-2">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded outline-none"
              type="submit"
            >
              Submit
            </button>

            {resultsReady && (
              <button
                type="button"
                onClick={handleDownload}
                className="bg-green-500 text-white px-4 py-2 rounded outline-none"
              >
                Download Results
              </button>
            )}
          </div>
        </div>
      </form>


      <div className="w-[40rem] h-[90%] bg-white shadow-md rounded-md p-6 overflow-y-scroll">
        {summary || sentiment ? (
          <>
            <h2 className="text-xl font-bold mb-4">Analysis Result</h2>
            {summary && (
              <div className="mb-4">
                <h3 className="font-semibold">Summary:</h3>
                <p className="text-gray-700">{summary}</p>
              </div>
            )}
            {sentiment && (
              <div>
                <h3 className="font-semibold">Sentiment:</h3>
                <p
                  className={`${sentiment.toLowerCase() === "positive"
                    ? "text-green-600"
                    : sentiment.toLowerCase() === "negative"
                      ? "text-red-600"
                      : "text-gray-600"
                    }`}
                >
                  {sentiment}
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-400">No analysis yet. Submit a transcript.</p>
        )}
      </div>
    </div>
  );
}

export default App;
