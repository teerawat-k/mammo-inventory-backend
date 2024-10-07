module.exports = {
  verbose: true,
  testTimeout: 5 * 1000,
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  collectCoverage: true,
  collectCoverageFrom: ['**/test/**/*.test.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html'],
  globals: {
    NODE_ENV: 'test',
    guestCookie: [
      '_mmsa=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiNzBkZDdiMGQtYzA1MS00MjMwLTlmOTEtMDlkMWVkZjI4NGYyIiwidXNlciI6eyJpZCI6MX0sImlhdCI6MTcwNzcwNTM3MywiZXhwIjoyNTcxNjE4OTczfQ.6Xd2f1nKDKf-Nm6RekxHADxl_GuJna70PthwK46FySg; Max-Age=863913600; Path=/; Expires=Thu, 29 Jun 2051 02:36:13 GMT; HttpOnly; Secure; SameSite=Lax',
      '_mmsr=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiMjJlNmYxODItMmEzNy00YTEyLTg2MTUtZDM5OTZhZmI1ZTk2IiwidXNlciI6eyJpZCI6MX0sImlhdCI6MTcwNzcwNTM3MywiZXhwIjoyNTcxNjE4OTczfQ.sHwQTQrXOfX3IHWYkYd3zK27XPeisPU-M4Ne-zuWlEk; Max-Age=863913600; Path=/; Expires=Thu, 29 Jun 2051 02:36:13 GMT; HttpOnly; Secure; SameSite=Lax'
    ],
    adminCookie: [
      '_mmsa=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiYjc0NjExNzYtZmJlMi00NzAwLTkwYjgtYTA4ZmRlODgwYzFhIiwidXNlciI6eyJpZCI6Mn0sImlhdCI6MTcwNzcwNTM3MywiZXhwIjoyNTcxNjE4OTczfQ.7H2IxXVmTYWoE_7iCl4PlVNKaiAUyurhe3LeWBjhkRI; Max-Age=863913600; Path=/; Expires=Thu, 29 Jun 2051 02:36:13 GMT; HttpOnly; Secure; SameSite=Lax',
      '_mmsr=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiNzEwNTEyOTktZmJmNi00Mjg0LTllYmQtNGU2MzY3NGFlYTZlIiwidXNlciI6eyJpZCI6Mn0sImlhdCI6MTcwNzcwNTM3MywiZXhwIjoyNTcxNjE4OTczfQ.loOyAgWaeNH6mkD7j_fXQm1bnBC5WG_C0pI7XLzymyI; Max-Age=863913600; Path=/; Expires=Thu, 29 Jun 2051 02:36:13 GMT; HttpOnly; Secure; SameSite=Lax'
    ]
  }
}
