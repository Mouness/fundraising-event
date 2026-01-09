const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ERROR_LOG_PATH = process.argv[2];

if (!GEMINI_API_KEY) {
    console.error('Error: GEMINI_API_KEY is not set.');
    process.exit(1);
}

if (!ERROR_LOG_PATH || !fs.existsSync(ERROR_LOG_PATH)) {
    console.error('Error: Provide a valid path to the error log file.');
    process.exit(1);
}

async function heal() {
    const errorLog = fs.readFileSync(ERROR_LOG_PATH, 'utf-8');

    console.log('--- Error Log Received ---');
    console.log(errorLog.substring(0, 500) + '...');

    const prompt = `
You are an autonomous AI software engineer. You have been tasked with fixing a CI failure in a monorepo.
Here is the error log from the failed job:

<ERROR_LOG>
${errorLog}
</ERROR_LOG>

Based on the log, identify the file that needs to be fixed. 
Then, provide the fixed version of that file.

Return ONLY a JSON object in the following format:
{
  "filePath": "relative/path/to/file.ts",
  "fixedContent": "FULL CONTENT OF THE FILE AFTER FIX"
}

Ensure the code is correct, follows best practices, and fixes the specific error in the log.
`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { response_mime_type: "application/json" }
            })
        });

        const data = await response.json();
        const resultText = data.candidates[0].content.parts[0].text;
        const result = JSON.parse(resultText);

        if (result.filePath && result.fixedContent) {
            const absolutePath = path.resolve(process.cwd(), result.filePath);
            fs.writeFileSync(absolutePath, result.fixedContent);
            console.log(`Successfully healed: ${result.filePath}`);

            // Output for CI to use
            fs.writeFileSync('healing_summary.txt', `Healed ${result.filePath} automatically.`);
        } else {
            console.error('AI response did not contain required fields.');
            process.exit(1);
        }
    } catch (error) {
        console.error('Healing failed:', error);
        process.exit(1);
    }
}

heal();
