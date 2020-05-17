import svelte from 'rollup-plugin-svelte'
import alias from '@rollup/plugin-alias'
import resolve from '@rollup/plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser'
import copy from 'rollup-plugin-copy'
import autoPreprocess from 'svelte-preprocess'
import del from 'del'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

const staticDir = 'static'
const distDir = 'dist'
const buildDir = `${distDir}/build`
const production = !process.env.ROLLUP_WATCH
const bundling = process.env.BUNDLING || production ? 'dynamic' : 'bundle'
const shouldPrerender =
  typeof process.env.PRERENDER !== 'undefined'
    ? process.env.PRERENDER
    : !!production

const mode = process.env.NODE_ENV || 'development'

dotenv.config()

const ENV_VARS = dotenv.parse(
  fs.readFileSync(path.resolve(__dirname, `.env.${mode}`))
)

const valuesEnvToReplace = () => {
  return Object.entries(ENV_VARS).reduce((acc, [key, val]) => {
    acc[`process.env.${key}`] = JSON.stringify(val)
    return acc
  }, {})
}

const customResolver = resolve({
  extensions: ['.mjs', '.js', '.svelte', '.scss'],
})

del.sync(distDir + '/**')

function createConfig({ output, inlineDynamicImports, plugins = [] }) {
  const transform = inlineDynamicImports ? bundledTransform : dynamicTransform

  return {
    inlineDynamicImports,
    input: `src/main.js`,
    output: {
      name: 'app',
      sourcemap: true,
      ...output,
    },
    plugins: [
      alias({
        entries: [
          {
            find: '@src',
            replacement: path.resolve(projectRootDir, 'src'),
          },
        ],
        customResolver,
      }),
      copy({
        targets: [
          { src: staticDir + '/**/!(__index.html)', dest: distDir },
          {
            src: `${staticDir}/__index.html`,
            dest: distDir,
            rename: '__app.html',
            transform,
          },
        ],
        copyOnce: true,
        flatten: false,
      }),
      svelte({
        // enable run-time checks when not in production
        dev: !production,
        hydratable: true,
        // we'll extract any component CSS out into
        // a separate file — better for performance
        css: (css) => {
          css.write(`${buildDir}/bundle.css`)
        },
        preprocess: autoPreprocess({
          scss: {
            data: `@import './src/styles/variables.scss';`,
          },
        }),
      }),
      replace({
        ...valuesEnvToReplace(),
      }),
      // If you have external dependencies installed from
      // npm, you'll most likely need these plugins. In
      // some cases you'll need additional configuration —
      // consult the documentation for details:
      // https://github.com/rollup/rollup-plugin-commonjs
      resolve({
        browser: true,
        dedupe: (importee) =>
          importee === 'svelte' || importee.startsWith('svelte/'),
      }),
      commonjs(),

      // If we're building for production (npm run build
      // instead of npm run dev), minify
      production && terser(),
      ...plugins,
    ],
    watch: {
      clearScreen: false,
    },
  }
}

const bundledConfig = {
  inlineDynamicImports: true,
  output: {
    format: 'iife',
    file: `${buildDir}/bundle.js`,
  },
  plugins: [!production && serve(), !production && livereload(distDir)],
}

const dynamicConfig = {
  inlineDynamicImports: false,
  output: {
    format: 'esm',
    dir: buildDir,
  },
  plugins: [!production && livereload(distDir)],
}

const configs = [createConfig(bundledConfig)]
if (bundling === 'dynamic') configs.push(createConfig(dynamicConfig))
if (shouldPrerender) [...configs].pop().plugins.push(prerender())
export default configs

function serve() {
  let started = false
  return {
    writeBundle() {
      if (!started) {
        started = true
        require('child_process').spawn('npm', ['run', 'serve'], {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true,
        })
      }
    },
  }
}

function prerender() {
  return {
    writeBundle() {
      if (shouldPrerender) {
        require('child_process').spawn('npm', ['run', 'export'], {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true,
        })
      }
    },
  }
}

function bundledTransform(contents) {
  return contents.toString().replace(
    '__SCRIPT__',
    `
	<script defer src="/build/bundle.js" ></script>
	`
  )
}

function dynamicTransform(contents) {
  return contents.toString().replace(
    '__SCRIPT__',
    `
	<script type="module" defer src="https://unpkg.com/dimport@1.0.0/dist/index.mjs?module" data-main="/build/main.js"></script>
	<script nomodule defer src="https://unpkg.com/dimport/nomodule" data-main="/build/main.js"></script>
	`
  )
}
