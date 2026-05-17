import { create } from 'zustand'

export const useChatStore = create((set) => ({
  messages: [],
  location: localStorage.getItem('drivelegal_location') || 'National',
  isOnline: navigator.onLine,

  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg]
    })),

  setLocation: (loc) => {
    set({ location: loc })
    localStorage.setItem('drivelegal_location', loc)
  },

  setOnlineStatus: (val) =>
    set({ isOnline: val }),

  clearMessages: () =>
    set({ messages: [] })
}))