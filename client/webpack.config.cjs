const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const client = {
    mode: 'production',
    devtool: 'source-map',
    entry: {
        main: './src/main.ts',
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Output Management',
        }),
    ],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, '../dist/public'),
        clean: true,
    },
    resolve: {
        extensionAlias: {
            '.js': ['.tsx', '.ts', '.js'],
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/i,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.mp3$/i,
                type: 'asset/resource',
            },
            {
                test: /\.wav$/i,
                type: 'asset/resource',
            },
            {
                test: /\.wgsl$/i,
                use: 'ts-shader-loader',
            },
        ],
    },
}

module.exports = client;