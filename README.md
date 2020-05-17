# about this template

## sass

Sass was configurated with svelte-preprocess, it has a global variable.scss that we can use into any component

```js
//rollup.config.js
preprocess: autoPreprocess({
  scss: {
    data: `@import './src/styles/variables.scss';`,
  },
})
```

And to VSCode recognize the sass in svelte components, was created the svelte.config.js

```js
//svelte.config.js
const sass = require('node-sass')

module.exports = {
  preprocess: {
    style: async ({ content, attributes }) => {
      if (
        !['text/sass', 'text/scss'].some(attributes.type) &&
        !['sass', 'scss'].some(attributes.lang)
      )
        return

      return new Promise((resolve, reject) => {
        sass.render(
          {
            data: content,
            sourceMap: true,
            outFile: 'x', // this is necessary, but is ignored
          },
          (err, result) => {
            if (err) return reject(err)

            resolve({
              code: result.css.toString(),
              map: result.map.toString(),
            })
          }
        )
      })
    },
  },
}
```

## dotenv

To enviroments was made a configuration with dotenv, rollup-plugin-replace, fs and path.

```js
//rollup.config.js

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

export default {
  //...others conf
  plugins: [
    //...others conf
    replace({
      //spread variables to replace
      ...valuesEnvToReplace(),
    }),
  ],
}
```

And

```env
//.env.development
APP_ENV=development
```

```svelte
//.src/pages/index.svelte
<h2>We are in {process.env.APP_ENV} enviroment</h2>
```

## prettier

```js
//prettier.config.js
module.exports = {
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  trailingComma: 'es5',
  plugins: ['svelte'],
}
```

# svelte app

This is a project template for [Svelte](https://svelte.dev) apps. It lives at https://github.com/sveltejs/template.

To create a new project based on this template using [degit](https://github.com/Rich-Harris/degit):

```bash
npx degit sveltejs/template svelte-app
cd svelte-app
```

_Note that you will need to have [Node.js](https://nodejs.org) installed._

# routify-starter

Starter template for [Routify](https://github.com/sveltech/routify)

### Get started

To use this starter run `npx @sveltech/routify init` in an empty folder.

Alternatively, you can clone this repo.

### Npm scripts

| Syntax        | Description                                                               |
| ------------- | ------------------------------------------------------------------------- |
| `dev`         | Development (port 5000)                                                   |
| `dev-dynamic` | Development with dynamic imports                                          |
| `build`       | Build a bundled app with SSR + prerendering and dynamic imports           |
| `serve`       | Run after a build to preview. Serves SPA on 5000 and SSR on 5005          |
| `deploy:*`    | Deploy to netlify or now                                                  |
| `export`      | Create static pages from content in dist folder (used by `npm run build`) |

### SSR and pre-rendering

SSR and pre-rendering are included in the default build process.

`npm run deploy:(now|netlify)` will deploy the app with SSR and prerendering included.

To render async data, call the `$ready()` helper whenever your data is ready.

If \$ready() is present, rendering will be delayed till the function has been called.

Otherwise it will be rendered instantly.

See [src/pages/example/api/[showId].svelte](https://github.com/sveltech/routify-starter/blob/master/src/pages/example/api/%5BshowId%5D.svelte) for an example.

### Production

- For SPA or SSR apps please make sure that url rewrite is enabled on the server.
- For SPA redirect to `__dynamic.html`.
- For SSR redirect to the lambda function or express server.

### Issues?

File on Github! See https://github.com/sveltech/routify/issues .
