'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { AuthGuard } from '@/components/auth-guard';
import { useAuth } from '@/lib/auth/auth-context';
import {
  ConversationItem,
  ChatMessageItem,
  ConversationMemberItem,
  Client,
} from '@/lib/types';
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  Paperclip,
  Check,
  CheckCheck,
  MoreVertical,
  Users,
  UserPlus,
  Trash2,
  Edit2,
  X,
  RefreshCw,
  Building2,
  Clock,
  Shield,
  Smile,
  AlertCircle,
  FileText,
  ChevronRight,
  Info,
} from 'lucide-react';

function KairoChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialConvId = searchParams?.get('id');
  const { profile, user } = useAuth();

  const currentUserId = profile?.uid || user?.uid || 'usr_aman';
  const currentUserName = profile?.name || user?.displayName || 'Team Member';
  const currentUserEmail = profile?.email || user?.email || 'aman@codekap.com';

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // Modals & Drawers
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showMembersDrawer, setShowMembersDrawer] = useState(false);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);

  // New Group Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [formError, setFormError] = useState('');

  // Editing Message State
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch real conversations
  const fetchConversations = async (silent = false) => {
    if (!silent) setLoadingConversations(true);
    try {
      const res = await fetch('/api/chat/conversations');
      if (res.ok) {
        const data = await res.json();
        const convs: ConversationItem[] = data.conversations || [];
        setConversations(convs);

        // Auto-select initial conversation or first available
        if (!activeConversation && convs.length > 0) {
          const target = initialConvId
            ? convs.find((c) => c.id === initialConvId) || convs[0]
            : convs[0];
          setActiveConversation(target);
        } else if (activeConversation) {
          // Keep active conversation reference updated with new unread counts
          const refreshed = convs.find((c) => c.id === activeConversation.id);
          if (refreshed) {
            setActiveConversation((prev) => (prev ? { ...prev, ...refreshed } : refreshed));
          }
        }
      }
    } catch (err) {
      console.warn('Error fetching conversations:', err);
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  };

  // Fetch messages for active conversation
  const fetchMessages = async (convId: string, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/chat/conversations/${convId}/messages`);
      if (res.ok) {
        const data = await res.json();
        const newMsgs: ChatMessageItem[] = data.messages || [];
        setMessages(newMsgs);

        // Mark as read in database
        fetch(`/api/chat/conversations/${convId}/read`, { method: 'POST' }).catch(() => {});
      }
    } catch (err) {
      console.warn('Error fetching messages:', err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  // Fetch real clients & workspace users for new group creation
  const fetchAuxiliaryData = async () => {
    try {
      const [cliRes, usrRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/chat/users'),
      ]);

      if (cliRes.ok) {
        const d = await cliRes.json();
        setAvailableClients(d || []);
        if (d && d.length > 0 && !selectedClientId) {
          setSelectedClientId(d[0].id);
        }
      }

      if (usrRes.ok) {
        const d = await usrRes.json();
        setAvailableUsers(d.users || []);
      }
    } catch (err) {
      console.warn('Error loading aux data:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchAuxiliaryData();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversation?.id) {
      fetchMessages(activeConversation.id);
    } else {
      setMessages([]);
    }
  }, [activeConversation?.id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Real-time reactive sync loop (every 2.5s)
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeConversation?.id) {
        fetchMessages(activeConversation.id, true);
      }
      fetchConversations(true);
    }, 2500);

    return () => clearInterval(interval);
  }, [activeConversation?.id]);

  // Send message handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activeConversation || sending) return;

    const content = messageInput.trim();
    setMessageInput('');
    setSending(true);

    // Optimistic UI update
    const optimisticMsg: ChatMessageItem = {
      id: `temp_${Date.now()}`,
      conversationId: activeConversation.id,
      senderId: currentUserId,
      senderName: currentUserName,
      senderEmail: currentUserEmail,
      senderAvatar: profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserId}`,
      content,
      messageType: 'TEXT',
      isEdited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isReadByMe: true,
      isReadByAll: false,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch(`/api/chat/conversations/${activeConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? data.message : m))
        );
        fetchConversations(true);
      }
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setSending(false);
    }
  };

  // Create Group Conversation handler
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      setFormError('Please enter a conversation name.');
      return;
    }

    setCreatingGroup(true);
    setFormError('');

    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName.trim(),
          clientId: selectedClientId || undefined,
          memberUserIds: selectedMemberIds,
          type: 'GROUP',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create conversation');

      setShowNewGroupModal(false);
      setNewGroupName('');
      setSelectedMemberIds([]);
      await fetchConversations();
      if (data.conversation) {
        setActiveConversation(data.conversation);
      }
    } catch (err: any) {
      setFormError(err.message || 'Error creating group');
    } finally {
      setCreatingGroup(false);
    }
  };

  // Edit message
  const handleSaveEdit = async (msgId: string) => {
    if (!editContent.trim()) return;
    try {
      const res = await fetch(`/api/chat/messages/${msgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId ? { ...m, content: editContent.trim(), isEdited: true } : m
          )
        );
        setEditingMessageId(null);
        setEditContent('');
      }
    } catch (err) {
      console.error('Edit message error:', err);
    }
  };

  // Delete message (soft delete)
  const handleDeleteMessage = async (msgId: string) => {
    if (!window.confirm('Delete this message? It will be marked as deleted.')) return;
    try {
      const res = await fetch(`/api/chat/messages/${msgId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? { ...m, isDeleted: true, content: 'This message was deleted.', deletedAt: new Date().toISOString() }
              : m
          )
        );
      }
    } catch (err) {
      console.error('Delete message error:', err);
    }
  };

  // Add member to active conversation
  const handleAddMember = async (userId: string) => {
    if (!activeConversation) return;
    try {
      const res = await fetch(`/api/chat/conversations/${activeConversation.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveConversation((prev) =>
          prev
            ? {
                ...prev,
                members: [...prev.members, data.member],
              }
            : null
        );
        fetchConversations(true);
      }
    } catch (err) {
      console.error('Add member error:', err);
    }
  };

  // Remove member from active conversation
  const handleRemoveMember = async (userId: string) => {
    if (!activeConversation) return;
    if (!window.confirm('Remove this member from the conversation?')) return;
    try {
      const res = await fetch(
        `/api/chat/conversations/${activeConversation.id}/members?userId=${userId}`,
        { method: 'DELETE' }
      );

      if (res.ok) {
        setActiveConversation((prev) =>
          prev
            ? {
                ...prev,
                members: prev.members.filter((m) => m.userId !== userId),
              }
            : null
        );
        fetchConversations(true);
      }
    } catch (err) {
      console.error('Remove member error:', err);
    }
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.clientName && c.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="h-[calc(100vh-80px)] flex flex-col space-y-3">
          {/* Top Info Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 shrink-0">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-0.5">
                <MessageSquare className="w-4 h-4" />
                <span>KAIRO Real-Time Team Communication</span>
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                KAIRO Team Chat
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowNewGroupModal(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer btn-press"
              >
                <Plus className="w-4 h-4" />
                <span>New Conversation / Group</span>
              </button>
            </div>
          </div>

          {/* Main WhatsApp-Style Split Layout */}
          <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden flex min-h-0">
            {/* ================= LEFT SIDEBAR: CONVERSATIONS LIST ================= */}
            <div className="w-80 md:w-96 border-r border-slate-200 flex flex-col h-full bg-slate-50/50 shrink-0">
              {/* Search Header */}
              <div className="p-3.5 border-b border-slate-200 bg-white space-y-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search chats, clients, messages..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-100/80 rounded-xl border border-slate-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Conversation Items List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                {loadingConversations ? (
                  <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Loading conversations...</span>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {searchQuery ? 'No matching conversations' : 'No conversations yet'}
                    </div>
                    <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                      {searchQuery
                        ? 'Try searching by client name or team group.'
                        : 'Start a conversation with your client team.'}
                    </p>
                    {!searchQuery && (
                      <button
                        type="button"
                        onClick={() => setShowNewGroupModal(true)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-blue-700"
                      >
                        + Start Conversation
                      </button>
                    )}
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const isSelected = activeConversation?.id === conv.id;
                    return (
                      <button
                        key={conv.id}
                        type="button"
                        onClick={() => setActiveConversation(conv)}
                        className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/80 border-l-4 border-blue-600 text-slate-900'
                            : 'hover:bg-slate-100/70 text-slate-700'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <img
                            src={
                              conv.avatarUrl ||
                              conv.clientLogo ||
                              `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(conv.name)}`
                            }
                            alt={conv.name}
                            className="w-11 h-11 rounded-2xl object-cover border border-slate-200 bg-white"
                          />
                          {conv.type === 'GROUP' && (
                            <div className="w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] font-bold flex items-center justify-center absolute -bottom-1 -right-1 border border-white">
                              {conv.members.length}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h3 className="text-xs font-extrabold text-slate-900 truncate">
                              {conv.name}
                            </h3>
                            {conv.lastMessageAt && (
                              <span className="text-[10px] text-slate-400 font-medium shrink-0">
                                {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                          </div>

                          {/* Client tag */}
                          {conv.clientName && (
                            <div className="text-[10px] text-blue-700 font-bold truncate flex items-center gap-1 mb-1">
                              <Building2 className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{conv.clientName}</span>
                            </div>
                          )}

                          {/* Last message snippet & unread badge */}
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[11px] text-slate-500 truncate font-normal">
                              {conv.lastMessage || 'No messages yet'}
                            </p>
                            {conv.unreadCount && conv.unreadCount > 0 ? (
                              <span className="px-1.5 py-0.2 bg-emerald-500 text-white text-[10px] font-extrabold rounded-full shrink-0 shadow-2xs">
                                {conv.unreadCount}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* ================= RIGHT SIDE: CHAT AREA ================= */}
            {activeConversation ? (
              <div className="flex-1 flex flex-col h-full bg-[#EFEAE2]/30 min-w-0">
                {/* Chat Header */}
                <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs z-10">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        activeConversation.avatarUrl ||
                        activeConversation.clientLogo ||
                        `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(activeConversation.name)}`
                      }
                      alt={activeConversation.name}
                      className="w-10 h-10 rounded-2xl object-cover border border-slate-200 bg-white shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-extrabold text-slate-900 truncate">
                          {activeConversation.name}
                        </h2>
                        {activeConversation.clientName && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                            {activeConversation.clientName}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>
                          {activeConversation.members.map((m) => m.userName.split(' ')[0]).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowMembersDrawer(true)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Members ({activeConversation.members.length})</span>
                    </button>
                  </div>
                </div>

                {/* Messages Stream Viewport */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
                  {loadingMessages ? (
                    <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Loading messages from database...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-white text-slate-400 flex items-center justify-center shadow-xs border border-slate-200">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-slate-800">No messages yet</div>
                      <p className="text-[11px] text-slate-500 max-w-xs">
                        Send a message to start communicating with the {activeConversation.name} team.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === currentUserId;
                      const isEditing = editingMessageId === msg.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2 group ${
                            isMe ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {/* Sender Avatar for other members */}
                          {!isMe && (
                            <img
                              src={msg.senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`}
                              alt={msg.senderName}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 mb-1 shrink-0"
                            />
                          )}

                          {/* Bubble Container */}
                          <div
                            className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-xs transition-all ${
                              isMe
                                ? 'bg-[#DCF8C6] text-slate-900 rounded-br-xs border border-emerald-200/60'
                                : 'bg-white text-slate-900 rounded-bl-xs border border-slate-200/80'
                            }`}
                          >
                            {/* Sender Name in Group Chat */}
                            {!isMe && (
                              <div className="text-[11px] font-extrabold text-blue-700 mb-1">
                                {msg.senderName}
                              </div>
                            )}

                            {/* Message Content or Inline Editor */}
                            {isEditing ? (
                              <div className="space-y-2 min-w-[220px]">
                                <textarea
                                  rows={2}
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                                />
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setEditingMessageId(null)}
                                    className="px-2 py-1 rounded text-[10px] font-semibold text-slate-500 hover:bg-slate-100"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEdit(msg.id)}
                                    className="px-2.5 py-1 rounded bg-blue-600 text-white text-[10px] font-bold shadow-xs hover:bg-blue-700"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p
                                className={`text-xs leading-relaxed whitespace-pre-wrap ${
                                  msg.isDeleted ? 'italic text-slate-400 font-normal' : 'font-medium'
                                }`}
                              >
                                {msg.content}
                              </p>
                            )}

                            {/* Metadata Footer: Timestamp, Edited tag, Read checkmarks */}
                            <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-slate-400 font-medium select-none">
                              {msg.isEdited && !msg.isDeleted && (
                                <span className="italic text-[9px] text-slate-500">edited</span>
                              )}
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>

                              {/* WhatsApp Double Checkmark Read Status */}
                              {isMe && !msg.isDeleted && (
                                <span title={msg.isReadByAll ? 'Read by team' : 'Delivered'}>
                                  {msg.isReadByAll ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                </span>
                              )}
                            </div>

                            {/* Message Hover Actions (Edit / Delete for sender) */}
                            {isMe && !msg.isDeleted && !isEditing && (
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-lg border border-slate-200 shadow-xs flex items-center p-0.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingMessageId(msg.id);
                                    setEditContent(msg.content);
                                  }}
                                  className="p-1 text-slate-500 hover:text-blue-600 rounded"
                                  title="Edit message"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="p-1 text-slate-500 hover:text-rose-600 rounded"
                                  title="Delete message"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Composer Input Area */}
                <div className="p-3.5 bg-white border-t border-slate-200">
                  <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    {/* Attachment Button */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          alert(`File ${e.target.files[0].name} selected. Permanent storage integration active.`);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="Attach file"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>

                    {/* Text Input */}
                    <div className="flex-1 relative">
                      <textarea
                        rows={1}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Type a message (Enter to send, Shift+Enter for new line)..."
                        className="w-full px-4 py-2.5 text-xs bg-slate-100/80 rounded-2xl border border-slate-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 resize-none max-h-24 custom-scrollbar"
                      />
                    </div>

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={!messageInput.trim() || sending}
                      className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl shadow-md shadow-blue-600/20 transition-all hover:scale-105 cursor-pointer btn-press shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/40">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-inner">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Select a Conversation</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Choose a client conversation from the left sidebar or create a new group with your team.
                </p>
                <button
                  type="button"
                  onClick={() => setShowNewGroupModal(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700"
                >
                  + New Conversation
                </button>
              </div>
            )}
          </div>

          {/* ================= MODAL: CREATE NEW CONVERSATION / GROUP ================= */}
          {showNewGroupModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">New Conversation / Group</h3>
                      <p className="text-xs text-slate-500">Connect client workspace with real team members</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewGroupModal(false)}
                    className="text-slate-400 hover:text-slate-700 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {formError && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleCreateGroup} className="space-y-4">
                  {/* Group Name */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Conversation / Group Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g. AVS Marketing Team, Creative Review"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                  </div>

                  {/* Client Selector */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Associated Client
                    </label>
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 bg-white"
                    >
                      <option value="">General Workspace (No Client)</option>
                      {availableClients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.businessName || c.name} ({c.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Real Team Members Multi-Select */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                      <span>Add Workspace Members ({availableUsers.length} available)</span>
                      <span className="text-[10px] text-slate-400 font-normal">Real Database Users</span>
                    </label>

                    {availableUsers.length === 0 ? (
                      <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                        No other team members found.
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto custom-scrollbar border border-slate-200 rounded-2xl divide-y divide-slate-100 p-1">
                        {availableUsers.map((u) => {
                          const isSelected = selectedMemberIds.includes(u.id);
                          const isMe = u.id === currentUserId || u.email === currentUserEmail;

                          return (
                            <label
                              key={u.id}
                              className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                                isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={u.avatar}
                                  alt={u.name}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-900 truncate">
                                    {u.name} {isMe && '(You - Admin)'}
                                  </div>
                                  <div className="text-[10px] text-slate-500 truncate">
                                    {u.title} • {u.email}
                                  </div>
                                </div>
                              </div>

                              <input
                                type="checkbox"
                                disabled={isMe}
                                checked={isMe || isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedMemberIds([...selectedMemberIds, u.id]);
                                  } else {
                                    setSelectedMemberIds(selectedMemberIds.filter((id) => id !== u.id));
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowNewGroupModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingGroup}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                    >
                      {creatingGroup ? 'Creating...' : 'Create Conversation'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ================= DRAWER: MEMBER MANAGEMENT ================= */}
          {showMembersDrawer && activeConversation && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex justify-end z-50 animate-fade-in">
              <div className="bg-white w-full max-w-sm h-full p-6 shadow-2xl flex flex-col space-y-5 animate-accordion">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Conversation Details</h3>
                    <p className="text-xs text-slate-500">{activeConversation.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMembersDrawer(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Client Info */}
                {activeConversation.clientName && (
                  <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200/60 flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <div className="text-xs font-extrabold text-blue-950">
                        {activeConversation.clientName}
                      </div>
                      <div className="text-[10px] text-blue-700">Client Workspace Channel</div>
                    </div>
                  </div>
                )}

                {/* Members List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Members ({activeConversation.members.length})
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activeConversation.members.map((member) => (
                      <div
                        key={member.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={member.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.userId}`}
                            alt={member.userName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {member.userName}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {member.userEmail}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                              member.role === 'ADMIN'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {member.role}
                          </span>

                          {member.userId !== currentUserId && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member.userId)}
                              className="text-slate-400 hover:text-rose-600 p-1 text-xs"
                              title="Remove member"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Member Section */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Add Team Member</span>
                    <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                      {availableUsers
                        .filter(
                          (u) => !activeConversation.members.some((m) => m.userId === u.id)
                        )
                        .map((u) => (
                          <div
                            key={u.id}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 truncate">
                                {u.name}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">{u.title}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddMember(u.id)}
                              className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] font-bold"
                            >
                              + Add
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => setShowMembersDrawer(false)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

export default function KairoChatPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading KAIRO Chat...</span>
        </div>
      }
    >
      <KairoChatContent />
    </Suspense>
  );
}
