const fs = require('fs');
const skills = JSON.parse(fs.readFileSync('src/data/skills.json', 'utf8'));

const affinities = new Set();
const types = new Set();

skills.forEach(s => {
    if (s.affinity) affinities.add(s.affinity);
    if (s.type) types.add(s.type);
});

console.log('Affinities:', Array.from(affinities).join(', '));
console.log('Types:', Array.from(types).join(', '));
