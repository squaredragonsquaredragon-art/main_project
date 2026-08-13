import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MdSend, MdSearch, MdRefresh, MdEdit, MdDelete, MdInfo,
  MdClose, MdShield, MdLaptop, MdHistory, MdWarning, MdCheckCircle,
  MdMoreVert, MdPhone, MdEmail, MdPerson, MdCheck, MdDoneAll
} from 'react-icons/md';
import { getToken } from '../utils/tokenHelper';

/**
 * SupportChat — WhatsApp Web Pattern Live Support Console
 * ─────────────────────────────────────────────────────────────────────────────
 * Features:
 *   1. Left Sidebar: WhatsApp-style User Conversations list with avatars, unread pills, timestamps
 *   2. Middle Window: Real-time WhatsApp style chat stream with green/blue bubbles, edit & delete
 *   3. Right Drawer: WhatsApp Contact Info Drawer (User Profile & Security Activity Inspector)
 */
const SupportChat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // ConversationSummary object
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // WhatsApp Contact Info Right Drawer toggle & data
  const [showContactDrawer, setShowContactDrawer] = useState(true);
  const [userProfileData, setUserProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Editing state
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const messagesEndRef = useRef(null);

  const getAuthToken = () => getToken() || localStorage.getItem('sentinel_token') || localStorage.getItem('access_token');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch all user conversation threads
  const fetchConversations = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/chat/admin/conversations/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        if (!selectedUser && data.length > 0) {
          setSelectedUser(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch support conversations:', err);
    } finally {
      setLoadingConvos(false);
    }
  }, [selectedUser]);

  // Fetch messages for selected user
  const fetchUserMessages = useCallback(async () => {
    const token = getAuthToken();
    if (!selectedUser || !token) return;
    try {
      const res = await fetch(`/api/chat/admin/messages/${selectedUser.user_id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to fetch user chat messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [selectedUser]);

  // Fetch User Profile & Security Activities
  const fetchUserProfile = useCallback(async (user_id) => {
    const token = getAuthToken();
    if (!token || !user_id) return;
    setLoadingProfile(true);

    try {
      const res = await fetch(`/api/chat/admin/user-details/${user_id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserProfileData(data);
      }
    } catch (err) {
      console.error('Failed to fetch user profile details:', err);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  // Polling conversations every 4s & messages every 3s
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 4000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedUser) {
      setLoadingMessages(true);
      fetchUserMessages();
      fetchUserProfile(selectedUser.user_id);
      const interval = setInterval(fetchUserMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUser, fetchUserMessages, fetchUserProfile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Admin sends reply
  const handleAdminSend = async (e) => {
    e?.preventDefault();
    const token = getAuthToken();
    if (!replyText.trim() || !selectedUser || sending || !token) return;

    const textToSend = replyText.trim();
    setReplyText('');
    setSending(true);

    try {
      const res = await fetch('/api/chat/admin/send/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: selectedUser.user_id,
          message: textToSend,
        }),
      });

      if (res.ok) {
        fetchUserMessages();
        fetchConversations();
      }
    } catch (err) {
      console.error('Failed to send admin reply:', err);
    } finally {
      setSending(false);
    }
  };

  // Edit Message
  const handleSaveEdit = async (msgId) => {
    if (!editingText.trim()) return;
    const token = getAuthToken();
    try {
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
        fetchUserMessages();
      }
    } catch (err) {
      console.error('Failed to edit message:', err);
    }
  };

  // Delete Message
  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('Delete this message?')) return;
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/chat/messages/${msgId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchUserMessages();
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 100px)',
        gap: '12px',
        background: '#0b141a',
        borderRadius: '16px',
        overflow: 'hidden',
        padding: '12px',
      }}
    >
      {/* ─── MAIN WHATSAPP WEB CONTAINER ─── */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: showContactDrawer ? '360px 1fr 320px' : '360px 1fr',
          background: '#111b21',
          border: '1px solid #222d34',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        }}
      >
        {/* ─── 1. LEFT SIDEBAR (CONVERSATIONS LIST) ─── */}
        <div
          style={{
            borderRight: '1px solid #222d34',
            display: 'flex',
            flexDirection: 'column',
            background: '#111b21',
          }}
        >
          {/* Left Header */}
          <div
            style={{
              height: '60px',
              padding: '0 16px',
              background: '#202c33',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #222d34',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00a884, #0284c7)',
                  color: '#fff',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                }}
              >
                AD
              </div>
              <span style={{ fontWeight: 700, color: '#e9edef', fontSize: '0.95rem' }}>
                Admin Support Desk
              </span>
            </div>

            <button
              onClick={() => {
                fetchConversations();
                if (selectedUser) fetchUserMessages();
              }}
              style={{ background: 'none', border: 'none', color: '#aebac1', cursor: 'pointer' }}
              title="Refresh conversations"
            >
              <MdRefresh size={20} />
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ padding: '8px 12px', background: '#111b21', borderBottom: '1px solid #222d34' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: '#202c33',
                borderRadius: '8px',
                padding: '0 12px',
                height: '36px',
              }}
            >
              <MdSearch size={18} color="#aebac1" />
              <input
                type="text"
                placeholder="Search user or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e9edef',
                  fontSize: '0.85rem',
                  outline: 'none',
                  width: '100%',
                }}
              />
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingConvos && conversations.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#8696a0', fontSize: '0.85rem' }}>
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#8696a0', fontSize: '0.85rem' }}>
                No support conversations found.
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = selectedUser?.user_id === c.user_id;
                const initials = c.username.substring(0, 2).toUpperCase();

                return (
                  <div
                    key={c.user_id}
                    onClick={() => setSelectedUser(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      background: isSelected ? '#2a3942' : 'transparent',
                      borderBottom: '1px solid #222d34',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#202c33';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {/* User Avatar */}
                    <div
                      style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0284c7, #7e22ce)',
                        color: '#fff',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>

                    {/* User Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: '#e9edef', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.username}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#8696a0' }}>
                          {new Date(c.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px' }}>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            color: '#8696a0',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '180px',
                          }}
                        >
                          {c.last_message}
                        </span>

                        {c.unread_count > 0 && (
                          <span
                            style={{
                              background: '#25d366',
                              color: '#111b21',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {c.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ─── 2. MIDDLE CHAT STREAM WINDOW ─── */}
        {selectedUser ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0b141a' }}>
            {/* Top Bar Header */}
            <div
              style={{
                height: '60px',
                padding: '0 16px',
                background: '#202c33',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #222d34',
              }}
            >
              <div
                onClick={() => setShowContactDrawer((prev) => !prev)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                title="Click to toggle User Contact Details Drawer"
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0284c7, #7e22ce)',
                    color: '#fff',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selectedUser.username.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#e9edef', fontSize: '0.95rem' }}>
                    {selectedUser.username}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#25d366', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#25d366' }} />
                    Active Support Session • {selectedUser.email}
                  </div>
                </div>
              </div>

              {/* Action Icons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setShowContactDrawer((prev) => !prev)}
                  style={{
                    background: showContactDrawer ? 'rgba(0,168,132,0.2)' : 'none',
                    border: 'none',
                    color: showContactDrawer ? '#00a884' : '#aebac1',
                    padding: '8px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                  }}
                  title="Toggle WhatsApp Contact Info Drawer"
                >
                  <MdInfo size={22} />
                </button>
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div
              style={{
                flex: 1,
                padding: '16px 24px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                background: 'radial-gradient(circle, rgba(17,27,33,0.8) 0%, rgba(11,20,26,0.95) 100%)',
              }}
            >
              {loadingMessages && messages.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: '#8696a0' }}>
                  Loading chat history...
                </div>
              ) : messages.map((m) => {
                const isAdminMsg = m.sender_type === 'admin';
                const isEditing = editingMsgId === m.id;

                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isAdminMsg ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {/* Timestamp & Name */}
                    <span style={{ fontSize: '0.68rem', color: '#8696a0', marginBottom: '2px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {isAdminMsg ? 'Admin' : m.sender_name} •{' '}
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {m.is_edited && !m.is_deleted && <span style={{ fontStyle: 'italic', color: '#8696a0' }}>(edited)</span>}
                      {isAdminMsg && !m.is_deleted && (
                        m.is_read ? (
                          <MdDoneAll size={14} color="#53bdeb" title="Read by user" />
                        ) : (
                          <MdCheck size={14} color="#8696a0" title="Delivered to user" />
                        )
                      )}
                    </span>

                    {/* Inline Editing */}
                    {isEditing ? (
                      <div style={{ width: '65%', display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          style={{
                            flex: 1,
                            height: '34px',
                            borderRadius: '8px',
                            background: '#2a3942',
                            border: '1px solid #00a884',
                            color: '#fff',
                            padding: '0 10px',
                            fontSize: '0.85rem',
                          }}
                        />
                        <button
                          onClick={() => handleSaveEdit(m.id)}
                          style={{ background: '#00a884', border: 'none', color: '#111b21', borderRadius: '6px', padding: '6px 12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingMsgId(null)}
                          style={{ background: '#202c33', border: 'none', color: '#aebac1', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}
                        >
                          <MdClose size={16} />
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          maxWidth: '70%',
                          position: 'relative',
                          padding: '8px 12px',
                          borderRadius: isAdminMsg ? '12px 12px 0 12px' : '12px 12px 12px 0',
                          background: m.is_deleted
                            ? '#202c33'
                            : isAdminMsg
                            ? '#005c4b' // WhatsApp Green bubble for Admin
                            : '#202c33', // WhatsApp Dark grey bubble for User
                          color: m.is_deleted ? '#8696a0' : '#e9edef',
                          fontStyle: m.is_deleted ? 'italic' : 'normal',
                          fontSize: '0.88rem',
                          lineHeight: 1.45,
                          boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                        }}
                      >
                        {m.message}

                        {/* Edit & Delete Action Buttons */}
                        {!m.is_deleted && (
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
                              style={{ background: 'none', border: 'none', color: 'rgba(233,237,239,0.6)', cursor: 'pointer', padding: 0 }}
                              title="Edit message"
                            >
                              <MdEdit size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(m.id)}
                              style={{ background: 'none', border: 'none', color: 'rgba(233,237,239,0.6)', cursor: 'pointer', padding: 0 }}
                              title="Delete message"
                            >
                              <MdDelete size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleAdminSend}
              style={{
                height: '62px',
                padding: '0 16px',
                background: '#202c33',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                borderTop: '1px solid #222d34',
              }}
            >
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Type a reply to ${selectedUser.username}...`}
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '8px',
                  background: '#2a3942',
                  border: 'none',
                  padding: '0 16px',
                  color: '#e9edef',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={sending || !replyText.trim()}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: sending || !replyText.trim() ? '#2a3942' : '#00a884',
                  border: 'none',
                  color: sending || !replyText.trim() ? '#8696a0' : '#111b21',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: sending || !replyText.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                <MdSend size={20} />
              </button>
            </form>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8696a0', background: '#0b141a' }}>
            Select a conversation thread to view & reply
          </div>
        )}

        {/* ─── 3. RIGHT DRAWER (WHATSAPP CONTACT INFO & USER PROFILE) ─── */}
        {showContactDrawer && selectedUser && (
          <div
            style={{
              borderLeft: '1px solid #222d34',
              background: '#111b21',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                height: '60px',
                padding: '0 16px',
                background: '#202c33',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: '1px solid #222d34',
              }}
            >
              <button
                onClick={() => setShowContactDrawer(false)}
                style={{ background: 'none', border: 'none', color: '#aebac1', cursor: 'pointer' }}
              >
                <MdClose size={20} />
              </button>
              <span style={{ fontWeight: 700, color: '#e9edef', fontSize: '0.95rem' }}>
                Contact Info
              </span>
            </div>

            {/* Profile Content */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {loadingProfile || !userProfileData ? (
                <div style={{ textAlign: 'center', color: '#8696a0', fontSize: '0.85rem', padding: '30px 0' }}>
                  Loading profile info...
                </div>
              ) : (
                <>
                  {/* Avatar Card */}
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0284c7, #7e22ce)',
                        color: '#fff',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
                        marginBottom: '12px',
                      }}
                    >
                      {userProfileData.username.substring(0, 2).toUpperCase()}
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#e9edef' }}>
                      {userProfileData.username}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: '#8696a0', marginTop: '2px' }}>
                      Registered User
                    </span>
                  </div>

                  {/* Security Risk Badge */}
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: userProfileData.suspicious_count > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(37,211,102,0.15)',
                      border: userProfileData.suspicious_count > 0 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(37,211,102,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    {userProfileData.suspicious_count > 0 ? (
                      <MdWarning size={22} color="#ef4444" />
                    ) : (
                      <MdCheckCircle size={22} color="#25d366" />
                    )}
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#8696a0', textTransform: 'uppercase', fontWeight: 700 }}>
                        Security Status
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: userProfileData.suspicious_count > 0 ? '#ef4444' : '#25d366' }}>
                        {userProfileData.risk_level}
                      </div>
                    </div>
                  </div>

                  {/* About / Contact Details */}
                  <div style={{ background: '#202c33', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MdEmail size={18} color="#00a884" />
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#8696a0' }}>Email Address</span>
                        <div style={{ fontSize: '0.85rem', color: '#e9edef', fontWeight: 600 }}>{userProfileData.email}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MdPhone size={18} color="#00a884" />
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#8696a0' }}>Phone</span>
                        <div style={{ fontSize: '0.85rem', color: '#e9edef', fontWeight: 600 }}>{userProfileData.phone_number || 'Not provided'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MdShield size={18} color="#00a884" />
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#8696a0' }}>Role & Status</span>
                        <div style={{ fontSize: '0.85rem', color: '#e9edef', fontWeight: 600, textTransform: 'uppercase' }}>
                          {userProfileData.role} • {userProfileData.is_active ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activity Stats */}
                  <div style={{ background: '#202c33', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e9edef' }}>
                      Activity & Device Analytics
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '10px' }}>
                      <MdHistory size={18} color="#3b82f6" />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.7rem', color: '#8696a0' }}>Total Logins</span>
                        <div style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 700 }}>{userProfileData.total_logins} sessions</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MdLaptop size={18} color="#a855f7" />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.7rem', color: '#8696a0' }}>Latest IP & Device</span>
                        <div style={{ fontSize: '0.82rem', color: '#e9edef', fontWeight: 600 }}>{userProfileData.latest_ip}</div>
                        <div style={{ fontSize: '0.72rem', color: '#8696a0' }}>{userProfileData.latest_device}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportChat;
