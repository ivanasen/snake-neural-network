import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

export default {
    module : {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            }, {
                test: /\.json$/,
                use: 'json-loader'
            },
            {
              test: /\.scss$/,
              use: ExtractTextPlugin.extract({
                use: [{
                  loader: 'css-loader'
                },{
                  loader: 'sass-loader'
                }],
                fallback: 'style-loader'
              })
            },
            { 
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, 
                use: 'url-loader?limit=10000&mimetype=application/font-woff' 
            },
            { 
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: 'file-loader'
            }
        ]
    },
    output : {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
        //libraryTarget: 'commonjs2'
    },
    resolve : {
        extensions: [
            '.js', '.json'
        ],
        modules: [
            path.join(__dirname, 'src'),
            'node_modules'
        ]
    },
    plugins : [
        new ExtractTextPlugin({
          filename: "[name].[contenthash].css"
        }),
        new webpack.NamedModulesPlugin(),
        new HtmlWebpackPlugin({title: 'Neuroevolution of snakes', template: 'src/index.html.ejs'})
    ]
}
