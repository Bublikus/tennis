import { NextApiHandler } from 'next'
import Ably from 'ably/promises'

export default <NextApiHandler>async function handler(req, res) {
  const client = new Ably.Realtime(String(process.env.NEXT_PUBLIC_ABLY_API_KEY))

  await client.connection.once('connected')
  console.log('Connected to Ably!')

  const tokenRequestData = await client.auth.createTokenRequest({
    clientId: 'ably-nextjs-demo',
  })

  res.status(200).json(tokenRequestData)
}
