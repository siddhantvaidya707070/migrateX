const fs = require('fs');

// Read the ORIGINAL mainui.txt (the backup)
const mainui = fs.readFileSync('./mainui.txt', 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

console.log('=== STEP 1: Find Hero Section in ORIGINAL mainui.txt ===');

// Find the end of Hero Section (where next section starts)
const heroSectionStart = mainui.indexOf('section class="framer-1ju9km5" data-framer-name="Hero Section"');
console.log('Hero section starts at:', heroSectionStart);

// Find where the Hero section ends - look for the next <section
const heroStart = mainui.lastIndexOf('<section', heroSectionStart);
let heroEnd = mainui.indexOf('<section', heroSectionStart + 10);
console.log('Hero ends at (next section):', heroEnd);

// Get the part before sections start (navbar, etc) up through the Hero section end
// Find the closing </section> of the hero
let depth = 0;
let heroCloseEnd = -1;
for (let i = heroStart; i < mainui.length; i++) {
    if (mainui.substring(i, i + 8) === '<section') depth++;
    if (mainui.substring(i, i + 10) === '</section>') {
        depth--;
        if (depth === 0) {
            heroCloseEnd = i + 10;
            break;
        }
    }
}
console.log('Hero section closes at:', heroCloseEnd);

// Get everything before the hero section starts (navbar, container wrappers)
const beforeHero = mainui.substring(0, heroStart);
console.log('Before hero length:', beforeHero.length);

// Get the hero section itself
const heroSection = mainui.substring(heroStart, heroCloseEnd);
console.log('Hero section length:', heroSection.length);
console.log('Hero contains "Empowering Your Investments":', heroSection.includes('Empowering Your Investments'));

// Find the FOOTER and closing tags - we need to preserve these
const footerMarker = '<footer class="framer-QAPdK';
const footerStart = mainui.indexOf(footerMarker);
console.log('Footer starts at:', footerStart);

// Get everything from footer to end
const footerAndEnd = mainui.substring(footerStart);
console.log('Footer and end length:', footerAndEnd.length);

// Now read ui-elements.txt to get the new sections
console.log('\n=== STEP 2: Extract sections from ui-elements.txt ===');
const uiElements = fs.readFileSync('./ui-elements.txt', 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// Extract Pain Points section
function extractSection(content, sectionClass) {
    const start = content.indexOf(`<section class="${sectionClass}"`);
    if (start === -1) return null;

    let depth = 0;
    let end = -1;
    for (let i = start; i < content.length; i++) {
        if (content.substring(i, i + 8) === '<section') depth++;
        if (content.substring(i, i + 10) === '</section>') {
            depth--;
            if (depth === 0) {
                end = i + 10;
                break;
            }
        }
    }
    return end !== -1 ? content.substring(start, end) : null;
}

const painPointsSection = extractSection(uiElements, 'framer-a85jvv');
const techStackSection = extractSection(uiElements, 'framer-1e7a4qw');

console.log('Pain Points section length:', painPointsSection?.length || 0);
console.log('Tech Stack section length:', techStackSection?.length || 0);
console.log('Pain Points has "Is This You":', painPointsSection?.includes('Is This You'));
console.log('Tech Stack has "OPEN AI":', techStackSection?.includes('OPEN AI'));

// Apply color transformations
function transformColors(html) {
    if (!html) return '';
    let result = html;

    // Token mappings (purple/blue to orange)
    const tokenMappings = [
        ['--token-42c100d0-2027-4bdb-aa95-e4484836947d', '--token-8e5d2111-03fd-4926-9cea-98bf1e41078f'],
        ['--token-e55a397b-1130-495a-81d7-bb6a5ea55706', '--token-b9018599-27d5-4611-a33e-8b2f64661ff4'],
        ['--token-d15c9f48-e539-47ac-a65d-e8d45e1b3356', '--token-de954fd2-a975-4916-8b85-2e5f2acf6b9e'],
        ['--token-4548fc2b-9d6d-44c9-a93e-f4e3e101cc97', '--token-83878271-40bd-4314-b766-4d665555aa78'],
        ['--token-61401096-a7b2-42d4-b337-6544f180765b', '--token-ebf207fb-f9e0-4c9c-91c0-517fa05c795c'],
        ['--token-3ab38a9a-d499-4431-ab09-795eb635ee6b', '--token-298b4add-111d-4ff0-82fc-7d5e99a4405b'],
        ['--token-0b6762a4-a243-4ba5-8305-85fe51e0f9c0', '--token-2f086888-2254-42af-8805-28fc6ecd4e26'],
        ['--token-544975a9-640e-428e-840a-aa6d2a435039', '--token-faa915f5-e04b-4515-a52f-9a2bba33b6ba'],
    ];

    for (const [from, to] of tokenMappings) {
        result = result.split(from).join(to);
    }

    // Direct color replacements
    result = result.split('rgb(159, 146, 255)').join('rgb(255, 77, 0)');
    result = result.split('rgb(159,146,255)').join('rgb(255,77,0)');
    result = result.split('rgb(126, 111, 240)').join('rgb(184, 92, 0)');
    result = result.split('#9f92ff').join('rgb(255, 77, 0)');
    result = result.split('#7e6ff0').join('rgb(184, 92, 0)');
    result = result.split('rgb(0, 3, 25)').join('rgb(23, 23, 23)');
    result = result.split('rgb(0,3,25)').join('rgb(23,23,23)');
    result = result.split('#000319').join('rgb(23, 23, 23)');
    result = result.split('rgb(11, 14, 35)').join('rgb(28, 28, 28)');
    result = result.split('rgb(25, 28, 48)').join('rgb(28, 28, 28)');

    return result;
}

const transformedPainPoints = transformColors(painPointsSection);
const transformedTechStack = transformColors(techStackSection);

console.log('\n=== STEP 3: Build the page.tsx content ===');

// Read the current page.tsx to get the wrapper
const currentPage = fs.readFileSync('./app/page.tsx', 'utf8');
const jsxStart = currentPage.indexOf("__html: `");
const jsxEnd = currentPage.lastIndexOf("`");

if (jsxStart === -1 || jsxEnd === -1) {
    console.log('ERROR: Could not find JSX wrapper');
    process.exit(1);
}

const jsxPrefix = currentPage.substring(0, jsxStart + 9);
const jsxSuffix = currentPage.substring(jsxEnd);

// Build new HTML: before hero + hero + new sections + footer
const newHtml = beforeHero + heroSection + transformedPainPoints + transformedTechStack + footerAndEnd;

const newPageContent = jsxPrefix + newHtml.replace(/`/g, '\\`').replace(/\$/g, '\\$') + jsxSuffix;

console.log('New page content length:', newPageContent.length);
console.log('Contains Hero:', newPageContent.includes('Empowering Your Investments'));
console.log('Contains Is This You:', newPageContent.includes('Is This You'));
console.log('Contains OPEN AI:', newPageContent.includes('OPEN AI'));
console.log('Contains Bento Section:', newPageContent.includes('Bento Section'));
console.log('Contains Invest with Confidence:', newPageContent.includes('Invest with Confidence'));

// Write the new page
fs.writeFileSync('./app/page.tsx', newPageContent);
console.log('\n✅ Page rebuilt from original mainui.txt with new sections!');
