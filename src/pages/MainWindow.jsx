import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { isEnabled, enable, disable } from '@tauri-apps/plugin-autostart'
import { useTodoStore } from '../store/useTodoStore'
import { getTheme, THEMES } from '../store/themes'
import { TitleBar } from '../components/TitleBar'
import { ColorPicker } from '../components/ColorPicker'

export function MainWindow() {
  const { lists, settings, createList, deleteList, renameList,
    setTagColor, updateSettings } = useTodoStore()
  const theme = getTheme(settings.theme)

  const [autostart, setAutostart] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [contextMenu, setContextMenu] = useState(null) // {x,y,listId}
  const [colorPicker, setColorPicker] = useState(null) // {listId}
  const [renaming, setRenaming] = useState(null) // listId
  const [renameVal, setRenameVal] = useState('')
  const [newListName, setNewListName] = useState('')
  const [showNewInput, setShowNewInput] = useState(false)

  useEffect(() => {
    isEnabled().then(setAutostart).catch(() => { })
  }, [])

  const toggleAutostart = async () => {
    if (autostart) { await disable(); setAutostart(false) }
    else { await enable(); setAutostart(true) }
  }

  const openCard = (listId) => {
    invoke('open_card_window', { listId })
    useTodoStore.getState().setListVisible(listId, true)
  }

  const handleCreateList = () => {
    if (!newListName.trim()) return
    const lst = createList(newListName.trim())
    setNewListName('')
    setShowNewInput(false)
    openCard(lst.id)
  }

  const handleContextMenu = (e, listId) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, listId })
  }

  const closeContextMenu = () => setContextMenu(null)

  const startRename = (listId) => {
    const lst = lists.find(l => l.id === listId)
    setRenaming(listId)
    setRenameVal(lst?.name || '')
    setContextMenu(null)
  }

  const confirmRename = () => {
    if (renaming && renameVal.trim()) {
      renameList(renaming, renameVal.trim())
    }
    setRenaming(null)
  }

  const menuFont = `${settings.menuFontSize}px "${settings.menuFontEn}", "${settings.menuFontCn}", sans-serif`

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', height: '100vh',
        background: 'transparent' }}
      onClick={closeContextMenu}
    >
      {/* 外层圆角卡片 */}
      <div style={{
        margin: 10,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: theme.bg,
        borderRadius: 10,
        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        {/* 标题栏 */}
        <TitleBar
          title="📋  FloatTodo"
          theme={theme}
          extra={
            <div style={{ display: 'flex', gap: 6, marginRight: 8 }}>
              {/* 主题按钮 */}
              <div style={{ position: 'relative' }}>
                <MenuBtn theme={theme} onClick={e => { e.stopPropagation(); setShowThemeMenu(v => !v); setShowSettings(false) }}>
                  外观
                </MenuBtn>
                {showThemeMenu && (
                  <DropMenu theme={theme} onClose={() => setShowThemeMenu(false)}>
                    {Object.entries(THEMES).map(([key, t]) => (
                      <DropItem key={key} theme={theme}
                        active={settings.theme === key}
                        onClick={() => { updateSettings({ theme: key }); setShowThemeMenu(false) }}>
                        {t.name}
                      </DropItem>
                    ))}
                    <div style={{ height: 1, background: theme.border, margin: '4px 0' }} />
                    <DropItem theme={theme} onClick={() => { setShowSettings(true); setShowThemeMenu(false) }}>
                      字体设置…
                    </DropItem>
                    <div style={{ height: 1, background: theme.border, margin: '4px 0' }} />
                    <DropItem theme={theme} onClick={toggleAutostart}>
                      {autostart ? '✓ ' : ''}开机自启动
                    </DropItem>
                  </DropMenu>
                )}
              </div>
            </div>
          }
        />

        {/* 菜单栏下分隔线 + 新建按钮行 */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '8px 14px',
          borderBottom: `1px solid ${theme.border}`,
          background: theme.cardBg,
          gap: 8,
        }}>
          <span style={{ flex: 1, fontSize: 12, color: theme.subtext }}>
            {lists.length} 个列表
          </span>
          <button
            onClick={() => setShowNewInput(v => !v)}
            style={{
              background: theme.accent, color: 'white',
              border: 'none', borderRadius: 6,
              padding: '4px 14px', fontSize: 12,
              cursor: 'pointer', fontFamily: menuFont,
            }}>
            ＋ 新建列表
          </button>
        </div>

        {/* 新建输入框 */}
        {showNewInput && (
          <div style={{ padding: '8px 14px', background: theme.cardBg,
            borderBottom: `1px solid ${theme.border}` }}>
            <input
              autoFocus
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreateList(); if (e.key === 'Escape') setShowNewInput(false) }}
              placeholder="列表名称，按 Enter 确认"
              style={{
                width: '100%', boxSizing: 'border-box',
                border: `1px solid ${theme.accent}`,
                borderRadius: 6, padding: '6px 10px',
                background: theme.bg, color: theme.text,
                fontSize: 13, outline: 'none',
                fontFamily: menuFont,
              }}
            />
          </div>
        )}

        {/* 列表区 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {lists.length === 0 ? (
            <div style={{ textAlign: 'center', color: theme.subtext, fontSize: 12, padding: 40 }}>
              还没有列表，点击上方"＋ 新建列表"开始
            </div>
          ) : (
            lists.map(lst => (
              <ListCard
                key={lst.id}
                lst={lst}
                theme={theme}
                menuFont={menuFont}
                renaming={renaming === lst.id}
                renameVal={renameVal}
                onRenameChange={setRenameVal}
                onRenameConfirm={confirmRename}
                onContextMenu={handleContextMenu}
                onOpen={() => openCard(lst.id)}
                onDelete={() => deleteList(lst.id)}
              />
            ))
          )}
        </div>

        {/* 底部提示 */}
        <div style={{
          height: 26, display: 'flex', alignItems: 'center',
          padding: '0 14px',
          background: theme.cardBg,
          borderRadius: '0 0 10px 10px',
          borderTop: `1px solid ${theme.border}`,
        }}>
          <span style={{ fontSize: 10, color: theme.subtext }}>
            Ctrl+Alt+T 显示/隐藏
          </span>
        </div>
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x} y={contextMenu.y}
          theme={theme}
          onClose={closeContextMenu}
          items={[
            { label: '打开', onClick: () => { openCard(contextMenu.listId); closeContextMenu() } },
            { label: '重命名', onClick: () => startRename(contextMenu.listId) },
            { label: '标签颜色', onClick: () => { setColorPicker({ listId: contextMenu.listId }); closeContextMenu() } },
            { separator: true },
            { label: '删除', danger: true, onClick: () => { deleteList(contextMenu.listId); closeContextMenu() } },
          ]}
        />
      )}

      {/* 标签颜色选择器 */}
      {colorPicker && (
        <ColorPicker
          theme={theme}
          value={lists.find(l => l.id === colorPicker.listId)?.tagColor || '#C8824A'}
          onChange={c => setTagColor(colorPicker.listId, c)}
          onClose={() => setColorPicker(null)}
        />
      )}

      {/* 字体设置弹窗 */}
      {showSettings && (
        <FontDialog theme={theme} settings={settings} updateSettings={updateSettings}
          onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}

// ── 列表卡片行 ────────────────────────────────────────────────
function ListCard({ lst, theme, menuFont, renaming, renameVal,
  onRenameChange, onRenameConfirm, onContextMenu, onOpen, onDelete }) {
  const done = lst.items.filter(i => i.done).length
  const total = lst.items.length

  return (
    <div
      onContextMenu={e => onContextMenu(e, lst.id)}
      style={{
        display: 'flex', alignItems: 'stretch',
        background: theme.cardBg,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        overflow: 'hidden',
        minHeight: 46,
      }}
    >
      {/* 彩色左条 */}
      <div style={{ width: 5, background: lst.tagColor, flexShrink: 0 }} />

      {/* 内容 */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 10px 0 12px', gap: 8 }}>
        {renaming ? (
          <input
            autoFocus
            value={renameVal}
            onChange={e => onRenameChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') onRenameConfirm() }}
            onBlur={onRenameConfirm}
            style={{
              flex: 1, border: `1px solid ${theme.accent}`,
              borderRadius: 4, padding: '2px 6px',
              background: theme.bg, color: theme.text,
              fontSize: 13, outline: 'none', fontFamily: menuFont,
            }}
          />
        ) : (
          <span style={{ flex: 1, color: theme.text, fontSize: settings_font(menuFont), fontFamily: menuFont }}>
            {lst.name}
          </span>
        )}
        <span style={{ fontSize: 11, color: theme.subtext, minWidth: 32, textAlign: 'right' }}>
          {done}/{total}
        </span>
        <button onClick={onOpen} style={{
          background: theme.accent, color: 'white',
          border: 'none', borderRadius: 5,
          padding: '3px 12px', fontSize: 12, cursor: 'pointer',
        }}>
          打开
        </button>
        <button onClick={onDelete} style={{
          background: 'transparent', border: 'none',
          color: theme.subtext, fontSize: 14, cursor: 'pointer',
          padding: '0 2px', lineHeight: 1,
        }}>
          ✕
        </button>
      </div>
    </div>
  )
}

function settings_font(f) { return 13 } // 占位，实际用 menuFont 里的 size

// ── 工具组件 ──────────────────────────────────────────────────
function MenuBtn({ theme, onClick, children }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? theme.border : 'transparent',
        color: theme.text, border: 'none',
        borderRadius: 4, padding: '2px 10px',
        fontSize: 13, cursor: 'pointer',
        transition: 'background 0.15s',
      }}
    >
      {children}
    </button>
  )
}

