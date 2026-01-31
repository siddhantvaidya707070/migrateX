/**
 * Fix the extracted CSS - replace ui-elements token references with mainui tokens
 * 
 * UI-Elements tokens -> MainUI tokens mapping:
 * 
 * COLORS:
 * - #9f92ff / rgb(159, 146, 255) -> rgb(255, 77, 0) [Purple accent -> Orange accent]
 * - #000319 / rgb(0, 3, 25) -> rgb(23, 23, 23) [Dark blue bg -> Dark gray bg]
 * - #191c30 -> rgb(28, 28, 28) [Dark card bg]
 * - #7e6ff0 / rgb(126, 111, 240) -> rgb(184, 92, 0) [Lighter purple -> Lighter orange]
 * - #898999 -> rgba(255, 255, 255, .85) [Gray text]
 * - #0b0e23 -> rgb(28, 28, 28) [Darker bg]
 * - #fff -> rgb(255, 255, 255) [White stays white]
 * 
 * TOKEN NAMES:
 * --token-42c100d0-2027-4bdb-aa95-e4484836947d (dark bg) -> --token-8e5d2111-03fd-4926-9cea-98bf1e41078f
 * --token-d15c9f48-e539-47ac-a65d-e8d45e1b3356 (white) -> --token-de954fd2-a975-4916-8b85-2e5f2acf6b9e
 * --token-4548fc2b-9d6d-44c9-a93e-f4e3e101cc97 (purple accent) -> --token-83878271-40bd-4314-b766-4d665555aa78
 * --token-61401096-a7b2-42d4-b337-6544f180765b (purple) -> --token-ebf207fb-f9e0-4c9c-91c0-517fa05c795c
 * --token-e55a397b-1130-495a-81d7-bb6a5ea55706 (card bg) -> --token-b9018599-27d5-4611-a33e-8b2f64661ff4
 * --token-98dc27e7-7ab5-4e52-a7a3-0fd5027d7a93 (darker) -> --token-e6cc12f6-2333-405c-a82f-b6c94880d746
 * --token-0b6762a4-a243-4ba5-8305-85fe51e0f9c0 (border) -> --token-2f086888-2254-42af-8805-28fc6ecd4e26
 * --token-544975a9-640e-428e-840a-aa6d2a435039 (gray text) -> --token-faa915f5-e04b-4515-a52f-9a2bba33b6ba
 * --token-3ab38a9a-d499-4431-ab09-795eb635ee6b (deep purple) -> --token-298b4add-111d-4ff0-82fc-7d5e99a4405b
 * --token-dc93abcb-92ba-4db3-9f0d-728c3c4c1331 (border accent) -> --token-f799a2df-306e-498f-bee9-a5591c59bc52
 * --token-2af3a6dd-07e0-4581-9fa0-96555d2bfc28 (gold) -> --token-ba966f44-b096-454c-b9a7-2e7b01439cc6
 * --token-1b428251-3d27-46ab-b542-720506925bca (mid) -> --token-a389eb76-d675-4e61-8c10-0746feafc510
 */

const fs = require('fs');

let css = fs.readFileSync('./app/ui-elements-sections.css', 'utf8');

// Token name replacements (ui-elements -> mainui)
const tokenMappings = [
    // Background colors
    ['--token-42c100d0-2027-4bdb-aa95-e4484836947d', '--token-8e5d2111-03fd-4926-9cea-98bf1e41078f'], // Dark BG
    ['--token-e55a397b-1130-495a-81d7-bb6a5ea55706', '--token-b9018599-27d5-4611-a33e-8b2f64661ff4'], // Card BG
    ['--token-98dc27e7-7ab5-4e52-a7a3-0fd5027d7a93', '--token-e6cc12f6-2333-405c-a82f-b6c94880d746'], // Darker
    ['--token-792c11ab-43f4-4069-b4bd-583dc86c0e59', '--token-e6cc12f6-2333-405c-a82f-b6c94880d746'], // Card gradient start
    ['--token-d9d7e27c-646b-4789-beaa-871d7361a14f', '--token-a72e40d5-b29d-41f2-bb9d-24392d1b3008'], // Card gradient end

    // Text colors
    ['--token-d15c9f48-e539-47ac-a65d-e8d45e1b3356', '--token-de954fd2-a975-4916-8b85-2e5f2acf6b9e'], // White
    ['--token-544975a9-640e-428e-840a-aa6d2a435039', '--token-faa915f5-e04b-4515-a52f-9a2bba33b6ba'], // Gray text

    // Accent colors
    ['--token-4548fc2b-9d6d-44c9-a93e-f4e3e101cc97', '--token-83878271-40bd-4314-b766-4d665555aa78'], // Primary accent (purple -> orange)
    ['--token-61401096-a7b2-42d4-b337-6544f180765b', '--token-ebf207fb-f9e0-4c9c-91c0-517fa05c795c'], // Secondary accent
    ['--token-3ab38a9a-d499-4431-ab09-795eb635ee6b', '--token-298b4add-111d-4ff0-82fc-7d5e99a4405b'], // Deep accent
    ['--token-2af3a6dd-07e0-4581-9fa0-96555d2bfc28', '--token-ba966f44-b096-454c-b9a7-2e7b01439cc6'], // Gold

    // Borders
    ['--token-0b6762a4-a243-4ba5-8305-85fe51e0f9c0', '--token-2f086888-2254-42af-8805-28fc6ecd4e26'], // Border
    ['--token-dc93abcb-92ba-4db3-9f0d-728c3c4c1331', '--token-f799a2df-306e-498f-bee9-a5591c59bc52'], // Border accent

    // Other
    ['--token-1b428251-3d27-46ab-b542-720506925bca', '--token-a389eb76-d675-4e61-8c10-0746feafc510'], // Mid color
    ['--token-5a267d25-f8e9-49c1-863d-00c149b5b458', '--token-a72e40d5-b29d-41f2-bb9d-24392d1b3008'], // Overlay
];

