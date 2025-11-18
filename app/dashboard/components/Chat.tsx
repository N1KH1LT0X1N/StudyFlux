'use client';

import "./Chat.css";
import { useState } from 'react';
import { ChatProps, ChatMessage } from '@/types';

function Chat({ file }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");

  async function handleSendMessage() {
    if (input.length) {
      let chatMessages: ChatMessage[] = [
        ...messages,
        { role: "user", text: input },
        { role: "loader", text: "" }
      ];
      setInput("");
      setMessages(chatMessages);

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: file,
            message: input,
            chatHistory: messages,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to get response');
        }

        chatMessages = [
          ...chatMessages.filter((msg) => msg.role !== 'loader'),
          { role: "model", text: data.response }
        ];
        setMessages(chatMessages);
      } catch (error) {
        chatMessages = [
          ...chatMessages.filter((msg) => msg.role !== 'loader'),
          { role: "error", text: "Error sending messages, please try again later." }
        ];
        setMessages(chatMessages);
        console.log('error:', error);
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
      {messages.length ? (
        <div className="chat">
          {messages.map((msg, index) => (
            <div className={msg.role} key={`${msg.text}-${index}`}>
              <p>{msg.text}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="input-area space-y-5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          type="text"
          className="mt-5 form-input w-full"
          placeholder="Ask any question about the uploaded document..."
        />
        <button
          className="mt-5 btn-sm bg-linear-to-t from-indigo-600 to-indigo-500 bg-[length:100%_100%] bg-[bottom] py-[5px] text-white shadow-[inset_0px_1px_0px_0px_--theme(--color-white/.16)] hover:bg-[length:100%_150%]"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </section>
  );
}

export default Chat;
