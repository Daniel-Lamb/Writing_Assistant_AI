import React, { ChangeEvent, useEffect, useState } from "react";

const BlogEditor = () => {
    const [text, setText] = useState("");
    const [link, setLink] = useState("");
    const [loading, setLoading] = useState(false);


    const API_KEY = "gWA8SLPYQiNUHH3SWaM46pIBHoamzKhm";

    const handleChangeText = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    const handleChangeLink = (e: ChangeEvent<HTMLInputElement>) => {
        setLink(e.target.value);
    };



    const handleImproveText = () => {
      setLoading(true)
      fetch("https://api.ai21.com/studio/v1/improvements", {
          headers: {
              "Authorization": `Bearer ${API_KEY}`,
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
              "text": text,
              "types": ['fluency', 'vocabulary/specificity', 'vocabulary/variety', 'clarity/short-sentences', 'clarity/conciseness']
          }),
          method: "POST"
      }).then((response) => response.json())
          .then((data) => {
              console.log('Success:', data);
              setLoading(false)
              let imp = data.improvements
              imp.sort((a: any, b: any) => b.startIndex - a.startIndex);

              let iText = text;
              imp.forEach((curr_improvement: any) => {
                  const firstSuggestion = curr_improvement.suggestions[0];
                  iText =
                      iText.slice(0, curr_improvement.startIndex) +
                      firstSuggestion +
                      iText.slice(curr_improvement.endIndex);
              });

              setText(iText)
          })
          .catch((error) => {
              setLoading(false)
              console.error('Error:', error);
          });
  };


    const handleGenerateCompletion = () => {
        setLoading(true)
        fetch("https://api.ai21.com/studio/v1/j2-ultra/complete", {
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "prompt": text,
                "numResults": 1,
                "maxTokens": 200,
                "temperature": 0.7,
                "topKReturn": 0,
                "topP": 1,
                "countPenalty": {
                    "scale": 0,
                    "applyToNumbers": false,
                    "applyToPunctuations": false,
                    "applyToStopwords": false,
                    "applyToWhitespaces": false,
                    "applyToEmojis": false
                },
                "frequencyPenalty": {
                    "scale": 0,
                    "applyToNumbers": false,
                    "applyToPunctuations": false,
                    "applyToStopwords": false,
                    "applyToWhitespaces": false,
                    "applyToEmojis": false
                },
                "presencePenalty": {
                    "scale": 0,
                    "applyToNumbers": false,
                    "applyToPunctuations": false,
                    "applyToStopwords": false,
                    "applyToWhitespaces": false,
                    "applyToEmojis": false
                },
                "stopSequences": []
            }),
            method: "POST"
        }).then((response) => response.json())
            .then((data) => {
                console.log('Success:', data);
                setLoading(false)
                setText(text + data.completions[0].data.text)
            })
            .catch((error) => {
                setLoading(false)
                console.error('Error:', error);
            });
    };


    const handleFixGrammar = () => {
      setLoading(true)
      fetch("https://api.ai21.com/studio/v1/gec", {
          headers: {
              "Authorization": `Bearer ${API_KEY}`,
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
              "text": text,
          }),
          method: "POST"
      }).then((response) => response.json())
          .then((data) => {
              console.log('Success:', data);
              setLoading(false)
              let corr = data.corrections
              let cText = text;
              corr.forEach((curr_correction: any) => {
                  cText =
                      cText.slice(0, curr_correction.startIndex) +
                      curr_correction.suggestion +
                      cText.slice(curr_correction.endIndex);
              });

              setText(cText)
          })
          .catch((error) => {
              setLoading(false)
              console.error('Error:', error);
          });
    };


    
    const handleSummarizeLink = async () => {
        setLoading(true);
      
        try {
          const response = await fetch("https://api.ai21.com/studio/v1/summarize", {
            headers: {
              "Authorization": `Bearer ${API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              "source": link,
              "sourceType": "URL",
            }),
            method: "POST"
          });
      
          if (response.ok) {
            const data = await response.json();
            console.log('Success:', data);
            setText(data.summary);
          } else {
            throw new Error('Network response was not ok');
          }
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setLoading(false);
        }
    };

    return (
        <div className="flex flex-col">
          <p className="text-lg mt-6 self-center font-bold">Writing Assistant (made with AI21)</p>
      
          <div className="blog-editor p-8 bg-green-200 rounded shadow-lg">
            <div className="link-section flex items-center space-x-2">
              <button
                className="px-3 py-1.5 bg-purple-400 text-white rounded focus:outline-none focus:ring focus:ring-blue-300"
                onClick={handleSummarizeLink}
              >
                Summarize Link
              </button>
              <input
                type="text"
                className="link-input flex-grow p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                value={link}
                onChange={handleChangeLink}
                placeholder="Insert https:// link here"
              />
            </div>
      
            <div className="mt-4">
              <textarea
                className={`blog-text-input w-full h-64 p-4 border border-blue-100 rounded resize-none focus:outline-none focus:ring focus:border-blue-200 ${loading ? 'opacity-50' : ''}`}
                value={text}
                onChange={handleChangeText}
                placeholder="Text here"
                disabled={loading}
              />
            </div>
      
            {/* Loading indicator */}
            {loading && (
              <div className="w-full h-64 flex items-center justify-center">
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-purple-400 h-12 w-12"></div>
              </div>
            )}
      
            <div className="actions space-x-2 mb-4">
              <button
                className="px-3 py-1.5 bg-purple-400 text-white rounded focus:outline-none focus:ring focus:ring-blue-300"
                onClick={handleGenerateCompletion}
              >
                Expand On Prompt
              </button>
              <button
                className="px-3 py-1.5 bg-purple-400 text-white rounded focus:outline-none focus:ring focus:ring-blue-300"
                onClick={handleFixGrammar}
              >
                Grammar Check
              </button>
              <button
                className="px-3 py-1.5 bg-purple-400 text-white rounded focus:outline-none focus:ring focus:ring-blue-300"
                onClick={handleImproveText}
              >
                Improve Writing
              </button>
            </div>
          </div>
        </div>
      );
};

export default BlogEditor;
