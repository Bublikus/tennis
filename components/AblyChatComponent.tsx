'use client'

import React, { useEffect, useState } from 'react'
import Ably from 'ably/promises'
import { useChannel } from '@/hooks/useChannel'
import styles from './AblyChatComponent.module.css'

const AblyChatComponent = () => {
  let inputBox: HTMLTextAreaElement | null = null
  let messageEnd: HTMLDivElement | null = null

  const [messageText, setMessageText] = useState('')
  const [receivedMessages, setMessages] = useState<Ably.Types.Message[]>([])
  const messageTextIsEmpty = messageText.trim().length === 0

  const [channel, ably] = useChannel('chat-demo', (message) => {
    const history = receivedMessages.slice(-199)
    setMessages([...history, message])
  })

  const sendChatMessage = (messageText: string) => {
    channel.publish({ name: 'chat-message', data: messageText })
    setMessageText('')
    inputBox?.focus()
  }

  const handleFormSubmission: React.FormEventHandler<HTMLFormElement> = (
    event,
  ) => {
    event.preventDefault()
    sendChatMessage(messageText)
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.charCode !== 13 || messageTextIsEmpty) {
      return
    }
    sendChatMessage(messageText)
    event.preventDefault()
  }

  const messages = receivedMessages.map(
    (message: Ably.Types.Message, index) => {
      const author =
        message.connectionId === ably.connection.id ? 'me' : 'other'
      return (
        <span key={index} className={styles.message} data-author={author}>
          {message.data}
        </span>
      )
    },
  )

  useEffect(() => {
    messageEnd?.scrollIntoView({ behavior: 'smooth' })
  })

  return (
    <div className={styles.chatHolder}>
      <div className={styles.chatText}>
        {messages}
        <div
          ref={(element) => {
            messageEnd = element
          }}
        ></div>
      </div>
      <form onSubmit={handleFormSubmission} className={styles.form}>
        <textarea
          ref={(element) => {
            inputBox = element
          }}
          value={messageText}
          placeholder="Type a message..."
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          className={styles.textarea}
        ></textarea>
        <button
          type="submit"
          className={styles.button}
          disabled={messageTextIsEmpty}
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default AblyChatComponent
