import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessageStore } from '../../store/messageStore';
import Loader from '../../components/common/Loader';
import { Phone, Video, Send, Plus, Search, User } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

const LiveChats = () => {
  const { chats, contacts, activeChatId, messages, fetchChats, selectChat, sendMessage, loading } = useMessageStore();
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const msgEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    // Scroll chats to bottom
    if (msgEndRef.current) {
      msgEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  const filteredChats = chats.filter(c =>
    c.user.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && chats.length === 0) {
    return <Loader message="Accessing active security chat nodes..." size="large" />;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px', height: 'calc(100vh - 160px)' }}>
      {/* Left side: Chats List */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          gap: '16px',
          height: '100%',
          overflow: 'hidden'
        }}
      >
        {/* Search Header */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="glass-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search channels..."
            style={{ paddingLeft: '40px', fontSize: '13px' }}
          />
          <Search size={14} color="hsl(var(--text-muted))" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* Chats timelines */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filteredChats.map(chat => (
            <div
              key={chat.id}
              onClick={() => selectChat(chat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                borderRadius: 'var(--border-radius-sm)',
                cursor: 'pointer',
                background: activeChatId === chat.id ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                borderLeft: activeChatId === chat.id ? '3px solid hsl(var(--accent-cyan))' : '3px solid transparent',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {/* User Avatar */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    position: 'relative'
                  }}
                >
                  {chat.user.avatar}
                  {chat.user.status === 'online' && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'hsl(var(--accent-green))',
                        boxShadow: '0 0 8px hsl(var(--accent-green))'
                      }}
                    />
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>{chat.user.name}</span>
                  <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {chat.lastMessage}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: 'hsl(var(--text-muted))' }}>{formatRelativeTime(chat.timestamp)}</span>
                {chat.unreadCount > 0 && (
                  <span
                    style={{
                      background: 'hsl(var(--accent-cyan))',
                      color: '#000',
                      borderRadius: '50%',
                      padding: '2px 6px',
                      fontSize: '9px',
                      fontWeight: 700
                    }}
                  >
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Chat Conversation window */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          height: '100%',
          border: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        {activeChat ? (
          <>
            {/* Chat header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ fontSize: '20px' }}>{activeChat.user.avatar}</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>{activeChat.user.name}</span>
                  <span style={{ fontSize: '11px', color: 'hsl(var(--accent-green))', textTransform: 'capitalize' }}>
                    {activeChat.user.status}
                  </span>
                </div>
              </div>

              {/* Call triggers */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => navigate('/messaging/voice-call')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-secondary))', padding: '6px' }}
                >
                  <Phone size={16} />
                </button>
                <button
                  onClick={() => navigate('/messaging/video-call')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-secondary))', padding: '6px' }}
                >
                  <Video size={16} />
                </button>
              </div>
            </div>

            {/* Messages box */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {messages.map((msg, mIdx) => {
                const isMe = msg.senderId === 'me';
                return (
                  <div
                    key={msg.id || mIdx}
                    style={{
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0',
                        background: isMe ? 'linear-gradient(135deg, hsl(var(--accent-cyan)), hsl(var(--accent-blue)))' : 'rgba(255, 255, 255, 0.03)',
                        border: isMe ? 'none' : '1px solid rgba(255,255,255,0.06)',
                        color: isMe ? '#000' : 'hsl(var(--text-primary))',
                        fontSize: '13px',
                        lineHeight: 1.5,
                        boxShadow: isMe ? 'var(--neon-glow-cyan)' : 'none',
                      }}
                    >
                      {msg.text}
                    </div>
                    <span style={{ fontSize: '9px', color: 'hsl(var(--text-muted))', alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
                      {formatRelativeTime(msg.timestamp)}
                    </span>
                  </div>
                );
              })}
              <div ref={msgEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <input
                type="text"
                className="glass-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message..."
                style={{ fontSize: '13px', height: '42px' }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '42px', height: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--text-muted))', padding: '40px' }}>
            <User size={36} style={{ marginBottom: '8px', opacity: 0.3 }} />
            <span>Select a conversation thread to initiate secure communications.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveChats;
