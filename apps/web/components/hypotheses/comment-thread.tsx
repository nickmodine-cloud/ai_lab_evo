"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { MessageSquare, Reply, ThumbsUp, CheckCircle2, XCircle, AtSign, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  author: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
  reactions: Reaction[];
  replies: Comment[];
  resolved?: boolean;
}

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface CommentThreadProps {
  comments: Comment[];
  onAddComment: (text: string, parentId?: string) => void;
  onAddReaction: (commentId: string, emoji: string) => void;
  onResolve: (commentId: string, resolved: boolean) => void;
  currentUser: string;
  mentionableUsers: string[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function parseMentions(text: string): Array<{ type: "text" | "mention"; content: string }> {
  const parts: Array<{ type: "text" | "mention"; content: string }> = [];
  const mentionRegex = /@(\w+)/g;
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "mention", content: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "text", content: text }];
}

function CommentInput({
  onSubmit,
  onMention,
  placeholder = "Add a comment...",
  mentionableUsers
}: {
  onSubmit: (text: string) => void;
  onMention?: () => void;
  placeholder?: string;
  mentionableUsers: string[];
}) {
  const [text, setText] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const cursorPos = e.target.selectionStart || 0;
        setCursorPosition(cursorPos);
        const textBeforeCursor = text.slice(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf("@");

        if (lastAtIndex !== -1 && lastAtIndex === cursorPos - 1) {
          setShowMentions(true);
          setMentionQuery("");
        } else if (lastAtIndex !== -1) {
          const query = textBeforeCursor.slice(lastAtIndex + 1, cursorPos);
          if (!query.includes(" ") && !query.includes("\n")) {
            setShowMentions(true);
            setMentionQuery(query);
          } else {
            setShowMentions(false);
          }
        } else {
          setShowMentions(false);
        }
      };

      textarea.addEventListener("input", handleInput as any);
      return () => textarea.removeEventListener("input", handleInput as any);
    }
  }, [text]);

  const filteredUsers = mentionableUsers.filter((user) =>
    user.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handleInsertMention = (username: string) => {
    const textBeforeCursor = text.slice(0, cursorPosition);
    const textAfterCursor = text.slice(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    const newText = textBeforeCursor.slice(0, lastAtIndex) + `@${username} ` + textAfterCursor;
    setText(newText);
    setShowMentions(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
      const newCursorPos = lastAtIndex + username.length + 2;
      setTimeout(() => {
        textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text);
      setText("");
      setShowMentions(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-surface-hover/70 p-3">
        <div className="h-8 w-8 rounded-full border border-border/60 bg-surface flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-text-primary">Y</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={placeholder}
              className="w-full resize-none rounded-lg border border-border/60 bg-surface-muted/70 px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-neon-green/60 focus:ring-2 focus:ring-neon-green/20 focus:outline-none transition-all duration-300 min-h-[80px]"
              rows={3}
            />
            {showMentions && filteredUsers.length > 0 && (
              <div className="absolute bottom-full left-0 mb-2 w-48 rounded-lg border border-border/60 bg-surface shadow-lg z-10 max-h-48 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <button
                    key={user}
                    type="button"
                    onClick={() => handleInsertMention(user)}
                    className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-hover/70 transition duration-200 flex items-center gap-2"
                  >
                    <AtSign className="h-3.5 w-3.5 text-neon-green" />
                    {user}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <button
              type="button"
              onClick={() => {
                const pos = textareaRef.current?.selectionStart || text.length;
                setText(text.slice(0, pos) + "@" + text.slice(pos));
                textareaRef.current?.focus();
                setTimeout(() => {
                  textareaRef.current?.setSelectionRange(pos + 1, pos + 1);
                }, 0);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2 py-1 text-xs text-text-secondary hover:border-neon-green/60 hover:text-neon-green transition duration-200"
            >
              <AtSign className="h-3 w-3" />
              Mention
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!text.trim()}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition duration-200",
                text.trim()
                  ? "bg-neon-green/20 text-neon-green hover:bg-neon-green/30"
                  : "bg-surface-muted/50 text-text-secondary/50 cursor-not-allowed"
              )}
            >
              <Send className="h-3.5 w-3.5" />
              Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  depth = 0,
  onReply,
  onAddReaction,
  onResolve,
  currentUser,
  mentionableUsers
}: {
  comment: Comment;
  depth?: number;
  onReply: (parentId: string, text: string) => void;
  onAddReaction: (commentId: string, emoji: string) => void;
  onResolve: (commentId: string, resolved: boolean) => void;
  currentUser: string;
  mentionableUsers: string[];
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const parts = parseMentions(comment.text);

  return (
    <div className={cn("space-y-3", depth > 0 && "ml-8")}>
      <div className="rounded-xl border border-border/60 bg-surface-hover/70 px-3 py-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="h-7 w-7 rounded-full border border-border/60 bg-surface flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-text-primary">
                {comment.author.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-primary">{comment.author}</span>
                {comment.resolved && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(0,255,136,0.45)] bg-[rgba(0,255,136,0.08)] px-2 py-0.5 text-[10px] text-neon-green">
                    <CheckCircle2 className="h-3 w-3" />
                    Resolved
                  </span>
                )}
              </div>
              <span className="text-xs text-text-secondary/60">{formatDate(comment.createdAt)}</span>
            </div>
          </div>
          {comment.author === currentUser && (
            <button
              type="button"
              onClick={() => onResolve(comment.id, !comment.resolved)}
              className={cn(
                "rounded-full p-1.5 transition duration-200",
                comment.resolved
                  ? "text-neon-green hover:bg-[rgba(0,255,136,0.1)]"
                  : "text-text-secondary/60 hover:text-neon-green hover:bg-surface-muted/70"
              )}
              title={comment.resolved ? "Unresolve" : "Mark as resolved"}
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">
          {parts.map((part, i) => {
            if (part.type === "mention") {
              return (
                <span key={i} className="text-neon-green font-medium">
                  {part.content}
                </span>
              );
            }
            return <span key={i}>{part.content}</span>;
          })}
        </p>
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/60">
          <button
            type="button"
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-neon-green transition duration-200"
          >
            <Reply className="h-3.5 w-3.5" />
            Reply
          </button>
          <button
            type="button"
            onClick={() => setShowReactions(!showReactions)}
            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-neon-green transition duration-200"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            React
          </button>
          {comment.reactions.length > 0 && (
            <div className="flex items-center gap-2">
              {comment.reactions.map((reaction, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onAddReaction(comment.id, reaction.emoji)}
                  className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-xs text-text-secondary hover:border-neon-green/60 hover:text-neon-green transition duration-200"
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {showReactions && (
          <div className="mt-2 flex items-center gap-2">
            {["👍", "❤️", "🎉", "👀", "✅"].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onAddReaction(comment.id, emoji);
                  setShowReactions(false);
                }}
                className="rounded-full border border-border/60 px-2 py-1 text-sm hover:border-neon-green/60 transition duration-200"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
      {showReplyInput && (
        <CommentInput
          onSubmit={(text) => {
            onReply(comment.id, text);
            setShowReplyInput(false);
          }}
          placeholder={`Reply to ${comment.author}...`}
          mentionableUsers={mentionableUsers}
        />
      )}
      {comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              onAddReaction={onAddReaction}
              onResolve={onResolve}
              currentUser={currentUser}
              mentionableUsers={mentionableUsers}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentThread({
  comments,
  onAddComment,
  onAddReaction,
  onResolve,
  currentUser,
  mentionableUsers
}: CommentThreadProps) {
  return (
    <div className="space-y-4">
      <CommentInput onSubmit={onAddComment} mentionableUsers={mentionableUsers} />
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={onAddComment}
            onAddReaction={onAddReaction}
            onResolve={onResolve}
            currentUser={currentUser}
            mentionableUsers={mentionableUsers}
          />
        ))}
      </div>
    </div>
  );
}