function DropMenu({ theme, children, onClose }) {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={onClose} />
      <div style={{
        position: 'absolute', top: '100%', left: 0, zIndex: 100,
        background: theme.menuBg, border: `1px solid ${theme.border}`,
        borderRadius: 8, padding: '4px', minWidth: 130,
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      }}>
        {children}
      </div>
    </>
  )
}

function DropItem({ theme, active, danger, onClick, children }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '7px 14px', borderRadius: 5, cursor: 'pointer',
        fontSize: 13, color: danger ? '#e00' : (active ? theme.accent : theme.text),
        background: hov ? theme.border : 'transparent',
        transition: 'background 0.1s',
      }}
    >
      {children}
    </div>
  )
}

function ContextMenu({ x, y, theme, items, onClose }) {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={onClose} />
      <div style={{
        position: 'fixed', left: x, top: y, zIndex: 200,
        background: theme.menuBg, border: `1px solid ${theme.border}`,
        borderRadius: 8, padding: 4, minWidth: 130,
        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
      }}>
        {items.map((item, i) =>
          item.separator
            ? <div key={i} style={{ height: 1, background: theme.border, margin: '4px 0' }} />
            : <DropItem key={i} theme={theme} danger={item.danger} onClick={item.onClick}>
                {item.label}
              </DropItem>
        )}
      </div>
    </>
  )
}


