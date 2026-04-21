import { create } from 'zustand'

type ModalType = 'alert' | 'confirm' | 'prompt'

interface ModalState {
  isOpen: boolean
  type: ModalType
  title: string
  message: string
  confirmText: string
  cancelText: string
  inputValue: string
  onConfirm: (value?: string) => void
  onCancel: () => void
  
  // Actions
  showAlert: (title: string, message: string) => void
  showConfirm: (title: string, message: string, onConfirm: () => void) => void
  showPrompt: (title: string, message: string, onConfirm: (val: string) => void) => void
  close: () => void
  setInputValue: (val: string) => void
}

export const useModalStore = create<ModalState>((set, get) => ({
  isOpen: false,
  type: 'alert',
  title: '',
  message: '',
  confirmText: 'OK',
  cancelText: 'Cancel',
  inputValue: '',
  onConfirm: () => {},
  onCancel: () => {},

  showAlert: (title, message) => set({
    isOpen: true,
    type: 'alert',
    title,
    message,
    confirmText: 'OK',
    onConfirm: () => get().close(),
    inputValue: ''
  }),

  showConfirm: (title, message, onConfirm) => set({
    isOpen: true,
    type: 'confirm',
    title,
    message,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {
      onConfirm()
      get().close()
    },
    inputValue: ''
  }),

  showPrompt: (title, message, onConfirm) => set({
    isOpen: true,
    type: 'prompt',
    title,
    message,
    confirmText: 'Submit',
    cancelText: 'Cancel',
    onConfirm: (val) => {
      onConfirm(val as string)
      get().close()
    },
    inputValue: ''
  }),

  close: () => set({ isOpen: false }),
  setInputValue: (val) => set({ inputValue: val })
}))
