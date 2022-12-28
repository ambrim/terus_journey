const pjson = require('./package.json');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const GeneratePackageJsonPlugin = require('generate-package-json-webpack-plugin');

const basePackage = {
    "name": "cos426-final-project-server-deployment",
    "version": pjson.version,
    "main": "./index.js",
    "engines": {
        "node": ">= 19"
    }
}

const server = {
    mode: 'production',
    devtool: 'source-map',
    target: 'node',
    entry: {
        main: './src/main.ts',
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, '../dist'),
        clean: true,
    },
    externals: [nodeExternals()],
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
        ],
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'cert', to: 'cert' },
                { from: 'favicon.ico', to: 'favicon.ico' },
            ]
        }),
        new GeneratePackageJsonPlugin(basePackage),
    ],
};

module.exports = server;