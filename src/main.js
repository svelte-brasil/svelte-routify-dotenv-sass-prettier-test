// https://github.com/sveltemaster/svelte-unit-tests
import HMR from '@sveltech/routify/hmr'
import App from './App.svelte'

const app = HMR(App, { target: document.body }, 'routify-app')

export default app
