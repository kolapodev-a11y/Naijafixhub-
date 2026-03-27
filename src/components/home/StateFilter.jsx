import React, { useRef } from 'react'
import { FEATURED_STATES } from '../../utils/constants'

export default function StateFilter({ selected, onSelect }) {
  const scrollRef = useRef(null)

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
    >
      {FEATURED_STATES.map(state => (
        <button
          key={state}
          onClick={() => onSelect(state)}
          className={`chip flex-shrink-0 ${selected === state ? 'chip-active' : 'chip-inactive'}`}
        >
          {state}
        </button>
      ))}
    </div>
  )
}
