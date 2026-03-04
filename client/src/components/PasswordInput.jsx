import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({ style = {}, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-block', width: style.width || '100%' }}>
      <input
        type={show ? 'text' : 'password'}
        {...props}
        style={{
          ...style,
          width: '100%',
          paddingRight: 40,
          boxSizing: 'border-box',
        }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute',
          right: 12,
          top: 0,
          bottom: 0,
          margin: 'auto 0',
          height: 24,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
