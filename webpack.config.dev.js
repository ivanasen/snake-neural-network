import path from 'path'
import webpack from 'webpack'
import merge from 'webpack-merge'

import baseConfig from './webpack.config.common'

export default merge(baseConfig, {
  devtool: '#source-map',
  target: 'node',  
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true
    })
  ]
})
