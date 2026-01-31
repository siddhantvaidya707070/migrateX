const fs = require('fs');

let content = fs.readFileSync('./app/page.tsx', 'utf8');

console.log('=== REMOVING BENTO SECTION ===');

// Find the Bento Section 
const bentoStart = content.indexOf('section class="framer-1rornw0" data-framer-name="Bento Section"');
if (bentoStart === -1) {
    console.log('ERROR: Could not find Bento Section start');
    process.exit(1);
}

// Find the actual <section start
const sectionTagStart = content.lastIndexOf('<section', bentoStart);
console.log('Bento section tag starts at:', sectionTagStart);

// Find the next section after Bento (Feature Section)
const nextSectionStart = content.indexOf('<section', bentoStart + 10);
console.log('Next section starts at:', nextSectionStart);

if (sectionTagStart === -1 || nextSectionStart === -1) {
    console.log('ERROR: Could not find section boundaries');
    process.exit(1);
}

// Extract the Bento section
const bentoSection = content.substring(sectionTagStart, nextSectionStart);
console.log('Bento section length:', bentoSection.length);
console.log('First 200 chars:', bentoSection.substring(0, 200));

// Remove the Bento section
content = content.substring(0, sectionTagStart) + content.substring(nextSectionStart);

console.log('\n=== VERIFICATION ===');
console.log('Has "Invest with Confidence":', content.includes('Invest with Confidence'));
console.log('Has "Precision-Driven Portfolio":', content.includes('Precision-Driven Portfolio'));
console.log('Has "Is This You?":', content.includes('Is This You?'));
console.log('New file size:', content.length);

// Write the updated content
fs.writeFileSync('./app/page.tsx', content);
console.log('\n✅ Bento Section removed successfully!');
