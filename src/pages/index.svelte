<script>
  import RoutifyIntro from './example/_components/RoutifyIntro.svelte'
  const libs = ['routify', 'sass', 'dotenv', 'prettier', 'eslint', 'jest']
</script>

<style lang="scss">
  h1,
  p {
    color: $blue_br;
  }
  h2 {
    color: $green_br;
  }
  h3 {
    color: $yellow_br;
  }
</style>

<h1>Svelte Brasil Template</h1>

<h2>We are in {process.env.APP_ENV} enviroment</h2>

<h3>Libs:</h3>
<ul>
  {#each libs as item}
    <li>{item}</li>
  {/each}
</ul>

<RoutifyIntro />

<p>
  Based in
  <a href="https://github.com/sveltech/routify-starter">routify-starter</a>
</p>
