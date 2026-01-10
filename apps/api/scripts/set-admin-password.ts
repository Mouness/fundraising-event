import * as argon2 from 'argon2'
import * as fs from 'fs'
import * as path from 'path'

const ENV_KEY = 'ADMIN_PASSWORD'

interface EnvFileTarget {
    path: string
    isDocker: boolean
}

const main = async () => {
    const password = process.argv[2]
    if (!password) {
        console.error('Error: Please provide a password as an argument.')
        console.error(`Usage: pnpm set-admin-password <your-password>`)
        process.exit(1)
    }

    try {
        const rawHash = await argon2.hash(password)

        const targets: EnvFileTarget[] = [
            { path: path.resolve(__dirname, '../.env'), isDocker: false }, // API local env
            { path: path.resolve(__dirname, '../../../.env'), isDocker: true }, // Root Docker env
        ]

        for (const target of targets) {
            updateEnvFile(target, rawHash)
        }

        console.log('\nSUCCESS: Admin password updated in all configuration files.')
        console.log('Please restart your API server/containers to apply changes.')
    } catch (error) {
        console.error('Failed to set admin password:', error)
        process.exit(1)
    }
}

const updateEnvFile = (target: EnvFileTarget, rawHash: string) => {
    if (!fs.existsSync(target.path)) {
        console.warn(`Skipping missing file: ${target.path}`)
        return
    }

    const content = fs.readFileSync(target.path, 'utf8')
    let finalValue = rawHash
    let comment = ''

    if (target.isDocker) {
        // Escape '$' to '$$' for Docker Compose and add a comment
        // usage of '$$$$' in split/join is not needed here because we are not passing this to string.replace
        // we constitute the string manually.
        finalValue = rawHash.split('$').join('$$')
        comment = ' # Note: $ escaped as $$ for Docker Compose compatibility'
    }

    const newContent = replaceOrAppendKey(content, ENV_KEY, finalValue, comment)
    fs.writeFileSync(target.path, newContent)
    console.log(`Updated ${ENV_KEY} in ${target.path}`)
}

const replaceOrAppendKey = (
    content: string,
    key: string,
    value: string,
    comment: string,
): string => {
    const lines = content.split('\n')
    const newLines: string[] = []
    let keyFound = false

    for (const line of lines) {
        // Check if line starts with KEY= (ignoring whitespace)
        if (line.trim().startsWith(`${key}=`)) {
            if (!keyFound) {
                // Replace the first occurrence
                newLines.push(`${key}="${value}"${comment}`)
                keyFound = true
            }
            // Skip duplicate occurrences (deduplication)
        } else {
            newLines.push(line)
        }
    }

    if (!keyFound) {
        // Append if matches were not found
        if (newLines.length > 0 && newLines[newLines.length - 1] !== '') {
            newLines.push('')
        }
        newLines.push(`${key}="${value}"${comment}`)
    }

    return newLines.join('\n')
}

main()
