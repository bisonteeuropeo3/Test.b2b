module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  rules: {
    'no-console': ['warn', { allow: ['error', 'warn'] }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
}
