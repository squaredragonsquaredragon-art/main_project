import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, Send, X, Bot, User, Sparkles, AlertCircle,
  RefreshCw, Check, CheckCheck, Edit2, Trash2, CheckSquare
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

/**
 * SupportChatWidget
 * Floating Sci-Fi Chatbot Widget for super-app-frontend.
 * Supports real-time messaging, read receipts, message editing & deletion.
 */
const SupportChatWidget = () => {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Editing state
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages from backend
  const fetchMessages = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('sentinel_access_token');
      if (!token) return;

      const res = await fetch('/api/chat/user/messages/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to fetch chat messages:', err);
    }
  }, [user]);

  // Initial load & real-time polling every 3s when chat drawer is open
  useEffect(() => {
    if (!isOpen || !user) return;
    setLoading(true);
    fetchMessages().finally(() => setLoading(false));

    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [isOpen, user, fetchMessages]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Send message
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || sending || !user) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const token = localStorage.getItem('sentinel_access_token');
      const res = await fetch('/api/chat/user/send/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: textToSend }),
      });

      if (res.ok) {
        fetchMessages();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  // Edit Message
  const handleSaveEdit = async (msgId) => {
    if (!editingText.trim()) return;
    try {
      const token = localStorage.getItem('sentinel_access_token');
      const res = await fetch(`/api/chat/messages/${msgId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: editingText.trim() }),
      });

      if (res.ok) {
        setEditingMsgId(null);
        setEditingText('');
        fetchMessages();
      }
    } catch (err) {
      console.error('Failed to edit message:', err);
    }
  };

  // Delete Message
  const handleDelete = async (msgId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      const token = localStorage.getItem('sentinel_access_token');
      const res = await fetch(`/api/chat/messages/${msgId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchMessages();
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const handleChipClick = (suggestion) => {
    setInputText(suggestion);
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Chat Launcher Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0284c7 0%, #7e22ce 100%)',
          border: '2px solid rgba(56, 189, 248, 0.4)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 30px rgba(2, 132, 199, 0.45), 0 0 20px rgba(126, 34, 206, 0.35)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: isOpen ? 'scale(0.95)' : 'scale(1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isOpen ? 'scale(0.95)' : 'scale(1)';
        }}
        title="Live Admin Support Chatbot"
      >
        {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
      </button>

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '94px',
            right: '24px',
            zIndex: 9999,
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '530px',
            maxHeight: 'calc(100vh - 120px)',
            background: 'linear-gradient(145deg, rgba(15,23,42,0.98), rgba(8,12,24,0.99))',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '24px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 30px rgba(56,189,248,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 0.25s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.9))',
              borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(168,85,247,0.2))',
                  border: '1px solid rgba(56,189,248,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                }}
              >
                <Bot size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
                  Live Admin Support
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: '#10b981',
                      boxShadow: '0 0 8px #10b981',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                    Connected to Admin Portal
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'rgba(5,10,20,0.4)',
            }}
          >
            {/* Welcome banner */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '14px',
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                color: '#cbd5e1',
                fontSize: '12px',
                lineHeight: 1.5,
              }}
            >
              👋 Hi <strong style={{ color: '#38bdf8' }}>{user.username}</strong>! Having an issue with your account, login, or security alert? Share your message below — our Admin team will respond right away!
            </div>

            {loading && messages.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                <RefreshCw size={20} className="spin" style={{ margin: '0 auto 8px' }} />
                <span style={{ fontSize: '12px' }}>Loading support messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', margin: 'auto 0', color: '#64748b', fontSize: '12px' }}>
                No messages yet. Send your first inquiry!
              </div>
            ) : (
              messages.map((m) => {
                const isUser = m.sender_type === 'user';
                const isEditingThis = editingMsgId === m.id;

                return (
                  <div
                    key={m.id}
                    className="message-group"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isUser ? 'flex-end' : 'flex-start',
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#64748b',
                        marginBottom: '3px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {isUser ? 'You' : m.sender_name} •{' '}
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {m.is_edited && !m.is_deleted && <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>(edited)</span>}
                      {isUser && !m.is_deleted && (
                        m.is_read ? (
                          <CheckCheck size={13} style={{ color: '#38bdf8' }} title="Read by Admin" />
                        ) : (
                          <Check size={13} style={{ color: '#94a3b8' }} title="Delivered to Admin" />
                        )
                      )}
                    </span>

                    {/* Inline Editing Mode */}
                    {isEditingThis ? (
                      <div style={{ width: '85%', display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '6px 10px',
                            borderRadius: '8px',
                            background: '#1e293b',
                            border: '1px solid #38bdf8',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                        />
                        <button
                          onClick={() => handleSaveEdit(m.id)}
                          style={{ background: '#0284c7', border: 'none', color: '#fff', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '11px' }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingMsgId(null)}
                          style={{ background: '#334155', border: 'none', color: '#cbd5e1', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          maxWidth: '85%',
                          position: 'relative',
                          padding: '10px 14px',
                          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: m.is_deleted
                            ? 'rgba(30, 41, 59, 0.5)'
                            : isUser
                            ? 'linear-gradient(135deg, #0284c7, #2563eb)'
                            : 'rgba(30, 41, 59, 0.9)',
                          border: isUser ? 'none' : '1px solid rgba(168, 85, 247, 0.3)',
                          color: m.is_deleted ? '#94a3b8' : '#ffffff',
                          fontStyle: m.is_deleted ? 'italic' : 'normal',
                          fontSize: '13px',
                          lineHeight: 1.45,
                          boxShadow: isUser ? '0 4px 12px rgba(2, 132, 199, 0.25)' : '0 4px 12px rgba(0,0,0,0.3)',
                        }}
                      >
                        {m.message}

                        {/* Edit / Delete actions for user's own non-deleted message */}
                        {isUser && !m.is_deleted && (
                          <div
                            style={{
                              display: 'inline-flex',
                              gap: '6px',
                              marginLeft: '8px',
                              verticalAlign: 'middle',
                            }}
                          >
                            <button
                              onClick={() => {
                                setEditingMsgId(m.id);
                                setEditingText(m.message);
                              }}
                              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 0 }}
                              title="Edit message"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(m.id)}
                              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 0 }}
                              title="Delete message"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div
            style={{
              padding: '8px 12px',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(15,23,42,0.6)',
            }}
          >
            {['Login alert issue', 'Fingerprint help', 'Account access'].map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'rgba(56,189,248,0.1)',
                  border: '1px solid rgba(56,189,248,0.2)',
                  color: '#38bdf8',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            style={{
              padding: '12px 14px',
              borderTop: '1px solid rgba(56, 189, 248, 0.15)',
              background: 'rgba(15,23,42,0.95)',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your issue or query..."
              style={{
                flex: 1,
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(30,41,59,0.7)',
                border: '1px solid rgba(56,189,248,0.2)',
                padding: '0 12px',
                color: '#f8fafc',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: sending || !inputText.trim()
                  ? 'rgba(56,189,248,0.2)'
                  : 'linear-gradient(135deg, #0284c7, #7e22ce)',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: sending || !inputText.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default SupportChatWidget;
