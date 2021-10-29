import React from 'react'
import { Button } from '../../../../Button'
import { useActive, useCommands } from '@remirror/react'

export const TextMenu = () => {
  const { toggleBold, focus } = useCommands()
  const { toggleItalic } = useCommands()
  const active = useActive()

  return (
    <div className="textButtons">
      <Button
        onClick={() => {
          toggleBold()
          focus()
        }}
        text={'B'}
        style={{ fontWeight: active.bold() ? 'bold' : undefined }}
      />
      <Button
        onClick={() => {
          toggleItalic()
          focus()
        }}
        text={'I'}
        style={{ fontWeight: active.italic() ? 'italic' : undefined }}
      />
    </div>
  )
}
