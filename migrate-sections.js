/**
 * Migration Script: Replace Features and Pricing sections
 * 
 * Replaces:
 * - Feature Section (framer-1m7hue2) with Pain Points (framer-a85jvv) from ui-elements
 * - Pricing Section (framer-hfxmnv) with Tech Stack (framer-1e7a4qw) from ui-elements
 * 
 * Also applies color mappings from purple theme to orange theme
 */

const fs = require('fs');

// Color mapping from ui-elements (purple theme) to mainui (orange theme)
const colorMappings = [
    // Primary accent colors
    ['rgb(159, 146, 255)', 'rgb(255, 77, 0)'],
    ['rgb(159,146,255)', 'rgb(255,77,0)'],
    ['rgb(126, 111, 240)', 'rgb(255, 120, 50)'],
    ['rgb(126,111,240)', 'rgb(255,120,50)'],
    ['rgb(74, 50, 255)', 'rgb(204, 61, 0)'],
    ['rgb(74,50,255)', 'rgb(204,61,0)'],
    ['rgb(79, 52, 178)', 'rgb(180, 50, 0)'],
    ['rgb(79,52,178)', 'rgb(180,50,0)'],
    ['rgb(165, 156, 233)', 'rgb(255, 150, 100)'],
    ['rgb(165,156,233)', 'rgb(255,150,100)'],
    ['rgba(159, 146, 255, 0.5)', 'rgba(255, 77, 0, 0.5)'],
    ['rgba(159,146,255,0.5)', 'rgba(255,77,0,0.5)'],

    // Background colors
    ['rgb(0, 3, 25)', 'rgb(23, 23, 23)'],
    ['rgb(0,3,25)', 'rgb(23,23,23)'],
    ['rgb(18, 22, 53)', 'rgb(28, 28, 28)'],
    ['rgb(18,22,53)', 'rgb(28,28,28)'],
    ['rgb(11, 14, 35)', 'rgb(20, 20, 20)'],
    ['rgb(11,14,35)', 'rgb(20,20,20)'],
    ['rgb(53, 59, 102)', 'rgb(46, 46, 46)'],
    ['rgb(53,59,102)', 'rgb(46,46,46)'],
    ['rgb(25, 28, 48)', 'rgb(32, 32, 32)'],
    ['rgb(25,28,48)', 'rgb(32,32,32)'],

    // Purple gradients to orange gradients
    ['linear-gradient(135deg, rgb(159, 146, 255)', 'linear-gradient(135deg, rgb(255, 77, 0)'],
    ['linear-gradient(180deg, rgb(159, 146, 255)', 'linear-gradient(180deg, rgb(255, 77, 0)'],
    ['linear-gradient(180deg, rgb(0, 3, 25)', 'linear-gradient(180deg, rgb(23, 23, 23)'],
    ['linear-gradient(135deg, rgb(0, 3, 25)', 'linear-gradient(135deg, rgb(23, 23, 23)'],

    // Additional purple shades
    ['rgb(137, 137, 153)', 'rgb(160, 160, 160)'],
    ['rgb(137,137,153)', 'rgb(160,160,160)'],
    ['rgb(96, 97, 115)', 'rgb(120, 120, 120)'],
    ['rgb(96,97,115)', 'rgb(120,120,120)'],
    ['rgb(255, 204, 109)', 'rgb(255, 120, 50)'],
    ['rgb(255,204,109)', 'rgb(255,120,50)'],
];

function applyColorMappings(html) {
    let result = html;
    for (const [from, to] of colorMappings) {
        result = result.split(from).join(to);
    }
    return result;
}

function extractSection(content, sectionClass) {
    const pattern = `<section class="${sectionClass}"`;
    const startIdx = content.indexOf(pattern);

    if (startIdx === -1) {
        console.log(`Could not find section with class "${sectionClass}"`);
        return null;
    }

    // Find the matching closing tag by counting depth
    let depth = 0;
    let i = startIdx;
    let sectionEnd = -1;

    while (i < content.length) {
        if (content.substring(i, i + 8) === '<section') {
            depth++;
            i += 8;
        } else if (content.substring(i, i + 10) === '</section>') {
            depth--;
            if (depth === 0) {
                sectionEnd = i + 10;
                break;
            }
            i += 10;
        } else {
            i++;
        }
    }

    if (sectionEnd === -1) {
        console.log(`Could not find end of section with class "${sectionClass}"`);
        return null;
    }

    return {
        start: startIdx,
        end: sectionEnd,
        content: content.substring(startIdx, sectionEnd)
    };
}

