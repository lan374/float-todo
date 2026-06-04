import { useState, useRef, useEffect } from 'react'

// 预设色板
const PRESETS = [
  // 暖色系
  '#FFFDE7', '#FFF8E1', '#FFF3E0', '#FBE9E7', '#FCE4EC',
  '#F3E5F5', '#EDE7F6', '#E8EAF6', '#E3F2FD', '#E0F2F1',
  // 纯色系
  '#FFCDD2', '#F8BBD0', '#E1BEE7', '#C5CAE9', '#BBDEFB',
  '#B2EBF2', '#C8E6C9', '#DCEDC8', '#FFF9C4', '#FFE0B2',
  // 深色系
  '#EF9A9A', '#F48FB1', '#CE93D8', '#9FA8DA', '#90CAF9',
  '#80DEEA', '#A5D6A7', '#C5E1A5', '#FFF176', '#FFCC80',
  // 中性
  '#FFFFFF', '#F5F5F5', '#EEEEEE', '#E0E0E0', '#BDBDBD',
  '#9E9E9E', '#757575', '#2E2E2E', '#1A1A1A', '#000000',
]

export function ColorPicker({ value, onChange, onClose, theme }) {
  const [hex, setHex] = useState(value || '#FFFDE7')
  const [hexInput, setHexInput] = useState(value || '#FFFDE7')
  const [error, setError] = useState(false)
  const nativeRef = useRef(null)

  // 同步外部 value
  useEffect(() => {
    setHex(value)
    setHexInput(value)
  }, [value])

  const isValidHex = (h) => /^#[0-9A-Fa-f]{6}$/.test(h)

  const selectColor = (c) => {
    setHex(c)
    setHexInput(c)
    setError(false)
  }

  const handleHexInput = (e) => {
    let v = e.target.value
    if (!v.startsWith('#')) v = '#' + v
    setHexInput(v)
    if (isValidHex(v)) {
      setHex(v)
      setError(false)
    } else {
      setError(true)
    }
  }

  const handleConfirm = () => {
    if (isValidHex(hex)) {
      onChange(hex)
      onClose()
    }
  }

  const t = theme || {
    bg: '#fff', cardBg: '#fff', border: '#e0e0e0',
    text: '#333', subtext: '#888', accent: '#C8824A',
  }

  return (
    <>
      {/* 遮罩 */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 499 }}
        onClick={onClose}
      />

      {/* 面板 */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 500,
          background: t.bg,
          border: `1px solid ${t.border}`,
          borderRadius: 12,
          padding: 16,
          width: 260,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        }}
      >
        {/* 标题 */}
        <div style={{
          fontSize: 13, fontWeight: 'bold',
          color: t.text, marginBottom: 12,
        }}>
          选择颜色
        </div>

        {/* 预览条 */}
        <div style={{
          height: 32, borderRadius: 6,
          background: isValidHex(hex) ? hex : t.cardBg,
          border: `1px solid ${t.border}`,
          marginBottom: 12,
          transition: 'background 0.15s',
        }} />

        {/* 预设色板 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 1fr)',
          gap: 4,
          marginBottom: 12,
        }}>
          {PRESETS.map(c => (
            <div
              key={c}
              onClick={() => selectColor(c)}
              title={c}
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: 4,
                background: c,
                border: hex === c
                  ? `2px solid ${t.accent}`
                  : `1px solid ${t.border}`,
                cursor: 'pointer',
                transition: 'transform 0.1s, border 0.1s',
                boxSizing: 'border-box',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
          ))}
        </div>

        {/* Hex 输入 + 取色盘 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              value={hexInput}
              onChange={handleHexInput}
              maxLength={7}
              placeholder="#RRGGBB"
              style={{
                width: '100%',
                border: `1px solid ${error ? '#e00' : t.border}`,
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: 13,
                fontFamily: 'monospace',
                background: t.cardBg,
                color: t.text,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {error && (
              <span style={{
                position: 'absolute', right: 6, top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 10, color: '#e00',
              }}>
                格式错误
              </span>
            )}
          </div>

          {/* 原生取色盘按钮 */}
          <div
            title="打开系统取色盘"
            onClick={() => nativeRef.current?.click()}
            style={{
              width: 32, height: 32,
              borderRadius: 6,
              border: `1px solid ${t.border}`,
              background: isValidHex(hex) ? hex : '#fff',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            🎨
          </div>
          <input
            ref={nativeRef}
            type="color"
            value={isValidHex(hex) ? hex : '#ffffff'}
            onChange={e => selectColor(e.target.value)}
            style={{ display: 'none' }}
          />
        </div>

        {/* 按钮 */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px', borderRadius: 6,
              border: `1px solid ${t.border}`,
              background: 'transparent', color: t.text,
              cursor: 'pointer', fontSize: 13,
            }}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValidHex(hex)}
            style={{
              padding: '6px 16px', borderRadius: 6,
              border: 'none',
              background: isValidHex(hex) ? t.accent : t.border,
              color: 'white',
              cursor: isValidHex(hex) ? 'pointer' : 'not-allowed',
              fontSize: 13,
            }}
          >
            确定
          </button>
        </div>
      </div>
    </>
  )
}
