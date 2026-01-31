/**
 * Fix the migrated HTML in page.tsx - replace ui-elements tokens and colors with mainui ones
 */

const fs = require('fs');

let content = fs.readFileSync('./app/page.tsx', 'utf8');

// Token name replacements (ui-elements -> mainui)
const tokenMappings = [
    ['--token-42c100d0-2027-4bdb-aa95-e4484836947d', '--token-8e5d2111-03fd-4926-9cea-98bf1e41078f'],
    ['--token-e55a397b-1130-495a-81d7-bb6a5ea55706', '--token-b9018599-27d5-4611-a33e-8b2f64661ff4'],
    ['--token-98dc27e7-7ab5-4e52-a7a3-0fd5027d7a93', '--token-e6cc12f6-2333-405c-a82f-b6c94880d746'],
    ['--token-792c11ab-43f4-4069-b4bd-583dc86c0e59', '--token-e6cc12f6-2333-405c-a82f-b6c94880d746'],
    ['--token-d9d7e27c-646b-4789-beaa-871d7361a14f', '--token-a72e40d5-b29d-41f2-bb9d-24392d1b3008'],
    ['--token-d15c9f48-e539-47ac-a65d-e8d45e1b3356', '--token-de954fd2-a975-4916-8b85-2e5f2acf6b9e'],
    ['--token-544975a9-640e-428e-840a-aa6d2a435039', '--token-faa915f5-e04b-4515-a52f-9a2bba33b6ba'],
    ['--token-4548fc2b-9d6d-44c9-a93e-f4e3e101cc97', '--token-83878271-40bd-4314-b766-4d665555aa78'],
    ['--token-61401096-a7b2-42d4-b337-6544f180765b', '--token-ebf207fb-f9e0-4c9c-91c0-517fa05c795c'],
    ['--token-3ab38a9a-d499-4431-ab09-795eb635ee6b', '--token-298b4add-111d-4ff0-82fc-7d5e99a4405b'],
    ['--token-2af3a6dd-07e0-4581-9fa0-96555d2bfc28', '--token-ba966f44-b096-454c-b9a7-2e7b01439cc6'],
    ['--token-0b6762a4-a243-4ba5-8305-85fe51e0f9c0', '--token-2f086888-2254-42af-8805-28fc6ecd4e26'],
    ['--token-dc93abcb-92ba-4db3-9f0d-728c3c4c1331', '--token-f799a2df-306e-498f-bee9-a5591c59bc52'],
    ['--token-1b428251-3d27-46ab-b542-720506925bca', '--token-a389eb76-d675-4e61-8c10-0746feafc510'],
    ['--token-5a267d25-f8e9-49c1-863d-00c149b5b458', '--token-a72e40d5-b29d-41f2-bb9d-24392d1b3008'],
];

// Direct color replacements
const colorMappings = [
    // Purple to Orange
    ['rgb(159, 146, 255)', 'rgb(255, 77, 0)'],
    ['rgb(159,146,255)', 'rgb(255,77,0)'],
    ['rgb(126, 111, 240)', 'rgb(184, 92, 0)'],
    ['rgb(126,111,240)', 'rgb(184,92,0)'],
    ['rgb(74, 50, 255)', 'rgb(204, 61, 0)'],
    ['rgb(74,50,255)', 'rgb(204,61,0)'],
    ['rgba(159, 146, 255', 'rgba(255, 77, 0'],
    ['rgba(159,146,255', 'rgba(255,77,0'],

    // Dark blue to Dark gray
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
    ['rgb(137, 137, 153)', 'rgba(255, 255, 255, 0.85)'],
    ['rgb(137,137,153)', 'rgba(255,255,255,0.85)'],

    // Gold colors
    ['rgb(255, 204, 109)', 'rgb(250, 187, 0)'],
    ['rgb(255,204,109)', 'rgb(250,187,0)'],
];

console.log('Fixing page.tsx HTML...\n');

console.log('Applying token mappings...');
for (const [from, to] of tokenMappings) {
    const count = (content.match(new RegExp(from.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g')) || []).length;
    if (count > 0) {
        console.log(`  ${from.substring(0, 30)}... -> ${to.substring(0, 30)}... (${count} occurrences)`);
        content = content.split(from).join(to);
    }
}

console.log('\nApplying color mappings...');
for (const [from, to] of colorMappings) {
    const count = (content.match(new RegExp(from.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi')) || []).length;
    if (count > 0) {
        console.log(`  ${from} -> ${to} (${count} occurrences)`);
        content = content.split(from).join(to);
    }
}

// Write the fixed content
fs.writeFileSync('./app/page.tsx', content);
console.log('\nFixed page.tsx written');
console.log('File size:', content.length, 'chars');
