import "./Chat.css"
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState } from 'react'

function Chat({file}) {
    const genAI = new GoogleGenerativeAI("AIzaSyB2zpo_UOfw8STpVhHgIdP45f60afIMr28");
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-pro' });
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    async function handleSendMessage(){
        if(input.length) {
            let chatMessages = [...messages, {role: "user", text: input}, {role: "loader", text: ""}];
            setInput("");
            setMessages(chatMessages);

            try {
                const result = await model.generateContent([
                  {
                      inlineData: {
                          data: file.file,
                          mimeType: file.type,
                      },
                  },
                  `
                    Answer this question about the attached document: ${input}.
                    Answer as a chatbot with short messages and text only (no markdowns, tags or symbols)
                    #you are a teacher assistent whose job is to provide a summary to the user and always be engaging with him
                    #you have the multiliguel ability to talk in all of the three language listed hindi english and marathi but your respone should match the format of user
                    eg: if a user writes marathi in english reply in marathi but using english alphabets and if he uses marathi character to have a communication with you use marathi character only
                    #when a user ask you questions explain then topics cleary with followup question and same and relevent topics(keep it string no markdown or json)(less than 200 words)
                    #explain r reply what the user has asked for and then below list the questions in point rather than a conversation flow paragraph

                    Chat history: ${JSON.stringify(messages)}
                  `,
                ]);

                chatMessages = [...chatMessages.filter((msg)=>msg.role != 'loader'), {role: "model", text: result.response.text()}]
                setMessages(chatMessages);
              } catch (error) {
                chatMessages = [...chatMessages.filter((msg)=>msg.role != 'loader'), {role: "error", text: "Error sending messages, please try again later."}]
                setMessages(chatMessages);
                console.log('error');
              }
        }
    }

    return (
      <section className="chat-window mx-auto max-w-3xl pb-12 text-center md:pb-20">
      <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-indigo-200/50">
          <span className="inline-flex bg-linear-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent">
            Chat
          </span>
      </div>
      {
            messages.length ?
            <div className="chat">
                {
                    messages.map((msg)=>(
                        <div className={msg.role} key={msg.text}>
                            <p>{msg.text}</p>
                        </div>
                    ))
                }
            </div> :
            ''
        }

        <div className="input-area space-y-5">
        		<input
                value={input}
                onChange={(e)=>setInput(e.target.value)}
                type="text"
                className="mt-5 form-input w-full"
                placeholder="Ask any question about the uploaded document..."
            />
            <button className="mt-5 btn-sm bg-linear-to-t from-indigo-600 to-indigo-500 bg-[length:100%_100%] bg-[bottom] py-[5px] text-white shadow-[inset_0px_1px_0px_0px_--theme(--color-white/.16)] hover:bg-[length:100%_150%]" onClick={handleSendMessage}>Send</button>

        </div>
      </section>
    )
  }

  export default Chat
