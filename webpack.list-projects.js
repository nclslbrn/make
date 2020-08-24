const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const publicFolder = './public/sketch/'

function fileList(dir) {
    return fs.readdirSync(dir).reduce(function (list, file) {
        var name = path.join(dir, file)
        var isDir = fs.statSync(name).isDirectory()
        return list.concat(isDir ? [file] : null)
    }, [])
}
const unescapeTitle = (title) => {
    const addSpace = title.replace(/-/g, ' ')
    const capitalize = addSpace.charAt(0).toUpperCase() + addSpace.slice(1)
    return capitalize
}

module.exports = (env, argv) => {
    const mode = argv.mode == 'production' ? 'production' : 'development'
    const projects = fileList(publicFolder)
    let projectWithMeta = []

    projects.forEach((proj) => {
        projectWithMeta.push({
            name: proj,
            ...require(__dirname + '/sketch/' + proj + '/property.json')
        })
    })

    console.log(mode)
    return {
        mode: mode,
        entry: __dirname + '/src/js/index-list.js',
        output: {
            path: path.resolve(__dirname, 'public/'),
            filename: 'list-bundle.js'
        },
        module: {
            rules: [
                {
                    test: /\.pug$/,
                    exclude: ['/node_modules/'],
                    loader: 'pug-loader'
                },
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                url: true,
                                sourceMap: mode == 'production' ? false : true
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                ident: 'postcss',
                                plugins: (loader) => [
                                    require('autoprefixer'),
                                    require('cssnano')
                                ]
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                implementation: require('sass'),
                                sourceMap: mode == 'production' ? false : true
                            }
                        }
                    ],
                    include: [
                        path.resolve(__dirname, 'node_modules'),
                        path.resolve(__dirname, 'src/sass')
                    ]
                },
                {
                    // fonts
                    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: './fonts/[name].[ext]',
                                mimetype: 'application/font-woff',
                                publicPath: '../'
                            }
                        }
                    ]
                }
            ]
        },
        devServer: {
            contentBase: path.resolve(__dirname, 'public'),
            port: 8080,
            open: true,
            openPage: '',
            stats: 'errors-only'
        },
        plugins: [
            new HtmlWebpackPlugin({
                templateParameters: {
                    projects: projectWithMeta,
                    srcPath: './',
                    unescapeTitle: unescapeTitle
                },
                filename: './index.html',
                template: './src/pug/projects-list.pug',
                inject: true
            }),
            new MiniCssExtractPlugin({
                filename: 'css/[name].css'
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, 'src/img'),
                        to: path.resolve(__dirname, 'public/img')
                    },
                    {
                        from: path.resolve(__dirname, 'src/fonts'),
                        to: path.resolve(__dirname, 'public/fonts')
                    }
                ]
            }),
            new TerserPlugin()
        ],
        devtool: mode == 'production' ? '' : 'source-map'
    }
}
