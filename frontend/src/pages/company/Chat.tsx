import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Search, Users, MessageCircle, Loader2 } from 'lucide-react';
import { companyAPI } from '../../api/company';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [conversations, setConversations] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts'>('chats');
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // ── Fetch conversations & contacts on mount ──
  useEffect(() => {
    const fetchConvs = async () => {
      try {
        const res = await companyAPI.listConversations();
        setConversations(res.data.data || []);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    const fetchContacts = async () => {
      try {
        const res = await companyAPI.getChatContacts();
        // Deduplicate by _id
        const seen = new Set<string>();
        const unique = (res.data.data || []).filter((c: any) => {
          const id = String(c._id);
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        setContacts(unique);
      } catch { /* ignore */ } finally { setContactsLoading(false); }
    };
    fetchConvs();
    fetchContacts();
  }, []);

  // ── Load messages when conversation changes ──
  useEffect(() => {
    if (!activeConv) return;
    const fetchMessages = async () => {
      setMsgLoading(true);
      try {
        const res = await companyAPI.getMessages(activeConv._id);
        setMessages(res.data.data || []);
      } catch { /* ignore */ } finally { setMsgLoading(false); }
    };
    fetchMessages();
    socket?.emit('chat:join', activeConv._id);
    return () => { socket?.emit('chat:leave', activeConv._id); };
  }, [activeConv?._id]);

  // ── Auto-scroll to bottom ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Socket listeners ──
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data: any) => {
      // Deduplicate: don't add if _id already exists (sender gets it from HTTP response)
      if (data.conversationId === activeConv?._id) {
        setMessages(prev => {
          if (prev.some(m => m._id === data._id)) return prev;
          return [...prev, data];
        });
      }
      // Update conversation preview
      setConversations(prev => prev.map(c =>
        c._id === data.conversationId
          ? { ...c, lastMessage: { content: data.content, timestamp: new Date() }, unreadCount: data.conversationId !== activeConv?._id ? (c.unreadCount || 0) + 1 : 0 }
          : c
      ));
    };

    const handleTyping = ({ userName }: { userName: string }) => setTypingUser(userName);
    const handleStopTyping = () => setTypingUser('');
    const handleContactsUpdated = async () => {
      try {
        const res = await companyAPI.getChatContacts();
        const seen = new Set<string>();
        const unique = (res.data.data || []).filter((c: any) => {
          const id = String(c._id); if (seen.has(id)) return false; seen.add(id); return true;
        });
        setContacts(unique);
      } catch { /* ignore */ }
    };

    socket.on('chat:message', handleMessage);
    socket.on('chat:typing', handleTyping);
    socket.on('chat:stopTyping', handleStopTyping);
    socket.on('contacts-updated', handleContactsUpdated);
    return () => {
      socket.off('chat:message', handleMessage);
      socket.off('chat:typing', handleTyping);
      socket.off('chat:stopTyping', handleStopTyping);
      socket.off('contacts-updated', handleContactsUpdated);
    };
  }, [socket, activeConv?._id]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConv) return;
    const text = newMessage;
    setNewMessage('');
    try {
      const res = await companyAPI.sendMessage(activeConv._id, { content: text });
      // Server emits chat:message to room — we add from HTTP response to avoid waiting
      setMessages(prev => {
        const saved = res.data.data;
        if (prev.some(m => m._id === saved._id)) return prev;
        return [...prev, saved];
      });
      socket?.emit('chat:stopTyping', { conversationId: activeConv._id });
    } catch { setNewMessage(text); }
  };

  const handleTypingInput = () => {
    socket?.emit('chat:typing', { conversationId: activeConv?._id, userName: user?.fullName });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('chat:stopTyping', { conversationId: activeConv?._id });
    }, 2000);
  };

  // ── Derive conversation display name ──
  const getConversationName = useCallback((conv: any) => {
    if (conv.type === 'group') return conv.groupName || 'Group Chat';
    const other = conv.participants?.find((p: any) => String(p._id) !== String(user?.id));
    return other?.fullName || 'Unknown';
  }, [user?.id]);

  const getConversationRole = useCallback((conv: any) => {
    if (conv.type === 'group') return 'Group';
    const other = conv.participants?.find((p: any) => String(p._id) !== String(user?.id));
    return other?.role?.replace('_', ' ') || '';
  }, [user?.id]);

  // ── Start or open a DM with a contact ──
  const startChat = async (contact: any) => {
    // Check if a DM already exists
    const existing = conversations.find(c =>
      c.type === 'dm' && c.participants?.some((p: any) => String(p._id) === String(contact._id))
    );
    if (existing) { setActiveConv(existing); setActiveTab('chats'); return; }

    try {
      const res = await companyAPI.createConversation({ type: 'dm', participants: [contact._id] });
      const newConv = res.data.data;
      setConversations(prev => [newConv, ...prev.filter(c => c._id !== newConv._id)]);
      setActiveConv(newConv);
      setActiveTab('chats');
    } catch { /* ignore */ }
  };

  // ── Filtered lists ──
  const filteredConvs = conversations.filter(c =>
    getConversationName(c).toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredContacts = contacts.filter(c =>
    (c.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Initials avatar helper ──
  const getInitials = (name: string) => (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-card border border-border rounded-2xl overflow-hidden shadow-sm">

      {/* ─── Left Panel — Conversations / Contacts ─── */}
      <div className="w-80 border-r border-border flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold font-heading">Chat</h2>
            <div className="flex bg-muted/50 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('chats')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'chats' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >Chats</button>
              <button
                onClick={() => setActiveTab('contacts')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'contacts' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >Contacts</button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-foreground"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'contacts' ? (
            contactsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No contacts found</p>
              </div>
            ) : (
              filteredContacts.map(contact => (
                <button
                  key={contact._id}
                  onClick={() => startChat(contact)}
                  className="w-full text-left px-4 py-3 border-b border-border hover:bg-muted/30 transition-colors flex items-center gap-3"
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-bold">
                      {getInitials(contact.fullName)}
                    </div>
                    {onlineUsers.includes(contact._id) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{contact.fullName}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">{contact.role?.replace('_', ' ')}</p>
                  </div>
                </button>
              ))
            )
          ) : (
            loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : filteredConvs.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">Go to Contacts to start a chat</p>
              </div>
            ) : (
              filteredConvs.map(conv => {
                const isOnline = conv.participants?.some((p: any) =>
                  String(p._id) !== String(user?.id) && onlineUsers.includes(p._id)
                );
                return (
                  <button
                    key={conv._id}
                    onClick={() => setActiveConv(conv)}
                    className={`w-full text-left px-4 py-3 border-b border-border hover:bg-muted/30 transition-colors flex items-center gap-3 ${activeConv?._id === conv._id ? 'bg-muted/40' : ''}`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-bold">
                        {conv.type === 'group' ? <Users className="w-5 h-5" /> : getInitials(getConversationName(conv))}
                      </div>
                      {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium truncate">{getConversationName(conv)}</p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-foreground text-background text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-1">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage?.content || 'No messages yet'}</p>
                    </div>
                  </button>
                );
              })
            )
          )}
        </div>
      </div>

      {/* ─── Right Panel — Chat Window ─── */}
      <div className="flex-1 flex flex-col bg-muted/10">
        {!activeConv ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-lg font-semibold">Select a conversation</p>
              <p className="text-sm text-muted-foreground">Choose from Chats or pick a Contact to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center gap-3 bg-card">
              <div className="w-9 h-9 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-bold shrink-0">
                {activeConv.type === 'group' ? <Users className="w-4 h-4" /> : getInitials(getConversationName(activeConv))}
              </div>
              <div>
                <p className="text-sm font-semibold">{getConversationName(activeConv)}</p>
                {typingUser
                  ? <p className="text-xs text-accent animate-pulse">{typingUser} is typing...</p>
                  : <p className="text-xs text-muted-foreground capitalize">{getConversationRole(activeConv)}</p>
                }
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No messages yet. Say hello! 👋</div>
              ) : (
                messages.map((msg, i) => {
                  const isMine = String(msg.sender?._id) === String(user?.id) || String(msg.sender) === String(user?.id);
                  return (
                    <div key={msg._id || i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMine ? 'bg-foreground text-background rounded-br-none' : 'bg-card border border-border/50 text-foreground rounded-bl-none'}`}>
                        {!isMine && <p className="text-xs font-semibold mb-1 opacity-70">{msg.sender?.fullName}</p>}
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-background/60' : 'text-muted-foreground'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => { setNewMessage(e.target.value); handleTypingInput(); }}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-foreground"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2.5 rounded-xl bg-foreground text-background disabled:opacity-40"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
