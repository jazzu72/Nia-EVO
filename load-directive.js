const fs = require('fs');
const directive = JSON.parse(fs.readFileSync('./nia_directive.json', 'utf8'));

console.log('🧠 Loading Nia\'s directive...');
console.log(`Mission: ${directive.mission}`);
console.log(`Primary Objective: ${directive.primary_objective}`);
console.log(`✅ Directive loaded. She will now execute.`);

// Store in memory.json as part of her permanent state
const memory = JSON.parse(fs.readFileSync('./memory.json', 'utf8'));
memory.directive = directive;
fs.writeFileSync('./memory.json', JSON.stringify(memory, null, 2));
