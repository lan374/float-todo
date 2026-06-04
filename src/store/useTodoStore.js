import { create } from 'zustand'
import { load } from '@tauri-apps/plugin-store'

let tauriStore = null

async function getStore() {
  if (!tauriStore) {
    tauriStore = await load('floattodo.json', { autoSave: true })
  }
  return tauriStore
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export const useTodoStore = create((set, get) => ({
  lists: [],
  settings: {
    theme: 'warm',
    menuFontCn: '宋体',
    menuFontEn: 'Arial',
    menuFontSize: 13,
    titleFontCn: '宋体',
    titleFontEn: 'Arial',
    titleFontSize: 14,
    contentFontCn: '宋体',
    contentFontEn: 'Arial',
    contentFontSize: 13,
  },

  // ── 初始化 ────────────────────────────────────────────────
  init: async () => {
    const s = await getStore()
    const lists = await s.get('lists') || []
    const settings = await s.get('settings') || get().settings
    set({ lists, settings: { ...get().settings, ...settings } })
  },

  _save: async () => {
    const s = await getStore()
    const { lists, settings } = get()
    await s.set('lists', lists)
    await s.set('settings', settings)
  },

  // ── 列表操作 ──────────────────────────────────────────────
  createList: (name) => {
    const newList = {
      id: genId(),
      name,
      items: [],
      color: '#FFFDE7',
      tagColor: '#C8824A',
      visible: false,
      posX: null,
      posY: null,
    }
    set(s => ({ lists: [...s.lists, newList] }))
    get()._save()
    return newList
  },

  deleteList: (id) => {
    set(s => ({ lists: s.lists.filter(l => l.id !== id) }))
    get()._save()
  },

  renameList: (id, name) => {
    set(s => ({
      lists: s.lists.map(l => l.id === id ? { ...l, name } : l)
    }))
    get()._save()
  },

  setListColor: (id, color) => {
    set(s => ({
      lists: s.lists.map(l => l.id === id ? { ...l, color } : l)
    }))
    get()._save()
  },

  setTagColor: (id, tagColor) => {
    set(s => ({
      lists: s.lists.map(l => l.id === id ? { ...l, tagColor } : l)
    }))
    get()._save()
  },

  setListVisible: (id, visible) => {
    set(s => ({
      lists: s.lists.map(l => l.id === id ? { ...l, visible } : l)
    }))
    get()._save()
  },

  // ── 待办项操作 ────────────────────────────────────────────
  addItem: (listId, text) => {
    const item = { id: genId(), text, done: false }
    set(s => ({
      lists: s.lists.map(l =>
        l.id === listId ? { ...l, items: [...l.items, item] } : l
      )
    }))
    get()._save()
  },

  toggleItem: (listId, itemId) => {
    set(s => ({
      lists: s.lists.map(l => {
        if (l.id !== listId) return l
        const items = l.items.map(i =>
          i.id === itemId ? { ...i, done: !i.done } : i
        )
        // 未完成在前，已完成在后
        items.sort((a, b) => a.done - b.done)
        return { ...l, items }
      })
    }))
    get()._save()
  },

  clearDone: (listId) => {
    set(s => ({
      lists: s.lists.map(l =>
        l.id === listId ? { ...l, items: l.items.filter(i => !i.done) } : l
      )
    }))
    get()._save()
  },

  // ── 设置 ──────────────────────────────────────────────────
  updateSettings: (patch) => {
    set(s => ({ settings: { ...s.settings, ...patch } }))
    get()._save()
  },
}))
