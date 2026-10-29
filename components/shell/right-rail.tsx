"use client"

import * as React from "react"
import { ActivityItem } from "@/components/ds/activity-item"
import { TutorialCard, type TutorialStepItem } from "@/components/ds/tutorial-card"
import { WhassDock } from "@/components/ds/whass-dock"
import { notify } from "@/components/ds/toast"

export type RailActivity = {
  actor: string
  message: string
  time: string
  unread?: boolean
}

/**
 * Colonne de droite de l'application (Figma · Right rail, 400 px) : tutoriel
 * contextuel, fil d'activités et dock Whass IA ancré en bas. Visible dès
 * 1280 px ; en dessous, le contenu occupe toute la largeur.
 *
 * Le tutoriel est propre à chaque page : le layout reçoit ici celui de
 * l'écran courant.
 */
export function RightRail({
  tutorial,
  activities,
}: {
  tutorial?: { title: string; steps: TutorialStepItem[] }
  activities: RailActivity[]
}) {
  return (
    <aside
      data-slot="right-rail"
      aria-label="Tutoriel, activités et assistant"
      className="sticky top-15 hidden h-[calc(100svh-3.75rem)] w-85 shrink-0 flex-col gap-6 overflow-y-auto border-l border-border-default bg-surface px-5 pt-8 pb-6 xl:flex 2xl:w-100"
    >
      {tutorial && <TutorialCard title={tutorial.title} steps={tutorial.steps} />}

      <section aria-labelledby="rail-activities" className="flex flex-col gap-0.5">
        <header className="flex items-center px-2 pb-1.5">
          <h2
            id="rail-activities"
            className="flex-1 text-overline text-text-tertiary uppercase"
          >
            Activités
          </h2>
          <button
            type="button"
            className="rounded-sm text-body-medium text-brand outline-none hover:underline focus-visible:shadow-focus-ring"
          >
            Voir tout
          </button>
        </header>
        {activities.map((a) => (
          <ActivityItem
            key={`${a.actor}-${a.time}`}
            actor={a.actor}
            reference={a.actor}
            time={a.time}
            unread={a.unread}
          >
            {a.message}
          </ActivityItem>
        ))}
      </section>

      <WhassDock
        className="mt-auto"
        onSend={(message) =>
          notify({
            tone: "info",
            title: "Whass IA n’est pas encore branché",
            description: `Message reçu : « ${message} »`,
          })
        }
      />
    </aside>
  )
}
