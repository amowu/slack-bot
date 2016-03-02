module.exports = {
  entry: './index.js',
  target: 'node',
  output: {
    path: './build',
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: [/node_modules/]
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }]
  },
  externals: [{
    'aws-sdk': {
      root: 'AWS',
      commonjs: 'aws-sdk',
      commonjs2: 'aws-sdk',
      amd: 'aws-sdk'
    }
  }]
}
