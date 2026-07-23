const fs = require('fs');
const directive = JSON.parse(fs.readFileSync('./nia_executive_directive.json', 'utf8'));

console.log('🧠 Loading Nia\'s executive directive...');
console.log(`Mission: ${directive.mission}`);
console.log(`Timeline: Retire by ${directive.timeline}`);
console.log(`Year 1 Target: $${directive.targets.year_1.total.toLocaleString()}`);

const memory = JSON.parse(fs.readFileSync('./memory.json', 'utf8'));
memory.directive = directive;
fs.writeFileSync('./memory.json', JSON.stringify(memory, null, 2));

console.log('✅ Directive loaded. She will now execute the 3‑year plan.');
