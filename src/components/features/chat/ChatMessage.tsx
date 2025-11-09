export type MessageType = "user" | "ai"

export interface ChatMessageProps {
  content: string
  type: MessageType
}

export function ChatMessage({ content, type }: ChatMessageProps) {
  const isUser = type === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  )
}
