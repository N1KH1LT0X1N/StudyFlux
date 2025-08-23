import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState, useEffect } from "react";
import Loader from './Loader'

function Summary({file}) {

  const genAI = new GoogleGenerativeAI("AIzaSyB2zpo_UOfw8STpVhHgIdP45f60afIMr28");
  const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-pro' });
  const [summary,setSummary] = useState("");
  const [status, setStatus] = useState("idle");

  async function getSummary(){
    setStatus('loading');

    try {
      const result = await model.generateContent([
        {
            inlineData: {
                data: file.file,
                mimeType: file.type,
            },
        },
        `
          Summarize the document
          in one short paragraph (less than 100 words).
          Use just plain text with no markdowns or html tags
        `,
      ]);
      setStatus('success');
      setSummary(result.response.text());
    } catch (error) {
      setStatus('error');
    }
  }

  useEffect(()=>{
    if(status === 'idle'){
      getSummary();
    }
  },[status]);


    return (
      <section className="summary mx-auto max-w-3xl pb-12 text-center md:pb-20">

        <img src={file.imageUrl} alt="" />

        <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-indigo-200/50">
            <span className="inline-flex bg-linear-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent">
              Summary
            </span>
        </div>
        {
          status === 'loading' ?
          <Loader /> :
          status === 'success' ?
          <p className="text-lg text-indigo-200/65">{summary}</p> :
          status === 'error' ?
          <p className="text-lg text-indigo-200/65">Error getting the summary</p> :
          ''
        }
      </section>
    )
  }

  export default Summary
