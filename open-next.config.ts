export default {
  buildCommand: 'npm run build:next',
  default: {
    override: {
      wrapper: 'cloudflare',
      converter: 'edge',
    },
  },
}
