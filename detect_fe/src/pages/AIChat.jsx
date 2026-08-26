import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getToken } from '../utils/tokenHelper';
import {
  MdSmartToy, MdSend, MdDelete, MdContentCopy, MdCheck,
  MdAutoAwesome, MdRefresh
} from 'react-icons/md';
import toast from 'react-hot-toast';

const AIChat = () => {
  const { user } = useAuth();
  const storageKey = `sentinel_ai_chat_history_${user?.username || 'admin'}`;

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(`sentinel_ai_chat_history_${user?.username || 'admin'}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved AI chat history:', e);
    }
    return [
      {
        id: 'welcome_msg',
        sender: 'ai',
        text: `Hello ${user?.username || 'Admin'}! I am **Sentinel AI & TheftGuard Assistant**, powered by **OpenAI GPT-4o**.\n\nI can assist you with:\n- 🛡️ **Threat Analysis & Incident Response**\n- 🔍 **Audit Log Forensics & Fraud Detection**\n- ⚡ **Security Configuration & Code Auditing**\n\nHow can I help you protect your platform today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save AI chat history:', e);
    }
  }, [messages, storageKey]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    { title: '🛡️ Audit Brute-Force Logins', prompt: 'Analyze recent login attempts and summarize common brute-force attack vectors and mitigations.' },
    { title: '🚨 Emergency Response Plan', prompt: 'Draft a step-by-step emergency incident response plan for high-risk suspicious logins.' },
    { title: '🔍 Explain Risk Scoring', prompt: 'Explain how multi-factor biometric authentication and risk scoring prevent account takeover.' },
    { title: '⚡ WebAuthn FastAPI Security', prompt: 'How do I implement WebAuthn FIDO2 biometric authentication for user logins in Python FastAPI?' }
  ];

  const handleSendMessage = async (textToSend) => {
    const promptText = textToSend || inputMessage;
    if (!promptText || !promptText.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: promptText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const token = getToken() || localStorage.getItem('sentinel_token') || localStorage.getItem('access_token');
      
      const historyPayload = messages
        .filter(m => m.id !== 'welcome_msg')
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }));

      let aiResponseText = '';

      // 1. Try Backend Endpoint (/api/chat/ai)
      try {
        const res = await fetch('/api/chat/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            message: promptText.trim(),
            history: historyPayload
          })
        });

        if (res.ok) {
          const data = await res.json();
          aiResponseText = data.reply;
        }
      } catch (backendErr) {
        console.warn('Backend AI route unavailable, falling back to direct OpenAI completion:', backendErr);
      }

      // 2. Direct OpenAI API Fallback if backend route didn't return text
      if (!aiResponseText) {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY || "";
        const systemPrompt = "STRICT DOMAIN BOUNDARY & POLICY INSTRUCTION:\nYou are SentinelAI & TheftGuard Security Assistant. Your ONLY purpose and domain is System Security, Cyber Security, Threat Analysis, Vulnerability Management, Network Protection, Fraud Prevention, and TheftGuard Operations.\n\nSTRICT RULE:\nIf the user asks ANY question or topic outside of System & Cyber Security (such as animals, lions, sports, cooking, history, entertainment, general conversation, or general trivia), you MUST REJECT the question politely with the following exact message structure:\n\"🛡️ **Sentinel Security Policy Restriction**: I am a specialized AI Assistant restricted strictly to **System & Cyber Security**, Threat Analysis, and Platform Defense. I cannot provide information on non-security topics (such as animals, sports, general trivia, or off-topic subjects). Please ask a cybersecurity or system administration question.\"\n\nDo NOT answer off-topic questions under any circumstances.";
        
        const openAiMessages = [
          { role: 'system', content: systemPrompt },
          ...historyPayload,
          { role: 'user', content: promptText.trim() }
        ];

        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: openAiMessages,
            temperature: 0.3,
            max_tokens: 1200
          })
        });

        if (!openAiRes.ok) {
          const errorJson = await openAiRes.json().catch(() => ({}));
          throw new Error(errorJson.error?.message || `OpenAI API Error (${openAiRes.status})`);
        }

        const openAiData = await openAiRes.json();
        aiResponseText = openAiData.choices?.[0]?.message?.content || 'AI response received.';
      }

      const aiReplyMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiReplyMsg]);
    } catch (err) {
      console.error('AI Chat Error:', err);
      toast.error(err.message || 'Failed to get response from OpenAI.');
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `⚠️ **AI Service Error**: ${err.message || 'Could not connect to OpenAI API.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    const defaultMsg = [
      {
        id: 'welcome_msg',
        sender: 'ai',
        text: `Chat reset. Ready for your next query!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(defaultMsg);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.error('Failed to clear chat history from localStorage:', e);
    }
    toast.success('Conversation reset.');
  };

  // Simple clean markdown renderer (parses **bold**, - list items, line breaks)
  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, lineIdx) => {
      // Split bold formatting **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);

      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return (
            <strong key={pIdx} style={{ color: '#f4f4f5', fontWeight: 700 }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (line.trim().startsWith('- ')) {
        return (
          <div key={lineIdx} style={{ display: 'flex', gap: '8px', marginLeft: '6px', margin: '4px 0 4px 6px' }}>
            <span style={{ color: '#71717a' }}>•</span>
            <div style={{ flex: 1 }}>{formattedLine}</div>
          </div>
        );
      }

      return (
        <React.Fragment key={lineIdx}>
          {formattedLine}
          {lineIdx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 110px)',
        background: '#09090b',
        borderRadius: '16px',
        border: '1px solid #27272a',
        overflow: 'hidden',
        color: '#ececf1',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* ChatGPT Style Top Header */}
      <div
        style={{
          height: '52px',
          padding: '0 20px',
          background: '#18181b',
          borderBottom: '1px solid #27272a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#10a37f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '15px',
            }}
          >
            <MdAutoAwesome />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#f4f4f5' }}>
            ChatGPT Security Assistant
          </span>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '12px',
              background: '#27272a',
              color: '#a1a1aa',
              fontWeight: 500,
            }}
          >
            GPT-4o
          </span>
        </div>

        <button
          onClick={handleClearChat}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#a1a1aa',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#f4f4f5';
            e.currentTarget.style.background = '#27272a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#a1a1aa';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <MdDelete size={15} />
          Clear
        </button>
      </div>

      {/* Main Messages Stream */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: '12px',
              maxWidth: '850px',
              width: '100%',
              margin: '0 auto',
            }}
          >
            {msg.sender === 'ai' && (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#10a37f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '16px',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                <MdAutoAwesome />
              </div>
            )}

            <div
              style={{
                maxWidth: msg.sender === 'user' ? '70%' : '100%',
                background: msg.sender === 'user' ? '#27272a' : '#18181b',
                border: msg.sender === 'user' ? '1px solid #3f3f46' : '1px solid #27272a',
                borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '16px',
                padding: '14px 18px',
                color: '#d4d4d8',
                fontSize: '14px',
                lineHeight: '1.6',
                position: 'relative',
                wordBreak: 'break-word',
              }}
            >
              {renderMarkdown(msg.text)}

              {/* Timestamp & Copy button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '10px',
                  paddingTop: '6px',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  fontSize: '11px',
                  color: '#71717a',
                }}
              >
                <span>{msg.timestamp}</span>
                {msg.sender === 'ai' && (
                  <button
                    onClick={() => handleCopy(msg.text, msg.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: copiedId === msg.id ? '#10b981' : '#71717a',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#d4d4d8'}
                    onMouseLeave={(e) => e.currentTarget.style.color = copiedId === msg.id ? '#10b981' : '#71717a'}
                  >
                    {copiedId === msg.id ? <MdCheck size={14} /> : <MdContentCopy size={13} />}
                    {copiedId === msg.id ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Thinking Dots */}
        {loading && (
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              maxWidth: '850px',
              width: '100%',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#10a37f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '16px',
                flexShrink: 0,
              }}
            >
              <MdAutoAwesome className="spin" />
            </div>
            <div
              style={{
                padding: '12px 18px',
                borderRadius: '16px',
                background: '#18181b',
                border: '1px solid #27272a',
                color: '#a1a1aa',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>ChatGPT is generating response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length <= 2 && (
        <div style={{ maxWidth: '850px', width: '100%', margin: '0 auto', padding: '0 20px 10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {quickPrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(item.prompt)}
              disabled={loading}
              style={{
                background: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '16px',
                padding: '6px 12px',
                color: '#a1a1aa',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#f4f4f5';
                e.currentTarget.style.borderColor = '#3f3f46';
                e.currentTarget.style.background = '#27272a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#a1a1aa';
                e.currentTarget.style.borderColor = '#27272a';
                e.currentTarget.style.background = '#18181b';
              }}
            >
              {item.title}
            </button>
          ))}
        </div>
      )}

      {/* ChatGPT Style Rounded Input Bar */}
      <div style={{ padding: '12px 20px 20px', background: '#09090b' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{
            maxWidth: '850px',
            margin: '0 auto',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Message ChatGPT Security Assistant..."
            style={{
              width: '100%',
              height: '52px',
              borderRadius: '26px',
              background: '#27272a',
              border: '1px solid #3f3f46',
              padding: '0 52px 0 20px',
              color: '#f4f4f5',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border 0.15s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#71717a'}
            onBlur={(e) => e.target.style.borderColor = '#3f3f46'}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            style={{
              position: 'absolute',
              right: '8px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: loading || !inputMessage.trim() ? '#3f3f46' : '#fafafa',
              border: 'none',
              color: loading || !inputMessage.trim() ? '#71717a' : '#09090b',
              cursor: loading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            <MdSend size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
