import { useState, useEffect } from 'react';
import { Send, Phone, Video } from 'lucide-react';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Simulate loading messages
    setMessages([
      { id: 1, from: 'seller', text: 'I have a property I want to sell.', time: '2 min ago' },
      { id: 2, from: 'nia', text: 'Great! What is the address?', time: '1 min ago' },
    ]);
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), from: 'nia', text: input, time: 'Just now' }]);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-2xl font-bold">Chat</h2>
          <p className="text-sm text-gray-400">Seller conversations</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg bg-card border border-border hover:bg-border/50">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg bg-card border border-border hover:bg-border/50">
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 py-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.from === 'nia' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-xl p-3 ${
                msg.from === 'nia'
                  ? 'bg-primary text-white'
                  : 'bg-card border border-border text-gray-300'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs opacity-70 mt-1">{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 pt-4 border-t border-border">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-card border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
        />
        <button
          type="submit"
          className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </form>
    </div>
  );
}
