import '@testing-library/jest-dom/extend-expect'
import { render } from '@testing-library/svelte'
import index from './index.svelte'

describe('Index', () => {
  it('constains texts', () => {
    const libs = ['routify', 'sass', 'dotenv', 'prettier', 'eslint', 'jest']
    const { getByText } = render(index)

    libs.forEach((text) => {
      expect(getByText(text)).toBeInTheDocument()
    })
  })
})
