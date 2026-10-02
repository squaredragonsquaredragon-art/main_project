import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getToken } from '../utils/tokenHelper';
import {
  MdSmartToy, MdSend, MdDelete, MdContentCopy, MdCheck,
  MdAutoAwesome, MdAttachFile, MdClose, MdTableChart,
  MdPictureAsPdf, MdInsertDriveFile, MdShield, MdCloudUpload,
  MdPeople
} from 'react-icons/md';
import toast from 'react-hot-toast';

const AIChat = () => {
  const { user } = useAuth();
  // Strictly user-isolated storage key (never fallback to a shared 'admin' string)
  const userIdentifier = user?.id || user?.username || user?.email;
  const storageKey = userIdentifier ? `sentinel_ai_chat_history_${userIdentifier}` : null;
  const activeUserKeyRef = useRef(null);

  const getInitialMessages = (uname) => [
    {
      id: 'welcome_msg',
      sender: 'ai',
      text: `Hello ${uname || 'Admin'}! I am **Threat Detect AI**, your specialized Cyber Threat Detection & Security Intelligence Assistant.\n\nI can assist you with:\n- 🛡️ **Real-Time Threat Analysis & Incident Mitigation**\n- 👥 **User Movement & Activity Forensics** (Click *Observe User Movement* or ask about any user)\n- 📁 **Security Log & Audit File Inspection** (Upload \`.xlsx\`, \`.csv\`, or \`.pdf\` files)\n- 🚨 **Brute-Force, Credential Stuffing & Anomaly Forensics**\n\nAsk about any user's activity or attach a security file to begin threat detection.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];

  const [messages, setMessages] = useState(() => {
    if (!storageKey) return getInitialMessages(user?.username);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved AI chat history:', e);
    }
    return getInitialMessages(user?.username);
  });

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const userDropdownRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Switch chat history strictly when the user changes (User A's history will NEVER appear for User B)
  useEffect(() => {
    if (!storageKey) {
      activeUserKeyRef.current = null;
      setMessages(getInitialMessages(user?.username));
      return;
    }

    if (activeUserKeyRef.current !== storageKey) {
      let userHistory = null;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            userHistory = parsed;
          }
        }
      } catch (e) {
        console.error('Failed to load user chat history:', e);
      }

      activeUserKeyRef.current = storageKey;
      setMessages(userHistory || getInitialMessages(user?.username));
    }
  }, [storageKey, user?.username]);

  // Save to storage only when messages belong to the currently active user
  useEffect(() => {
    if (!storageKey || activeUserKeyRef.current !== storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save AI chat history:', e);
    }
  }, [messages, storageKey]);


  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = getToken() || localStorage.getItem('sentinel_token') || localStorage.getItem('access_token');
        const res = await fetch('/api/chat/users-summary', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUsersList(data);
        }
      } catch (err) {
        console.warn('Could not load users summary for observation:', err);
      }
    };
    fetchUsers();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleObserveUser = (targetUsername) => {
    setShowUserDropdown(false);
    if (!targetUsername || targetUsername === 'all') {
      handleSendMessage("Observe all users movement and activity across the system. Provide an executive threat verdict, anomalous authentication timeline, brute force analysis, and recommended admin actions.");
    } else {
      handleSendMessage(`Conduct an in-depth forensic observation and analysis of the user movement and activity history for '${targetUsername}'. Examine recent login locations, IP addresses, device hops, failed authentication bursts, and security risks.`);
    }
  };

  const quickPrompts = [
    { title: '👥 Observe All Users Movement', prompt: 'Observe all users movement and activity across the system. Provide an executive threat verdict, anomalous authentication timeline, brute force analysis, and recommended admin actions.' },
    { title: '📁 Audit Login CSV/XLSX Logs', prompt: 'What are the top security threat indicators to look for in authentication and login audit logs?' },
    { title: '🚨 Emergency Incident Response', prompt: 'Draft a step-by-step emergency incident response plan for high-risk suspicious logins and compromised credentials.' },
    { title: '🔍 Explain Risk Scoring & MFA', prompt: 'Explain how multi-factor biometric authentication and risk scoring prevent account takeover.' }
  ];


  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileExtension = (name) => {
    if (!name) return '';
    return name.split('.').pop().toLowerCase();
  };

  const renderFileIcon = (ext, size = 18) => {
    switch (ext) {
      case 'pdf':
        return <MdPictureAsPdf size={size} style={{ color: '#ef4444' }} />;
      case 'xlsx':
      case 'xls':
        return <MdTableChart size={size} style={{ color: '#10b981' }} />;
      case 'csv':
        return <MdTableChart size={size} style={{ color: '#06b6d4' }} />;
      default:
        return <MdInsertDriveFile size={size} style={{ color: '#a1a1aa' }} />;
    }
  };

  const validateAndSetFile = (file) => {
    if (!file) return;
    const ext = getFileExtension(file.name);
    const validExts = ['csv', 'xlsx', 'xls', 'pdf'];
    if (!validExts.includes(ext)) {
      toast.error(`Unsupported file type (.${ext}). Please upload .csv, .xlsx, or .pdf files.`);
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File size exceeds 20MB limit.');
      return;
    }
    setSelectedFile(file);
    toast.success(`Attached ${file.name} for Threat Analysis`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
    // Reset file input so user can reselect the same file if needed
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const promptText = textToSend || inputMessage;
    const fileToUpload = selectedFile;

    if ((!promptText || !promptText.trim()) && !fileToUpload) return;
    if (loading) return;

    const displayPrompt = promptText.trim() || (fileToUpload ? `Please perform a comprehensive threat detection analysis on ${fileToUpload.name}, highlighting any security risks, suspicious activity, attack indicators, or anomalies.` : '');

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: displayPrompt,
      fileInfo: fileToUpload ? {
        name: fileToUpload.name,
        size: formatFileSize(fileToUpload.size),
        type: getFileExtension(fileToUpload.name)
      } : null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setSelectedFile(null);
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

      // ─── Case 1: File Upload Analysis ──────────────────────────────────
      if (fileToUpload) {
        try {
          const formData = new FormData();
          formData.append('file', fileToUpload);
          formData.append('prompt', displayPrompt);
          formData.append('history', JSON.stringify(historyPayload));

          const res = await fetch('/api/chat/analyze-file', {
            method: 'POST',
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: formData
          });

          if (res.ok) {
            const data = await res.json();
            aiResponseText = data.reply;
          } else {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.detail || `Server returned ${res.status}`);
          }
        } catch (uploadErr) {
          console.warn('Backend file analysis error, attempting fallback:', uploadErr);
          throw uploadErr;
        }
      } else {
        // ─── Case 2: Standard Text Chat ──────────────────────────────────
        // 1. Try Backend Endpoint (/api/chat/ai)
        try {
          const res = await fetch('/api/chat/ai', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              message: displayPrompt,
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
          const systemPrompt = "STRICT DOMAIN BOUNDARY & POLICY INSTRUCTION:\nYou are Threat Detect AI (Sentinel & TheftGuard Advanced Cyber Threat Detection Engine). Your ONLY purpose and domain is System Security, Cyber Security, Threat Analysis & Detection, Vulnerability Management, Network Protection, Fraud Prevention, and Incident Response.\n\nSTRICT RULE:\nIf the user asks ANY question or topic outside of System & Cyber Security (such as animals, sports, cooking, general trivia, or off-topic subjects), you MUST REJECT the question politely with the following exact message structure:\n\"🛡️ **Threat Detect AI Policy Restriction**: I am a specialized AI Assistant restricted strictly to **Threat Detection & Cyber Security**, Threat Analysis, and Platform Defense. I cannot provide information on non-security topics. Please ask a cybersecurity or system administration question.\"\n\nDo NOT answer off-topic questions under any circumstances.";
          
          const openAiMessages = [
            { role: 'system', content: systemPrompt },
            ...historyPayload,
            { role: 'user', content: displayPrompt }
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
              max_tokens: 1400
            })
          });

          if (!openAiRes.ok) {
            const errorJson = await openAiRes.json().catch(() => ({}));
            throw new Error(errorJson.error?.message || `OpenAI API Error (${openAiRes.status})`);
          }

          const openAiData = await openAiRes.json();
          aiResponseText = openAiData.choices?.[0]?.message?.content || 'AI response received.';
        }
      }

      const aiReplyMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiReplyMsg]);
    } catch (err) {
      console.error('Threat Detect AI Error:', err);
      toast.error(err.message || 'Failed to get threat analysis response.');
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `⚠️ **Threat Detect AI Error**: ${err.message || 'Could not analyze threat payload. Please ensure file is valid and backend service is running.'}`,
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
        text: `Chat session reset. Ready for next threat detection or log analysis query!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(defaultMsg);
    setSelectedFile(null);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.error('Failed to clear chat history from localStorage:', e);
    }
    toast.success('Conversation reset.');
  };

  // High quality markdown renderer for Threat Detection reports
  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, lineIdx) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h3 key={lineIdx} style={{ fontSize: '15px', fontWeight: 700, color: '#60a5fa', margin: '14px 0 6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={lineIdx} style={{ fontSize: '16px', fontWeight: 700, color: '#93c5fd', margin: '16px 0 8px 0' }}>
            {line.replace('## ', '')}
          </h2>
        );
      }

      // Split bold formatting **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);

      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          const content = part.slice(2, -2);
          // Highlight threat severities
          let color = '#f4f4f5';
          if (content.includes('CRITICAL') || content.includes('🔴')) color = '#ef4444';
          else if (content.includes('HIGH') || content.includes('🟠')) color = '#f97316';
          else if (content.includes('MEDIUM') || content.includes('🟡')) color = '#eab308';
          else if (content.includes('LOW') || content.includes('🟢')) color = '#10b981';
          else if (content.includes('SECURE') || content.includes('🛡️')) color = '#38bdf8';

          return (
            <strong key={pIdx} style={{ color, fontWeight: 700 }}>
              {content}
            </strong>
          );
        }
        return part;
      });

      if (line.trim().startsWith('- ')) {
        return (
          <div key={lineIdx} style={{ display: 'flex', gap: '8px', marginLeft: '6px', margin: '4px 0 4px 6px' }}>
            <span style={{ color: '#38bdf8' }}>•</span>
            <div style={{ flex: 1 }}>{formattedLine}</div>
          </div>
        );
      }

      if (/^\d+\.\s/.test(line.trim())) {
        const num = line.trim().match(/^(\d+\.)/)[0];
        const rest = line.trim().replace(/^(\d+\.)\s*/, '');
        return (
          <div key={lineIdx} style={{ display: 'flex', gap: '8px', marginLeft: '6px', margin: '4px 0 4px 6px' }}>
            <span style={{ color: '#60a5fa', fontWeight: 600 }}>{num}</span>
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
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 110px)',
        background: '#09090b',
        borderRadius: '16px',
        border: isDragging ? '2px dashed #3b82f6' : '1px solid #27272a',
        overflow: 'hidden',
        color: '#ececf1',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative'
      }}
    >
      {/* Drag & Drop Visual Overlay */}
      {isDragging && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(9, 9, 11, 0.88)',
            backdropFilter: 'blur(4px)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: '#60a5fa'
          }}
        >
          <MdCloudUpload size={48} style={{ animation: 'bounce 1s infinite' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#f4f4f5', margin: 0 }}>
            Drop Security Log / Report to Analyze
          </h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Supports .csv, .xlsx, .xls, and .pdf documents
          </p>
        </div>
      )}

      {/* Threat Detect AI Top Header */}
      <div
        style={{
          height: '54px',
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
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '18px',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
            }}
          >
            <MdShield />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#f4f4f5', letterSpacing: '-0.2px' }}>
                Threat Detect AI
              </span>
              <span
                style={{
                  fontSize: '10px',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#60a5fa',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px'
                }}
              >
                Threat Engine
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#71717a' }}>
              Forensic Log Auditing • Anomaly Detection • File Threat Scanner
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Observe User Movement Dropdown */}
          <div ref={userDropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserDropdown(prev => !prev)}
              style={{
                background: showUserDropdown ? '#1e293b' : '#27272a',
                border: showUserDropdown ? '1px solid #3b82f6' : '1px solid #3f3f46',
                color: '#60a5fa',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                transition: 'all 0.15s',
              }}
              title="Observe and analyze user movements in real-time"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1e293b';
                e.currentTarget.style.color = '#93c5fd';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = showUserDropdown ? '#1e293b' : '#27272a';
                e.currentTarget.style.color = '#60a5fa';
              }}
            >
              <MdPeople size={16} />
              <span>Observe User Movement</span>
            </button>

            {showUserDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '40px',
                  right: 0,
                  width: '300px',
                  background: '#18181b',
                  border: '1px solid #3f3f46',
                  borderRadius: '12px',
                  padding: '8px',
                  zIndex: 100,
                  boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Live User Movement Telemetry
                </div>
                
                <button
                  onClick={() => handleObserveUser('all')}
                  style={{
                    background: '#27272a',
                    border: 'none',
                    color: '#f4f4f5',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#3f3f46'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#27272a'}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🌐 <strong>All Users Movement</strong>
                  </span>
                  <span style={{ fontSize: '10px', color: '#60a5fa', background: 'rgba(96,165,250,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                    System-wide
                  </span>
                </button>

                <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                  {usersList.length === 0 ? (
                    <div style={{ fontSize: '11px', color: '#71717a', padding: '8px', textAlign: 'center' }}>
                      No active users loaded
                    </div>
                  ) : (
                    usersList.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleObserveUser(u.username)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#d4d4d8',
                          padding: '7px 8px',
                          borderRadius: '6px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#27272a';
                          e.currentTarget.style.color = '#60a5fa';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#d4d4d8';
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                          <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            👤 {u.username}
                          </div>
                          <div style={{ fontSize: '10px', color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {u.email}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '10px', flexShrink: 0 }}>
                          <span style={{ color: '#a1a1aa' }}>{u.total_logins} logins</span>
                          {u.suspicious_count > 0 && (
                            <div style={{ color: '#ef4444', fontWeight: 600 }}>
                              🚨 {u.suspicious_count} alerts
                            </div>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: '#27272a',
              border: '1px solid #3f3f46',
              color: '#38bdf8',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              transition: 'all 0.15s',
            }}
            title="Upload CSV, XLSX, or PDF for Threat Detection"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#3f3f46';
              e.currentTarget.style.color = '#7dd3fc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#27272a';
              e.currentTarget.style.color = '#38bdf8';
            }}
          >
            <MdAttachFile size={16} />
            <span>Upload File</span>
          </button>

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
              padding: '6px 10px',
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
              maxWidth: '880px',
              width: '100%',
              margin: '0 auto',
            }}
          >
            {msg.sender === 'ai' && (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '16px',
                  flexShrink: 0,
                  marginTop: '2px',
                  boxShadow: '0 2px 6px rgba(59, 130, 246, 0.25)'
                }}
              >
                <MdShield />
              </div>
            )}

            <div
              style={{
                maxWidth: msg.sender === 'user' ? '75%' : '100%',
                background: msg.sender === 'user' ? '#1e293b' : '#18181b',
                border: msg.sender === 'user' ? '1px solid #334155' : '1px solid #27272a',
                borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '16px',
                padding: '14px 18px',
                color: '#d4d4d8',
                fontSize: '14px',
                lineHeight: '1.6',
                position: 'relative',
                wordBreak: 'break-word',
                boxShadow: msg.sender === 'user' ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              {/* If user attached a file, show attached file pill */}
              {msg.fileInfo && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: 'rgba(15, 23, 42, 0.65)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    marginBottom: '10px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {renderFileIcon(msg.fileInfo.type, 22)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.fileInfo.name}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '11px', display: 'flex', gap: '8px' }}>
                      <span>{msg.fileInfo.size}</span>
                      <span>•</span>
                      <span style={{ color: '#38bdf8', fontWeight: 500 }}>Threat Log Analyzed</span>
                    </div>
                  </div>
                </div>
              )}

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
                      transition: 'color 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#d4d4d8'}
                    onMouseLeave={(e) => e.currentTarget.style.color = copiedId === msg.id ? '#10b981' : '#71717a'}
                  >
                    {copiedId === msg.id ? <MdCheck size={14} /> : <MdContentCopy size={13} />}
                    {copiedId === msg.id ? 'Copied' : 'Copy Report'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Thinking Indicator */}
        {loading && (
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              maxWidth: '880px',
              width: '100%',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '16px',
                flexShrink: 0,
              }}
            >
              <MdShield className="spin" />
            </div>
            <div
              style={{
                padding: '12px 18px',
                borderRadius: '16px',
                background: '#18181b',
                border: '1px solid #27272a',
                color: '#38bdf8',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', animation: 'pulse 1.5s infinite' }} />
              <span>Threat Detect AI is scanning logs and evaluating threat vectors...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length <= 2 && (
        <div style={{ maxWidth: '880px', width: '100%', margin: '0 auto', padding: '0 20px 10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                e.currentTarget.style.color = '#38bdf8';
                e.currentTarget.style.borderColor = '#3b82f6';
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

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv,.xlsx,.xls,.pdf"
        style={{ display: 'none' }}
      />

      {/* Input Bar & File Preview */}
      <div style={{ padding: '12px 20px 20px', background: '#09090b', borderTop: '1px solid #18181b' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          
          {/* Selected File Chip */}
          {selectedFile && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                marginBottom: '8px',
                borderRadius: '10px',
                background: '#18181b',
                border: '1px solid #3b82f6',
                color: '#f4f4f5',
                fontSize: '12px',
                boxShadow: '0 2px 6px rgba(59, 130, 246, 0.2)'
              }}
            >
              {renderFileIcon(getFileExtension(selectedFile.name), 18)}
              <span style={{ fontWeight: 600 }}>{selectedFile.name}</span>
              <span style={{ color: '#71717a' }}>({formatFileSize(selectedFile.size)})</span>
              <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                Ready to Analyze
              </span>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Remove attachment"
              >
                <MdClose size={16} />
              </button>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              width: '100%'
            }}
          >
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              title="Attach .xlsx, .csv, or .pdf for threat detection"
              style={{
                position: 'absolute',
                left: '10px',
                zIndex: 2,
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: selectedFile ? '#1e293b' : 'transparent',
                border: selectedFile ? '1px solid #3b82f6' : 'none',
                color: selectedFile ? '#38bdf8' : '#a1a1aa',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.color = '#38bdf8';
                  e.currentTarget.style.background = '#27272a';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.color = selectedFile ? '#38bdf8' : '#a1a1aa';
                  e.currentTarget.style.background = selectedFile ? '#1e293b' : 'transparent';
                }
              }}
            >
              <MdAttachFile size={20} />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                selectedFile
                  ? `Ask question about ${selectedFile.name} or press Send to run threat analysis...`
                  : "Message Threat Detect AI or upload .xlsx, .csv, .pdf log file..."
              }
              style={{
                width: '100%',
                height: '52px',
                borderRadius: '26px',
                background: '#27272a',
                border: '1px solid #3f3f46',
                padding: '0 52px 0 50px',
                color: '#f4f4f5',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border 0.15s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#3f3f46'}
              disabled={loading}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || (!inputMessage.trim() && !selectedFile)}
              style={{
                position: 'absolute',
                right: '8px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: loading || (!inputMessage.trim() && !selectedFile)
                  ? '#3f3f46'
                  : 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
                border: 'none',
                color: loading || (!inputMessage.trim() && !selectedFile) ? '#71717a' : '#ffffff',
                cursor: loading || (!inputMessage.trim() && !selectedFile) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
                boxShadow: !loading && (inputMessage.trim() || selectedFile) ? '0 2px 8px rgba(37, 99, 235, 0.4)' : 'none'
              }}
            >
              <MdSend size={18} />
            </button>
          </form>

          {/* Form helper note */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 14px 0', fontSize: '11px', color: '#71717a' }}>
            <span>Supports <strong>.xlsx</strong>, <strong>.csv</strong>, and <strong>.pdf</strong> security logs up to 20MB</span>
            <span>Threat Detection Model: <strong>GPT-4o Forensics</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
