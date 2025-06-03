const fs = require('fs');

// Read the file
const filePath = 'src/unittests/sr6.Testing.spec.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Find all actor creation patterns
const actorCreationPattern = /const (actor|attacker|defender) = await testActor\.create\(\{(?!\s*flags)/g;

// Replace with the version that includes the hasMatrixActions flag
const replacement = 'const $1 = await testActor.create({\n                    flags: {\n                        \'sr6elysium\': {\n                            hasMatrixActions: true\n                        }\n                    },';

// Perform the replacement
const updatedContent = content.replace(actorCreationPattern, replacement);

// Write the updated content back to the file
fs.writeFileSync(filePath, updatedContent, 'utf8');

console.log('Testing file updated successfully!');
