const {resolve} = require('path')

module.exports = {
    entry: {
      styles: ['./static/styles.css', './static/bigCalStyles.css', './static/calendar.css'],
      images: ['./static/loading.gif', './static/images/favicon.png', './static/images/logo.png']
    },
    output: {
      filename: '[name].js',
      path: __dirname + '/static/dist',
    },
    module: {
      loaders: [
        {test: /\.css$/, loader: "style-loader!css-loader" },
        {test: /\.(jpg|png|gif|svg)$/i, loaders: ['file-loader?hash=sha512&digest=hex&name=[hash].[ext]','image-webpack-loader']}
      ]
    }
}
