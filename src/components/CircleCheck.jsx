export function CircleCheck({ checked, onChange }) {
  return (
    <svg
      width="16" height="16"
      viewBox="0 0 16 16"
      style={{ cursor: 'pointer', flexShrink: 0 }}
      onClick={() => onChange(!checked)}
    >
      <circle
        cx="8" cy="8" r="6.5"
        fill="none"
        stroke="#555"
        strokeWidth="1.5"
      />
      {checked && (
        <polyline
          points="4.5,8.5 7,11 11.5,5"
          fill="none"
          stroke="#555"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}
