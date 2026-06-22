'use client';

import React, { useState } from 'react';

// Icons in /public/icons/ that are NOT used as app UI icons
// Excluded: kawaii-coffee, schedule, gear, kawaii-folders, add, tasks, last-24-hours, error, high-importance
export const BOARD_ICONS = [
  { label: 'Birthday',     src: '/icons/icons8-birthday-100.png' },
  { label: 'Coffee Maker', src: '/icons/icons8-coffee-maker-100.png' },
  { label: 'Confetti',     src: '/icons/icons8-confetti-100.png' },
  { label: 'Done',         src: '/icons/icons8-done-100.png' },
  { label: 'Edit',         src: '/icons/icons8-edit-pencil-100.png' },
  { label: 'Email',        src: '/icons/icons8-email-100.png' },
  { label: 'Home',         src: '/icons/icons8-home-100.png' },
  { label: 'Hourglass',    src: '/icons/icons8-hourglass-100.png' },
  { label: 'Iced Coffee',  src: '/icons/icons8-iced-coffee-100.png' },
  { label: 'Phone',        src: '/icons/icons8-phone-100.png' },
  { label: 'Time Machine', src: '/icons/icons8-time-machine-100.png' },
];

const EMOJI_CATEGORIES = [
  { label: '⭐ Faves',    emojis: ['⭐','🎯','🏆','✅','💡','🔥','💎','🚀','🎉','❤️','🌟','✨','💫','🎊'] },
  { label: '💼 Work',     emojis: ['💼','📊','📈','📉','💻','🖥️','📝','✏️','📌','📎','🗂️','📁','📂','🗒️','📋','🖊️','📐','⌨️','🗃️','📤'] },
  { label: '📚 Study',    emojis: ['📚','🎓','🔬','🧪','🧲','🔭','🧮','📖','📗','📘','📙','🖍️','🧑‍💻','💭','🧠'] },
  { label: '🎨 Creative', emojis: ['🎨','🎭','🎬','🎵','🎸','📸','🖼️','✍️','🎤','🎹','🎺','🎻','🥁','🎮','🕹️'] },
  { label: '🏠 Life',     emojis: ['🏠','🌈','🦋','🌺','🌻','🌸','🌿','🌱','🍀','☕','🍕','🎂','🍎','🥗','🧁','🫖','🍵','🧋'] },
  { label: '💪 Health',   emojis: ['💪','🏃','🧘','🏋️','⚽','🎾','🏊','🚴','🧗','🥊','🏅','🥇','🩺','💊','🧬'] },
  { label: '✈️ Travel',   emojis: ['✈️','🌍','🗺️','🏝️','🏔️','🚗','🚀','🚂','⛵','🏕️','🗼','🗽','🌉','🏙️'] },
  { label: '🌙 Misc',     emojis: ['🌙','☀️','⛅','🌊','🦄','🐱','🐶','🦊','🐻','🦁','🐼','🌵','🍄','⚡','🌀'] },
];

type Tab = 'emoji' | 'icon';

interface EmojiIconPickerProps {
  value?: string;
  onChange: (value: string) => void;
}

export function isIconPath(v: string) { return v.startsWith('/icons/'); }

export const EmojiIconPicker: React.FC<EmojiIconPickerProps> = ({ value, onChange }) => {
  const [tab, setTab]         = useState<Tab>('emoji');
  const [catIdx, setCatIdx]   = useState(0);

  return (
    <div className="w-full select-none">
      {/* Tabs */}
      <div className="flex border-b mb-2">
        {(['emoji', 'icon'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-1.5 text-[11px] font-semibold transition-colors ${
              tab === t ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t === 'emoji' ? '😊 Emojis' : '🖼️ Icons'}
          </button>
        ))}
      </div>

      {tab === 'emoji' && (
        <>
          {/* Category pills */}
          <div className="flex gap-1 overflow-x-auto pb-1.5 mb-2" style={{ scrollbarWidth: 'none' }}>
            {EMOJI_CATEGORIES.map((cat, i) => (
              <button key={cat.label} onClick={() => setCatIdx(i)}
                className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                  catIdx === i ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {/* Emoji grid */}
          <div className="grid grid-cols-8 gap-0.5 max-h-28 overflow-y-auto">
            {EMOJI_CATEGORIES[catIdx].emojis.map((e) => (
              <button key={e} onClick={() => onChange(e)}
                className={`text-xl p-1 rounded-lg hover:bg-gray-100 transition-colors leading-none ${
                  value === e ? 'bg-blue-100 ring-1 ring-blue-400' : ''
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </>
      )}

      {tab === 'icon' && (
        <div className="grid grid-cols-5 gap-2 max-h-44 overflow-y-auto">
          {BOARD_ICONS.map((icon) => (
            <button key={icon.src} title={icon.label} onClick={() => onChange(icon.src)}
              className={`p-2 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors ${
                value === icon.src ? 'bg-blue-100 ring-1 ring-blue-400' : ''
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={icon.src} alt={icon.label} className="w-8 h-8 object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/** Renders either an emoji or an icons8 PNG at the given size */
export const EmojiDisplay: React.FC<{ value: string; size?: number; className?: string }> = ({
  value, size = 24, className = '',
}) => {
  if (isIconPath(value)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={value} alt="" className={className} style={{ width: size, height: size, objectFit: 'contain' }} />;
  }
  return <span style={{ fontSize: size * 0.9, lineHeight: 1 }} className={className}>{value}</span>;
};
