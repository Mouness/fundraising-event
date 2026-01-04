import { hash } from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

async function setAdminPassword() {
    const password = process.argv[2];

    if (!password) {
        console.error('Please provide a password as an argument.');
        console.error('Usage: pnpm set-admin-password <your-password>');
        process.exit(1);
    }

    try {
        const hashedPassword = await hash(password, 10);
        const envPath = path.resolve(__dirname, '../.env');

        if (fs.existsSync(envPath)) {
            let envContent = fs.readFileSync(envPath, 'utf8');
            const searchRegex = /ADMIN_PASSWORD\s*=\s*(.*)/g;

            if (searchRegex.test(envContent)) {
                envContent = envContent.replace(searchRegex, `ADMIN_PASSWORD="${hashedPassword}"`);
                console.log('Updated ADMIN_PASSWORD in .env');
            } else {
                // If not found, append it
                envContent += `\nADMIN_PASSWORD="${hashedPassword}"`;
                console.log('Appended ADMIN_PASSWORD to .env');
            }

            fs.writeFileSync(envPath, envContent);
            console.log(`Successfully set admin password hash for provided password.`);
            console.log('Please restart your API server to apply changes.');
        } else {
            console.error('.env file not found at', envPath);
            // Create it if it doesn't exist? Maybe safer to just error for now as other configs are needed.
            console.log('Creating .env file...');
            fs.writeFileSync(envPath, `ADMIN_PASSWORD="${hashedPassword}"`);
            console.log('Created .env file with ADMIN_PASSWORD.');
        }
    } catch (error) {
        console.error('Failed to set admin password:', error);
        process.exit(1);
    }
}

setAdminPassword();
