import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../dashboard/lib/supabase';
import { getConsultationByToken, getConversationMessages, sendConversationMessage } from '../dashboard/data/service';
import { notifyAdminNewMessage } from '../lib/notifications';
import type { Consultation, ConversationMessage } from '../dashboard/data/schema';

const SEND_INTERVAL_KEY = 'rl_conversation_send';

function checkSendRate(): boolean {
  try {
    const raw = localStorage.getItem(SEND_INTERVAL_KEY);
    const timestamps: number[] = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    const recent = timestamps.filter((t) => now - t < 60000);
    return recent.length < 10;
  } catch { return true; }
}

function recordSend() {
  try {
    const raw = localStorage.getItem(SEND_INTERVAL_KEY);
    const timestamps: number[] = raw ? JSON.parse(raw) : [];
    timestamps.push(Date.now());
    localStorage.setItem(SEND_INTERVAL_KEY, JSON.stringify(timestamps));
  } catch { /* silent */ }
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function ConversationPortal() {
  const { token } = useParams<{ token: string }>();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) { setError('Invalid link'); setLoading(false); return; }
    (async () => {
      try {
        const consult = await getConsultationByToken(token);
        if (!consult) { setError('Conversation not found. Check your link.'); setLoading(false); return; }
        setConsultation(consult);
        const msgs = await getConversationMessages(consult.id);
        setMessages(msgs);
      } catch {
        setError('Unable to load conversation. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  useEffect(() => {
    if (!consultation) return;
    const channel = supabase.channel(`conversation-${consultation.id}`)
      .on('postgres_changes' as never,
        { event: 'INSERT', schema: 'public', table: 'conversation_messages', filter: `consultation_id=eq.${consultation.id}` } as never,
        (payload: unknown) => {
          const msg = (payload as Record<string, unknown>).new as ConversationMessage;
          if (msg) setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [consultation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !consultation || sending) return;
    if (!checkSendRate()) { setError('Too many messages. Please wait.'); return; }
    setSending(true);
    setError(null);
    try {
      const result = await sendConversationMessage(consultation.id, 'client', text, consultation.name);
      if (result) {
        recordSend();
        setInput('');
        notifyAdminNewMessage({
          consultation_id: consultation.id,
          conversation_token: consultation.conversation_token,
          client_name: consultation.name,
          property_name: consultation.property_name,
          message: text,
        });
      }
    } catch {
      setError('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-500">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error && !consultation) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">💬</div>
          <h1 className="text-lg font-semibold text-neutral-800 mb-2">Conversation not found</h1>
          <p className="text-sm text-neutral-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <header className="bg-white border-b border-neutral-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-sm font-semibold text-neutral-800">Conversation with Rhen</h1>
          <p className="text-xs text-neutral-500">{consultation?.property_name} Consultation</p>
        </div>
      </header>

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 space-y-3 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-neutral-400">No messages yet. Start the conversation.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
              msg.sender_type === 'client'
                ? 'bg-primary text-white rounded-br-md'
                : 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-md'
            }`}>
              <p className="whitespace-pre-wrap break-words">{msg.message}</p>
              <div className={`flex items-center gap-1.5 mt-1 ${
                msg.sender_type === 'client' ? 'justify-end' : 'justify-start'
              }`}>
                <span className={`text-[10px] ${msg.sender_type === 'client' ? 'text-white/70' : 'text-neutral-400'}`}>
                  {formatTime(msg.created_at)}
                </span>
                {msg.sender_type === 'client' && msg.read_at && (
                  <span className="text-[10px] text-white/70">Read</span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="bg-white border-t border-neutral-200 px-4 py-3 sticky bottom-0">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            maxLength={2000}
            onChange={(e) => { setInput(e.target.value); setError(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            className="flex-1 bg-neutral-100 rounded-xl px-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="bg-primary text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <span className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending
              </span>
            ) : 'Send'}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 max-w-2xl mx-auto mt-1.5">{error}</p>}
      </div>
    </div>
  );
}
