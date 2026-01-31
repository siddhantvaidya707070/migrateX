const fs = require('fs');

// Read the current page.tsx
let content = fs.readFileSync('./app/page.tsx', 'utf8');

console.log('=== STEP 1: Keep only Hero Section ===');

// Find where Hero Section ends (next section starts)
const heroSectionEnd = content.indexOf('<section', content.indexOf('id="hero"') + 10);
console.log('Hero section ends at:', heroSectionEnd);

// Find where the closing tags are (after all sections, before </div> closings)
// We need to find the footer or final closing divs
const footerStart = content.indexOf('<footer');
const ctaSection = content.indexOf('data-framer-name="CTA Section"');

// Find the last section before footer/end
let endOfSections;
if (footerStart !== -1) {
    endOfSections = footerStart;
} else {
    // Find where sections end - look for the pattern after all sections
    // Find last </section>
    let lastSectionEnd = 0;
    let pos = 0;
    while ((pos = content.indexOf('</section>', pos + 1)) !== -1) {
        lastSectionEnd = pos + 10; // after </section>
    }
    endOfSections = lastSectionEnd;
}

console.log('End of sections at:', endOfSections);

// Extract content before Hero section ends and after all sections
const beforeSections = content.substring(0, heroSectionEnd);
const afterSections = content.substring(endOfSections);

console.log('Before sections length:', beforeSections.length);
console.log('After sections length:', afterSections.length);

// Read ui-elements.txt to extract the Pain Points and Tech Stack sections
console.log('\n=== STEP 2: Extract sections from ui-elements.txt ===');
const uiElements = fs.readFileSync('./ui-elements.txt', 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// Find Pain Points section (Is This You?)
const painPointsStart = uiElements.indexOf('<section class="framer-a85jvv"');
let painPointsEnd = -1;
if (painPointsStart !== -1) {
    // Find the closing </section> for this section
    let depth = 0;
    let inSection = false;
    for (let i = painPointsStart; i < uiElements.length; i++) {
        if (uiElements.substring(i, i + 8) === '<section') {
            depth++;
            inSection = true;
        }
        if (uiElements.substring(i, i + 10) === '</section>') {
            depth--;
            if (depth === 0 && inSection) {
                painPointsEnd = i + 10;
                break;
            }
        }
    }
}

console.log('Pain Points section:', painPointsStart, '-', painPointsEnd);
const painPointsSection = painPointsStart !== -1 && painPointsEnd !== -1
    ? uiElements.substring(painPointsStart, painPointsEnd)
    : '';
console.log('Pain Points section length:', painPointsSection.length);
console.log('Has "Is This You?":', painPointsSection.includes('Is This You'));

// Find Tech Stack section
const techStackStart = uiElements.indexOf('<section class="framer-1e7a4qw"');
let techStackEnd = -1;
if (techStackStart !== -1) {
    let depth = 0;
    let inSection = false;
    for (let i = techStackStart; i < uiElements.length; i++) {
        if (uiElements.substring(i, i + 8) === '<section') {
            depth++;
            inSection = true;
        }
        if (uiElements.substring(i, i + 10) === '</section>') {
            depth--;
            if (depth === 0 && inSection) {
                techStackEnd = i + 10;
                break;
            }
        }
    }
}

console.log('Tech Stack section:', techStackStart, '-', techStackEnd);
const techStackSection = techStackStart !== -1 && techStackEnd !== -1
    ? uiElements.substring(techStackStart, techStackEnd)
    : '';
console.log('Tech Stack section length:', techStackSection.length);
console.log('Has "OPEN AI":', techStackSection.includes('OPEN AI'));
console.log('Has "ZAPIER":', techStackSection.includes('ZAPIER'));

// Apply color transformations to the sections
console.log('\n=== STEP 3: Apply color transformations ===');

function transformColors(html) {
    let result = html;

    // Token replacements
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

    // Direct color replacements (purple to orange)
    result = result.split('rgb(159, 146, 255)').join('rgb(255, 77, 0)');
    result = result.split('rgb(159,146,255)').join('rgb(255,77,0)');
    result = result.split('rgb(126, 111, 240)').join('rgb(184, 92, 0)');
    result = result.split('#9f92ff').join('rgb(255, 77, 0)');
    result = result.split('#7e6ff0').join('rgb(184, 92, 0)');

    // Dark blue to dark gray
    result = result.split('rgb(0, 3, 25)').join('rgb(23, 23, 23)');
    result = result.split('rgb(0,3,25)').join('rgb(23,23,23)');
    result = result.split('#000319').join('rgb(23, 23, 23)');
    result = result.split('rgb(11, 14, 35)').join('rgb(28, 28, 28)');
    result = result.split('rgb(25, 28, 48)').join('rgb(28, 28, 28)');
    result = result.split('#0b0e23').join('rgb(28, 28, 28)');
    result = result.split('#191c30').join('rgb(28, 28, 28)');

    return result;
}

const transformedPainPoints = transformColors(painPointsSection);
const transformedTechStack = transformColors(techStackSection);

console.log('\n=== STEP 4: Build new page content ===');

// Combine: Hero + Pain Points + Tech Stack + closing tags
const newContent = beforeSections + transformedPainPoints + transformedTechStack + afterSections;

console.log('New content length:', newContent.length);
console.log('Has "Is This You?":', newContent.includes('Is This You'));
console.log('Has "OPEN AI":', newContent.includes('OPEN AI'));

// Verify no old content
console.log('\n=== VERIFICATION ===');
console.log('Has "Invest with Confidence":', newContent.includes('Invest with Confidence'));
console.log('Has "Bento Section":', newContent.includes('Bento Section'));
console.log('Has "Smarter Investing":', newContent.includes('Smarter Investing'));
console.log('Has "Precision-Driven":', newContent.includes('Precision-Driven'));

// Write the new content
fs.writeFileSync('./app/page.tsx', newContent);
console.log('\n✅ Page rebuilt with only Hero + Is This You + Tech Stack sections!');
