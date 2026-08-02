import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = 'Search security logs, assets...' }) => {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        className="glass-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          paddingLeft: '44px',
          fontSize: '14px',
        }}
      />
      <Search
        size={16}
        color="hsl(var(--text-muted))"
        style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default SearchBar;
