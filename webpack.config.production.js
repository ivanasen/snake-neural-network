import path from 'path'
import webpack from 'webpack'
import merge from 'webpack-merge'

import baseConfig from './webpack.config.common'


export default merge(baseConfig, {
  devtool: '#cheap-module-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true
    })
  ]
})