// ── 字体设置弹窗 ──────────────────────────────────────────────
function FontDialog({ theme, settings, updateSettings, onClose }) {
  const [s, setS] = useState({ ...settings })
  const apply = () => { updateSettings(s); onClose() }

  const sections = [
    { label: '主菜单', cnKey: 'menuFontCn', enKey: 'menuFontEn', sizeKey: 'menuFontSize' },
    { label: '便签标题', cnKey: 'titleFontCn', enKey: 'titleFontEn', sizeKey: 'titleFontSize' },
    { label: '便签内容', cnKey: 'contentFontCn', enKey: 'contentFontEn', sizeKey: 'contentFontSize' },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300,
    }} onClick={onClose}>
      <div style={{
        background: theme.bg, borderRadius: 12, padding: 24,
        minWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 'bold', color: theme.text, marginBottom: 16 }}>字体设置</div>

        {sections.map(sec => (
          <div key={sec.label} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: theme.subtext, marginBottom: 8, fontWeight: 'bold' }}>{sec.label}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <label style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: theme.subtext, marginBottom: 3 }}>西文字体</div>
                <input value={s[sec.enKey]} onChange={e => setS(p => ({ ...p, [sec.enKey]: e.target.value }))}
                  style={inputStyle(theme)} />
              </label>
              <label style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: theme.subtext, marginBottom: 3 }}>中文字体</div>
                <input value={s[sec.cnKey]} onChange={e => setS(p => ({ ...p, [sec.cnKey]: e.target.value }))}
                  style={inputStyle(theme)} />
              </label>
              <label style={{ width: 70 }}>
                <div style={{ fontSize: 11, color: theme.subtext, marginBottom: 3 }}>字号</div>
                <input type="number" min="8" max="36" value={s[sec.sizeKey]}
                  onChange={e => setS(p => ({ ...p, [sec.sizeKey]: +e.target.value }))}
                  style={{ ...inputStyle(theme), width: '100%' }} />
              </label>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <button onClick={onClose} style={btnStyle(theme, false)}>取消</button>
          <button onClick={apply} style={btnStyle(theme, true)}>确定</button>
        </div>
      </div>
    </div>
  )
}

const inputStyle = (t) => ({
  width: '100%', boxSizing: 'border-box',
  border: `1px solid ${t.border}`, borderRadius: 6,
  padding: '5px 8px', background: t.cardBg, color: t.text,
  fontSize: 12, outline: 'none',
})

const btnStyle = (t, primary) => ({
  padding: '6px 18px', borderRadius: 6, border: 'none',
  background: primary ? t.accent : t.border,
  color: primary ? 'white' : t.text,
  cursor: 'pointer', fontSize: 13,
})
