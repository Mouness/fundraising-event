module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'subject-case': [0],
        'header-max-length': [0],
    },
    ignores: [
        (message) => message.includes('Initial commit'),
        (message) => message.includes('Initial version of the project'),
        (message) => message.includes('enable ci'),
        (message) => message.includes('ai: self-healing fix for CI failure'),
    ],
}
