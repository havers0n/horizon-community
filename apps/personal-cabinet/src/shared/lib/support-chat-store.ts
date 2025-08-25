import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface SupportChatState {
  isChatOpen: boolean
  activeTicketId: string | null
}

interface SupportChatActions {
  openChat: (ticketId: string) => void
  closeChat: () => void
  setActiveTicketId: (ticketId: string | null) => void
}

type SupportChatStore = SupportChatState & SupportChatActions

export const useSupportChatStore = create<SupportChatStore>()(
  devtools(
    (set) => ({
      // Начальное состояние
      isChatOpen: false,
      activeTicketId: null,

      // Действия
      openChat: (ticketId: string) => {
        set({ isChatOpen: true, activeTicketId: ticketId })
      },

      closeChat: () => {
        set({ isChatOpen: false, activeTicketId: null })
      },

      setActiveTicketId: (ticketId: string | null) => {
        set({ activeTicketId: ticketId })
      },
    }),
    {
      name: 'support-chat-store',
    }
  )
)
