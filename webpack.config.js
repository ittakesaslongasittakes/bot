"use strict";

const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

require("es6-promise").polyfill();

module.exports = {
  entry: "./src/main.jsx",

  output: {
    path: __dirname,
    filename: "dist/js/app.js"
  },

  plugins: [
    // Specify the resulting CSS filename
    new ExtractTextPlugin({
      filename: "dist/css/app.css",
      allChunks: true,
      disable: process.env.NODE_ENV !== "production"
    })
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      },
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: [
          "babel-loader",
          "webpack-append?import Snabbdom from 'snabbdom-pragma'" // TODO: set only for jsx ex. in prod.
        ]
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "sass-loader"]
        })
      }
    ]
  },
  stats: {
    // Colored output
    colors: true
  },

  // Create Sourcemaps for the bundle
  devtool: "source-map"
};
