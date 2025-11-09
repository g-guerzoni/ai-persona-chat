export type MessageType = "user" | "ai"

export interface ChatMessageProps {
  content: string
  type: MessageType
  scores?: {
    clarity: number
    friendly: number
    empathy: number
  }
}

// Get the highest positive score category and its value
function getHighestScore(scores: { clarity: number; friendly: number; empathy: number }) {
  const entries = [
    { name: "clarity", value: scores.clarity, color: "oklch(0.65 0.22 60)" },
    { name: "friendly", value: scores.friendly, color: "oklch(0.7 0.2 140)" },
    { name: "empathy", value: scores.empathy, color: "oklch(0.65 0.22 180)" },
  ]

  // Filter positive scores and get the highest
  const positiveScores = entries.filter((e) => e.value > 0)
  if (positiveScores.length === 0) return null

  return positiveScores.reduce((max, current) => (current.value > max.value ? current : max))
}

export function ChatMessage({ content, type, scores }: ChatMessageProps) {
  const isUser = type === "user"
  const highestScore = scores && isUser ? getHighestScore(scores) : null
  const messageLabel = isUser ? "Your message" : "AI response"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <article
        className={`relative max-w-[80%] rounded-lg p-4 ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        }`}
        style={{
          borderWidth: highestScore ? "2px" : undefined,
          borderStyle: highestScore ? "solid" : undefined,
          borderColor: highestScore ? highestScore.color : undefined,
        }}
        aria-label={
          highestScore
            ? `${messageLabel} with ${highestScore.name} score of ${highestScore.value}`
            : messageLabel
        }
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        {highestScore && (
          <span
            className="absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-xs font-bold"
            style={{
              backgroundColor: highestScore.color,
              color: "white",
            }}
            role="status"
            aria-label={`${highestScore.name} score: plus ${highestScore.value}`}
          >
            +{highestScore.value}
          </span>
        )}
      </article>
    </div>
  )
}