// Direct color replacements
const colorMappings = [
    // Purple to Orange
    ['#9f92ff', 'rgb(255, 77, 0)'],
    ['#7e6ff0', 'rgb(184, 92, 0)'],
    ['#4a32ff', 'rgb(204, 61, 0)'],
    ['rgb(159, 146, 255)', 'rgb(255, 77, 0)'],
    ['rgb(159,146,255)', 'rgb(255,77,0)'],
    ['rgb(126, 111, 240)', 'rgb(184, 92, 0)'],
    ['rgb(126,111,240)', 'rgb(184,92,0)'],
    ['rgb(74, 50, 255)', 'rgb(204, 61, 0)'],
    ['rgb(74,50,255)', 'rgb(204,61,0)'],
    ['rgba(159, 146, 255', 'rgba(255, 77, 0'],
    ['rgba(159,146,255', 'rgba(255,77,0'],

    // Dark blue to Dark gray
    ['#000319', 'rgb(23, 23, 23)'],
    ['#191c30', 'rgb(28, 28, 28)'],
    ['#0b0e23', 'rgb(28, 28, 28)'],
    ['#353b66', 'rgba(138, 138, 138, 0.3)'],
    ['rgb(0, 3, 25)', 'rgb(23, 23, 23)'],
    ['rgb(0,3,25)', 'rgb(23,23,23)'],
    ['rgb(18, 22, 53)', 'rgb(28, 28, 28)'],
    ['rgb(18,22,53)', 'rgb(28,28,28)'],
    ['rgb(11, 14, 35)', 'rgb(28, 28, 28)'],
    ['rgb(11,14,35)', 'rgb(28,28,28)'],
    ['rgb(25, 28, 48)', 'rgb(32, 32, 32)'],
    ['rgb(25,28,48)', 'rgb(32,32,32)'],
    ['rgb(53, 59, 102)', 'rgba(138, 138, 138, 0.3)'],
    ['rgb(53,59,102)', 'rgba(138,138,138,0.3)'],

    // Gray text adjustment
    ['#898999', 'rgba(255, 255, 255, 0.85)'],
    ['rgb(137, 137, 153)', 'rgba(255, 255, 255, 0.85)'],
    ['rgb(137,137,153)', 'rgba(255,255,255,0.85)'],

    // Gold colors
    ['#ffcc6d', 'rgb(250, 187, 0)'],
    ['rgb(255, 204, 109)', 'rgb(250, 187, 0)'],
    ['rgb(255,204,109)', 'rgb(250,187,0)'],
];

console.log('Applying token mappings...');
for (const [from, to] of tokenMappings) {
    const count = (css.match(new RegExp(from.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g')) || []).length;
    if (count > 0) {
        console.log(`  ${from} -> ${to} (${count} occurrences)`);
        css = css.split(from).join(to);
    }
}

console.log('\nApplying color mappings...');
for (const [from, to] of colorMappings) {
    const count = (css.match(new RegExp(from.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi')) || []).length;
    if (count > 0) {
        console.log(`  ${from} -> ${to} (${count} occurrences)`);
        css = css.split(from).join(to);
    }
}

// Remove the body block that redefines tokens (it conflicts with mainui)
console.log('\nRemoving conflicting body token definitions...');
// Find and remove the body block with token definitions
const bodyBlockStart = css.indexOf('body{--token-');
if (bodyBlockStart !== -1) {
    let braceCount = 0;
    let bodyBlockEnd = -1;
    for (let i = bodyBlockStart + 4; i < css.length; i++) {
        if (css[i] === '{') braceCount++;
        if (css[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
                bodyBlockEnd = i + 1;
                break;
            }
        }
    }
    if (bodyBlockEnd !== -1) {
        const removedBlock = css.substring(bodyBlockStart, bodyBlockEnd);
        if (removedBlock.includes('--token-42c100d0') || removedBlock.includes('--token-d15c9f48')) {
            console.log('  Removed conflicting body token block');
            css = css.substring(0, bodyBlockStart) + css.substring(bodyBlockEnd);
        }
    }
}

// Write the fixed CSS
fs.writeFileSync('./app/ui-elements-sections.css', css);
console.log('\nFixed CSS written to ./app/ui-elements-sections.css');
console.log('File size:', css.length, 'chars');