// Main migration
console.log('Starting migration...\n');

// Read files
const pageContent = fs.readFileSync('./app/page.tsx', 'utf8');
const uiElementsContent = fs.readFileSync('./ui-elements.txt', 'utf8');

console.log('Files loaded:');
console.log(`  page.tsx: ${pageContent.length} chars`);
console.log(`  ui-elements.txt: ${uiElementsContent.length} chars\n`);

// Extract source sections from ui-elements.txt
const painPointsSection = extractSection(uiElementsContent, 'framer-a85jvv');
const techStackSection = extractSection(uiElementsContent, 'framer-1e7a4qw');

if (!painPointsSection) {
    console.error('Failed to extract Pain Points section from ui-elements.txt');
    process.exit(1);
}
if (!techStackSection) {
    console.error('Failed to extract Tech Stack section from ui-elements.txt');
    process.exit(1);
}

console.log('Extracted from ui-elements.txt:');
console.log(`  Pain Points section: ${painPointsSection.content.length} chars`);
console.log(`  Tech Stack section: ${techStackSection.content.length} chars\n`);

// Extract target sections from page.tsx
const featureSection = extractSection(pageContent, 'framer-1m7hue2');
const pricingSection = extractSection(pageContent, 'framer-hfxmnv');

if (!featureSection) {
    console.error('Failed to find Feature Section in page.tsx');
    process.exit(1);
}
if (!pricingSection) {
    console.error('Failed to find Pricing Section in page.tsx');
    process.exit(1);
}

console.log('Found in page.tsx:');
console.log(`  Feature Section: ${featureSection.start} to ${featureSection.end} (${featureSection.content.length} chars)`);
console.log(`  Pricing Section: ${pricingSection.start} to ${pricingSection.end} (${pricingSection.content.length} chars)\n`);

// Apply color mappings to source sections
console.log('Applying color mappings...');
let adaptedPainPoints = applyColorMappings(painPointsSection.content);
let adaptedTechStack = applyColorMappings(techStackSection.content);

// Update section IDs and names to maintain mainui naming
adaptedPainPoints = adaptedPainPoints
    .replace('data-framer-name="Pain points"', 'data-framer-name="Feature Section" id="feature"')
    .replace('id="pain-points"', '');

adaptedTechStack = adaptedTechStack
    .replace('data-framer-name="Tech stack"', 'data-framer-name="Pricing Section"')
    .replace('id="tech-stack"', 'id="pricing"');

console.log('Applied color mappings and updated section names\n');

// Build the new content
// Important: Replace in reverse order (pricing first, then feature) to maintain correct indices
let newContent = pageContent;

// Replace Pricing Section first (comes after Feature in the file)
newContent = newContent.substring(0, pricingSection.start) +
    adaptedTechStack +
    newContent.substring(pricingSection.end);

// Calculate the offset for Feature Section (it shouldn't change since it's before Pricing)
newContent = newContent.substring(0, featureSection.start) +
    adaptedPainPoints +
    newContent.substring(featureSection.end);

// Create backup
fs.writeFileSync('./app/page.tsx.backup', pageContent);
console.log('Created backup: ./app/page.tsx.backup');

// Write the new content
fs.writeFileSync('./app/page.tsx', newContent);
console.log('Updated: ./app/page.tsx');

console.log('\n✓ Migration complete!');
console.log('  - Replaced Feature Section with Pain Points animation ("Is This You?")');
console.log('  - Replaced Pricing Section with Tech Stack animation');
console.log('  - Applied mainui orange color theme to new sections');
console.log('\nPlease refresh your browser to see the changes.');
