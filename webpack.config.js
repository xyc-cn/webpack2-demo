var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlResWebpackPlugin = require('html-res-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin-hash');
var path = require('path');
var glob = require('glob');
// 是否发布模式
var isProd = process.env.NODE_ENV;

var projectConfig = require('./project.config.json');

var srcPath = path.resolve(projectConfig.srcPath);

//导出配置
module.exports = {
    //entry配置项的根目录（绝对路径）
    context: srcPath,
    entry: {},
    output: {
        //打包输出文件的路径
        path: path.resolve(projectConfig.buildPath),
        //引用文件的公共目录
        publicPath: projectConfig.publicPath,
        //输出文件名
        filename: isProd ? 'js/[name].[hash:8].js' : 'js/[name].js',
        //公共部分文件名
        chunkFilename: isProd ? 'js/[name].[hash:8].js' : 'js/[name].js'
    },
    plugins: [
        new webpack.DefinePlugin({
            __DEBUG__: !isProd
        }),
        //zepto不打进文件里面，复制到发布目录
        new CopyWebpackPlugin([{
            from: projectConfig.libsPath + '/zepto.js',
            to: 'js/' + projectConfig.libsPath
        }], {
            namePattern: '[name].js'
        })
    ],
    resolve: {
        //查找依赖的的路径，webpack2新增配置项目，webpack1中对应的root
        modules: [srcPath, './node_modules'],
        extensions: ['.js', '.css', '.json', '.html'],
        //别名，配置后可以通过别名导入模块
        alias: {
            css: path.join(path.resolve(process.cwd(), "./src/css"))
        }
    },
    //配置外部文件，单独引入不打包
    externals: {
        "zepto":"$"
    },
    //开发配置，设置source map更易调试，发布模式不使用
    devtool: isProd ? '' : 'cheap-source-map',
    //server配置
    devServer: {
        headers: {
            "Cache-Control": "no-cache"
        },
      /*stats: {
            colors: true
        },*/
        stats: 'errors-only',
        host: '0.0.0.0',
        port: 8000
    },
    module: {
        noParse: [/\.html$/],
        loaders: [
            {
                test: /\.vue$/,
                loader: 'vue'
            }, {
                //关键代码，只有去掉babel的cjs模块，才能做tree shaking打包
                test: /\.js$/,
                loader:'babel',
                query: isProd ? {
                    cacheDirectory: true,
                    plugins: [
                        'transform-es2015-template-literals',
                        'transform-es2015-literals',
                        'transform-es2015-function-name',
                        'transform-es2015-arrow-functions',
                        'transform-es2015-block-scoped-functions',
                        'transform-es2015-classes',
                        'transform-es2015-object-super',
                        'transform-es2015-shorthand-properties',
                        'transform-es2015-computed-properties',
                        'transform-es2015-for-of',
                        'transform-es2015-sticky-regex',
                        'transform-es2015-unicode-regex',
                        'check-es2015-constants',
                        'transform-es2015-spread',
                        'transform-es2015-parameters',
                        'transform-es2015-destructuring',
                        'transform-es2015-block-scoping',
                        'transform-es2015-typeof-symbol',
                        ['transform-regenerator', {async: false, asyncGenerators: false}]
                    ]
                } : {
                    cacheDirectory: true,
                    presets: ['es2015'],
                    plugins: ['transform-runtime']
                },
                exclude: /node_modules/
            }, {
                test: /\.css$/,
                loader: isProd ? ExtractTextPlugin.extract({
                    fallbackLoader: "style-loader",
                    loader: "css-loader?minimize"
                }) : 'style!css'
            }, {
                test: /\.(jpe?g|png|gif|svg)(\?]?.*)?$/i,
                loaders: isProd ?
                    ['url?limit=100&name=[path][name].[hash:8]_.[ext]'] : ['file?name=[path][name].[ext]']
            }]
    }
};

//发布时加载插件
if (isProd) {
    //module.exports.output.publicPath = '/';
    module.exports.plugins.push(
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                screw_ie8: false,
                unused: true,
                warnings: false
            },
            output: {
                max_line_len: 300
            },
            comments: false
        }),
        //因为js都打在页面上，所以抽离公共代码没什么意义
        //new CommonsChunkPlugin({name:'commonFile', filename:isProd ? 'js/[name].[hash:8].js' : 'js/[name].js'}),
        new ExtractTextPlugin('css/[name].[contenthash:8].css')
    )
}

function log(msg) {
    console.log(' ' + msg);
}

log('\r\n =============================================');
log('查找到page入口文件：');
var entryConfig = {
    inline: { // inline or not for index chunk
        js: isProd ? true : false,
        css: isProd ? true : false
    }
};

//查找entry入口
glob.sync(projectConfig.entrys, {
    cwd: srcPath
}).forEach(function (entryPath) {
    var aliaName = path.basename(entryPath, '.js');
    var entryName = path.dirname(entryPath) + '/' + aliaName;
    if (!module.exports.resolve.alias[aliaName]) {
        module.exports.entry[entryName] = [entryPath];
        var chunks = {
            'js/lib/version': entryConfig
        };
        chunks[entryName] = entryConfig;
        //加载html生成插件
        module.exports.plugins.push(new HtmlResWebpackPlugin({
            filename: 'html/' + path.dirname(entryPath).split('/')[1]+'/'+aliaName + '.html',
            template: projectConfig.htmlMap[path.dirname(entryPath)+'/'+aliaName] || path.join('src/html/', aliaName + '/' + aliaName + '.html'),
            htmlMinify: isProd ? {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            } : false,
            chunks: chunks
        }));
        log(entryPath);
    }
});
//加载VUE 文件
glob.sync(projectConfig.vueEntrys, {
    cwd: srcPath
}).forEach(function (entryPath) {
    var aliaName = path.basename(entryPath, '.js');
    var entryName = path.dirname(entryPath) + '/' + aliaName;
    if (!module.exports.resolve.alias[aliaName]) {
        module.exports.entry[entryName] = [entryPath];
        var chunks = {
            'js/lib/version': entryConfig
        };
        chunks[entryName] = entryConfig;
        //加载html生成插件
        module.exports.plugins.push(new HtmlResWebpackPlugin({
            filename: 'html/vue/' + aliaName + '/'+aliaName + '.html',
            template: projectConfig.htmlMap[path.dirname(entryPath)+'/'+aliaName] || path.join('src/vue/', aliaName + '/' + aliaName + '.html'),
            htmlMinify: isProd ? {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            } : false,
            chunks:chunks
        }));
        log(entryPath);
    }
});
log('\r\n =============================================');
