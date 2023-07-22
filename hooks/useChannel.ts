import { useEffect } from 'react'
import Ably from 'ably/promises'

const ably = new Ably.Realtime.Promise({ authUrl: '/api/createTokenRequest' })

type UseChannel = (
  channelName: string,
  callbackOnMessage: (msg: Ably.Types.Message) => void,
) => [Ably.Types.RealtimeChannelPromise, Ably.Types.RealtimePromise]

export const useChannel: UseChannel = (channelName, callbackOnMessage) => {
  const channel = ably.channels.get(channelName)

  const onMount = () => {
    channel.subscribe((msg) => {
      callbackOnMessage(msg)
    })
  }

  const onUnmount = () => {
    channel.unsubscribe()
  }

  const useEffectHook = () => {
    onMount()
    return () => {
      onUnmount()
    }
  }

  useEffect(useEffectHook)

  return [channel, ably]
}
