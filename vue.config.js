/*
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production'
      ? '/zenyth/'
      : '/'
})
*/

const path = require("path");



module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
      ? '/zenyth/'
      : '/',
  outputDir: path.resolve(__dirname, "docs"),

}

