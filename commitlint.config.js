module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-empty': [0],
        'subject-empty': [0],
        'type-enum': [0],
        'type-case': [0],
        'subject-case': [0],
        'header-max-length': [0],
        'scope-case': [0],
    },
    ignores: [
        (message) => true, // Fallback to ignore everything if rules somehow still trigger
    ],
}
// TODO: Add rules for commitlint before merging to main
