import { NextApiHandler } from 'next'
import Ably from 'ably/promises'
import { CHANNEL_NAME } from '@/constants/channel'

export default <NextApiHandler>async function handler(req, res) {
  const client = new Ably.Realtime(String(process.env.NEXT_PUBLIC_ABLY_API_KEY))

  await client.connection.once('connected')
  console.log('Connected to Ably!')

  const channel = client.channels.get(CHANNEL_NAME)
  channel.on('update', (msg) => {
    console.log('Received an update event', msg)
  })
  // channel.publish("example", "message data");

  const tokenRequestData = await client.auth.createTokenRequest({
    clientId: 'ably-nextjs-demo',
  })

  // Send message to all connected clients

  res.status(200).json(tokenRequestData)
}
