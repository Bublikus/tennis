const nodeExternals = require('webpack-node-externals')
const { webpack } = require('next/dist/compiled/webpack/webpack')

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        bufferutil: 'bufferutil',
        'utf-8-validate': 'utf-8-validate',
      })

      config.plugins.push(new webpack.ContextReplacementPlugin(/keyv/))
    }

    return config
  },
}

module.exports = nextConfig
