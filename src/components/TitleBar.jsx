import { getCurrentWindow } from '@tauri-apps/api/window'
import { useState } from 'react'

export function TitleBar({ title, theme, extra }) {
  const win = getCurrentWindow()
  const [isMax, setIsMax] = useState(false)

  const handleMax = async () => {
    const maximized = await win.isMaximized()
    if (maximized) { await win.unmaximize(); setIsMax(false) }
    else { await win.maximize(); setIsMax(true) }
  }

  return (
    <div
      data-tauri-drag-region
      style={{
        height: 40,
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px 0 14px',
        background: theme.cardBg,
        borderRadius: '10px 10px 0 0',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      <span style={{
        flex: 1,
        fontWeight: 'bold',
        fontSize: 14,
        color: theme.text,
        pointerEvents: 'none',
      }}>
        {title}
      </span>

      {extra}

      {/* 窗口控制按钮 */}
      <div style={{ display: 'flex', gap: 2 }}>
        <WinBtn onClick={() => win.minimize()} hoverBg='rgba(0,0,0,0.08)'>─</WinBtn>
        <WinBtn onClick={handleMax} hoverBg='rgba(0,0,0,0.08)'>{isMax ? '❐' : '□'}</WinBtn>
        <WinBtn onClick={() => win.hide()} hoverBg='#e81123' hoverColor='white'>✕</WinBtn>
      </div>
    </div>
  )
}

function WinBtn({ children, onClick, hoverBg, hoverColor }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 32, height: 26,
        border: 'none',
        background: hovered ? hoverBg : 'transparent',
        color: hovered && hoverColor ? hoverColor : '#888',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: 13,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
      }}
    >
      {children}
    </button>
  )
}
