import { ChatMessage, type ChatMessageProps } from "./ChatMessage"
import { useEffect, useRef } from "react"

export interface ChatMessageListProps {
  messages: ChatMessageProps[]
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div
      ref={scrollRef}
      className="flex h-[300px] flex-col gap-4 overflow-x-hidden overflow-y-auto p-4"
    >
      {messages.length === 0 ? (
        <div className="text-muted-foreground flex flex-1 items-center justify-center text-center">
          <p>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        messages.map((message, index) => <ChatMessage key={index} {...message} />)
      )}
    </div>
  )
}
