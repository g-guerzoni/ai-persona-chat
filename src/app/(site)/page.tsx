"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConversationTab } from "@/components/features/conversation/ConversationTab"
import { Header } from "@/components/features/navigation/Header"
import { useAuth } from "@/hooks/useAuth"
import { apiClient } from "@/lib/api/client"
import { useState, useEffect } from "react"
import { SCENARIOS } from "@/data/scenarios"

export default function HomePage() {
  const { isAuthenticated, user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState(SCENARIOS[0]?.slug || "")
  const [cumulativeScores, setCumulativeScores] = useState({
    clarity: 0,
    friendly: 0,
    empathy: 0,
  })
  const [isLoadingScores, setIsLoadingScores] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return

    async function loadScores() {
      setIsLoadingScores(true)
      try {
        const { data, error } = await apiClient.getScores()

        if (error) {
          console.error("Failed to load scores:", error)
          return
        }

        if (data) {
          setCumulativeScores({
            clarity: data.best_scores.clarity,
            friendly: data.best_scores.friendly,
            empathy: data.best_scores.empathy,
          })
        }
      } catch (error) {
        console.error("Failed to load scores:", error)
      } finally {
        setIsLoadingScores(false)
      }
    }

    loadScores()
  }, [isAuthenticated])

  const handleScoreUpdate = (scores: { clarity: number; friendly: number; empathy: number }) => {
    setCumulativeScores((prev) => ({
      clarity: prev.clarity + scores.clarity,
      friendly: prev.friendly + scores.friendly,
      empathy: prev.empathy + scores.empathy,
    }))
  }

  return (
    <>
      <Header
        isAuthenticated={isAuthenticated}
        userName={user?.name}
        userAvatar={user?.avatar}
        gamificationScores={{
          square: cumulativeScores.clarity,
          diamond: cumulativeScores.friendly,
          circle: cumulativeScores.empathy,
        }}
        isLoadingScores={isLoadingScores}
        onLogout={logout}
      />
      <main id="main-content" className="relative flex min-h-[calc(100vh-80px)] flex-col">
        <h1 className="sr-only">AI Persona Chat - Customer Service Training</h1>
        <section
          className="flex items-center justify-center overflow-hidden p-6 px-4"
          aria-label="Conversation scenarios"
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex h-full max-h-full w-[95%] flex-col md:w-[1100px]"
          >
            <div className="w-full overflow-x-auto pb-2">
              <TabsList className="w-full md:w-fit" aria-label="Scenario navigation">
                {SCENARIOS.map((scenario) => (
                  <TabsTrigger
                    key={scenario.slug}
                    value={scenario.slug}
                    className="flex-1 md:flex-initial"
                  >
                    {scenario.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {SCENARIOS.map((scenario) => (
              <TabsContent
                key={scenario.slug}
                value={scenario.slug}
                className="m-0 flex h-full flex-col"
              >
                <ConversationTab
                  scenarioSlug={scenario.slug}
                  onScoreUpdate={handleScoreUpdate}
                  isAuthenticated={isAuthenticated}
                />
              </TabsContent>
            ))}
          </Tabs>
        </section>
      </main>
    </>
  )
}
