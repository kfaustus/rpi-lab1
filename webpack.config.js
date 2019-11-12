/* eslint-env node */

const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

function generateRootHTMLPlugins(isProduction) {
    return glob.sync('./src/*.html').map((dir) => new HtmlWebpackPlugin({
        filename: path.basename(dir),
        template: dir,
        minify: isProduction,
    }));
}

module.exports = (env, { mode = 'development' }) => {
    const isProduction = mode === 'production';

    return {
        devtool: isProduction ? false : 'source-map',

        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            compress: true,
            port: 8080,
        },

        entry: {
            app: './src',
        },

        optimization: {
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        output: {
                            comments: false,
                        },
                    },
                }),
            ],
        },

        output: {
            path: path.resolve('./dist'),
            publicPath: '/',
            filename: '[name].js?[hash]',
            chunkFilename: '[name].js',
        },

        plugins: [
            new MiniCssExtractPlugin({
                filename: 'css/[name].css?[hash]',
                chunkFilename: 'css/[id].css?[hash]',
            }),
            ...generateRootHTMLPlugins(isProduction),
        ].concat(isProduction ? [
            new OptimizeCSSAssetsPlugin({
                assetNameRegExp: /\.css(\?\w+)?$/g,
                cssProcessor: require('cssnano'),
                cssProcessorPluginOptions: {
                    preset: ['advanced', {
                        autoprefixer: false,
                        colormin: true,
                        convertValues: true,
                        discardComments: {
                            removeAll: true,
                        },
                        discardDuplicates: true,
                        discardEmpty: true,
                        discardOverridden: true,
                        discardUnused: true,
                        mergeIdents: true,
                        mergeLonghand: true,
                        mergeRules: true,
                        minifyFontValues: true,
                        minifyGradients: true,
                        minifyParams: true,
                        minifySelectors: true,
                        normalizeCharset: true,
                        normalizeRepeatStyle: true,
                        normalizeTimingFunctions: true,
                        normalizeWhitespace: true,
                        orderedValues: true,
                        reduceIdents: true,
                        reduceInitial: true,
                        reduceTransforms: true,
                        uniqueSelectors: true,
                        zindex: false,
                    }],
                },
            }),
        ] : [
            new webpack.LoaderOptionsPlugin({
                debug: true,
            }),
        ]),

        resolve: {
            modules: [
                path.resolve(__dirname, 'src'),
                'node_modules',
            ],
            extensions: ['.tsx', '.ts', '.js'],
        },

        module: {
            rules: [
                {
                    test: /\.(js|ts)x?$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                presets: [
                                    ['@babel/preset-env', {
                                        useBuiltIns: 'usage',
                                        corejs: 3,
                                    }],
                                    '@babel/preset-typescript',
                                ],
                                plugins: [
                                    '@babel/plugin-proposal-class-properties',
                                    '@babel/plugin-syntax-dynamic-import',
                                ],
                            },
                        },
                    ],
                },
                {
                    test: /\.s?css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: !isProduction,
                            },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: !isProduction,
                                plugins: [
                                    require('postcss-import')(),
                                    require('postcss-preset-env')(),
                                ],
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: !isProduction,
                            },
                        },
                    ],
                },
                {
                    test: /\.html$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'html-loader',
                        },
                    ],
                },
                {
                    test: /\.(png|gif|jpg|svg)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            query: {
                                name: '[name].[ext]?[hash]',
                                publicPath: '/images/',
                                outputPath: 'images/',
                            },
                        },
                    ],
                },
                {
                    test: /\.(ttf|otf|woff2?)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            query: {
                                name: '[name].[ext]?[hash]',
                                publicPath: '/fonts/',
                                outputPath: 'fonts/',
                            },
                        },
                    ],
                },
            ],
        },
    };
};
