import { createContext, useContext, useState, type ReactNode } from 'react'

export type PanelType = 'settings' | 'notifications' | null

interface PanelContextValue {
  panel: PanelType
  openPanel:  (p: Exclude<PanelType, null>) => void
  closePanel: () => void
}

const PanelContext = createContext<PanelContextValue | null>(null)

export function PanelProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<PanelType>(null)
  return (
    <PanelContext.Provider value={{
      panel,
      openPanel:  (p) => setPanel(p),
      closePanel: ()  => setPanel(null),
    }}>
      {children}
    </PanelContext.Provider>
  )
}

export function usePanel(): PanelContextValue {
  const ctx = useContext(PanelContext)
  if (!ctx) throw new Error('usePanel must be used inside PanelProvider')
  return ctx
}
