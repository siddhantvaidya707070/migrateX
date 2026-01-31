const fs = require('fs');

const content = fs.readFileSync('./app/page.tsx', 'utf8');

// Find all section names
const sectionPattern = /data-framer-name="([^"]*Section[^"]*)"/g;
let match;
const sections = [];
while ((match = sectionPattern.exec(content)) !== null) {
    if (!sections.includes(match[1])) {
        sections.push(match[1]);
    }
}

console.log('=== SECTIONS IN PAGE.TSX ===');
sections.forEach(s => console.log(' - ' + s));

console.log('\n=== CONTENT CHECK ===');
console.log('Has "Is This You?":', content.includes('Is This You?'));
console.log('Has "Our Tech Stack":', content.includes('Our Tech Stack'));
console.log('Has "Smarter Investing Starts Here":', content.includes('Smarter Investing Starts Here'));
console.log('Has "Invest with Confidence":', content.includes('Invest with Confidence'));
console.log('Has "Precision-Driven Portfolio":', content.includes('Precision-Driven Portfolio'));
console.log('Has "Diversified Assets":', content.includes('Diversified Assets'));
console.log('Has "Core Plan":', content.includes('Core Plan'));
console.log('Has "Vision Plan":', content.includes('Vision Plan'));
console.log('Has "framer-a85jvv" (pain points):', content.includes('framer-a85jvv'));
console.log('Has "framer-1e7a4qw" (tech stack):', content.includes('framer-1e7a4qw'));
console.log('Has "framer-1m7hue2" (old feature):', content.includes('framer-1m7hue2'));
console.log('Has "framer-hfxmnv" (old pricing):', content.includes('framer-hfxmnv'));
