import { useState, useRef, useEffect } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useTodoStore } from '../store/useTodoStore'
import { getTheme } from '../store/themes'
import { CircleCheck } from '../components/CircleCheck'
import { ColorPicker } from '../components/ColorPicker'

export function CardWindow({ listId }) {
  const { lists, settings, addItem, toggleItem, clearDone,
    setListColor, setListVisible } = useTodoStore()
  const lst = lists.find(l => l.id === listId)
  const theme = getTheme(settings.theme)
  const [input, setInput] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const inputRef = useRef(null)
  const win = getCurrentWindow()

  useEffect(() => { inputRef.current?.focus() }, [])

  if (!lst) return null

  const contentFont = `${settings.contentFontSize}px "${settings.contentFontEn}", "${settings.contentFontCn}", sans-serif`
  const titleFont = `bold ${settings.titleFontSize}px "${settings.titleFontEn}", "${settings.titleFontCn}", sans-serif`

  const handleClose = () => {
    setListVisible(listId, false)
    win.close()
  }

  const handleAdd = () => {
    if (!input.trim()) return
    addItem(listId, input.trim())
    setInput('')
  }

  const pickColor = () => {
    setShowMenu(false)
    setShowColorPicker(true)
  }

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'transparent' }}>
      <div style={{
        margin: 8,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: lst.color,
        borderRadius: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        {/* 标题栏 */}
        <div
          data-tauri-drag-region
          style={{
            display: 'flex', alignItems: 'center',
            padding: '0 6px 0 12px', height: 38,
            flexShrink: 0,
            background: 'rgba(0,0,0,0.04)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <span data-tauri-drag-region style={{
            flex: 1, font: titleFont,
            color: '#333', pointerEvents: 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {lst.name}
          </span>

          {/* ⋮ 菜单 */}
          <div style={{ position: 'relative' }}>
            <CardBtn onClick={e => { e.stopPropagation(); setShowMenu(v => !v) }}>⋮</CardBtn>
            {showMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setShowMenu(false)} />
                <div style={{
                  position: 'absolute', right: 0, top: '100%', zIndex: 10,
                  background: '#fff', border: '1px solid #e0e0e0',
                  borderRadius: 8, padding: 4, minWidth: 120,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                }}>
                  <MenuItem onClick={pickColor}>🎨 卡片颜色</MenuItem>
                  <div style={{ height: 1, background: '#eee', margin: '4px 0' }} />
                  <MenuItem onClick={() => { clearDone(listId); setShowMenu(false) }}>清除已完成</MenuItem>
                </div>
              </>
            )}
          </div>

          <CardBtn onClick={handleClose}>✕</CardBtn>
        </div>

        {/* 待办列表 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px 4px' }}>
          {lst.items.length === 0 && (
            <div style={{ textAlign: 'center', color: '#aaa', fontSize: 12, paddingTop: 20 }}>
              还没有待办，在下方输入添加
            </div>
          )}
          {lst.items.map(item => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'flex-start',
              gap: 8, padding: '4px 2px',
            }}>
              <div style={{ paddingTop: 2 }}>
                <CircleCheck
                  checked={item.done}
                  onChange={() => toggleItem(listId, item.id)}
                />
              </div>
              <span style={{
                flex: 1,
                font: contentFont,
                color: item.done ? '#aaa' : '#333',
                textDecoration: item.done ? 'line-through' : 'none',
                wordBreak: 'break-word',
                lineHeight: 1.5,
              }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>

        {/* 输入框 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 10px 8px',
          borderTop: '1px solid rgba(0,0,0,0.06)',
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="添加待办…"
            style={{
              flex: 1,
              border: 'none',
              borderBottom: '1px solid #ccc',
              background: 'transparent',
              padding: '3px 4px',
              font: contentFont,
              color: '#333',
              outline: 'none',
            }}
          />
          <button onClick={handleAdd} style={{
            background: 'transparent', border: 'none',
            fontSize: 20, color: '#999', cursor: 'pointer',
            lineHeight: 1, padding: '0 2px',
          }}>
            +
          </button>
        </div>

        {/* resize grip */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end',
          padding: '0 4px 3px',
        }}>
          <div
            data-tauri-drag-region
            style={{ width: 12, height: 12, cursor: 'se-resize',
              opacity: 0.3, fontSize: 10, color: '#333', userSelect: 'none' }}
          >
            ◢
          </div>
        </div>
      </div>
    </div>

    {/* 卡片颜色选择器 */}
    {showColorPicker && (
      <ColorPicker
        value={lst.color}
        onChange={c => setListColor(listId, c)}
        onClose={() => setShowColorPicker(false)}
      />
    )}
    </>
  )
}

function CardBtn({ onClick, children }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(0,0,0,0.08)' : 'transparent',
        border: 'none', borderRadius: 4,
        width: 28, height: 26,
        cursor: 'pointer', fontSize: 14, color: '#666',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
      }}
    >
      {children}
    </button>
  )
}

function MenuItem({ onClick, children }) {
  const [hov, setHov] = useState(false)
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '7px 14px', borderRadius: 5, cursor: 'pointer',
        fontSize: 13, color: '#333',
        background: hov ? '#f0f0f0' : 'transparent',
      }}
    >
      {children}
    </div>
  )
}
