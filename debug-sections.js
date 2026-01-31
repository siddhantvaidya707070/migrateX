const fs = require('fs');

const content = fs.readFileSync('./app/page.tsx', 'utf8');
let output = [];
output.push('File length: ' + content.length);

// Look for feature/pricing patterns in page.tsx
const patterns = [
    'section class=\\"framer-1m7hue2\\"',
    'section class=\\"framer-hfxmnv\\"',
    'id=\\"feature\\"',
    'id=\\"pricing\\"',
    'Smarter Investing',
    'easier and smarter',
    'Core Plan',
    'framer-1m7hue2',
    'framer-hfxmnv'
];

for (const p of patterns) {
    const idx = content.indexOf(p);
    output.push(`\n"${p}" -> index: ${idx}`);
    if (idx > 0 && idx < content.length - 80) {
        const ctx = content.substring(Math.max(0, idx - 20), idx + 80);
        output.push('  Context: ' + ctx.replace(/[\r\n]/g, ' ').substring(0, 100));
    }
}

// Find all section tags in page.tsx
output.push('\n--- All section tags in page.tsx ---');
let pos = 0;
let sectionCount = 0;
while ((pos = content.indexOf('<section', pos)) !== -1 && sectionCount < 15) {
    const end = content.indexOf('>', pos);
    if (end !== -1) {
        const tag = content.substring(pos, Math.min(end + 1, pos + 150));
        output.push(`Section ${sectionCount} at ${pos}: ${tag.substring(0, 120)}${tag.length > 120 ? '...' : ''}`);
        sectionCount++;
    }
    pos += 8;
}

fs.writeFileSync('./debug-output-page.txt', output.join('\n'));
console.log('Debug output written to debug-output-page.txt');
