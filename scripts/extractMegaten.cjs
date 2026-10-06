const fs = require('fs');
const path = require('path');
const { Persona, Skill } = require('megaten');

const dataDir = path.join(__dirname, '..', 'src', 'data');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

console.log('Extraindo Personas...');
const personas = [];
for (const [name, persona] of Persona.map.entries()) {
    // A API megaten pode ter Personas com referências complexas. Vamos extrair o essencial.
    personas.push({
        name: persona.name,
        arcana: persona.arcana,
        level: persona.level,
        stats: persona.stats,
        resistances: persona.resistances,
        learnset: persona.learnset,
        game: persona.game
    });
}

fs.writeFileSync(path.join(dataDir, 'personas.json'), JSON.stringify(personas, null, 2));
console.log(`Personas extraídas: ${personas.length}`);

console.log('Extraindo Skills...');
const skills = [];
// Assuming Skill.map exists, let's check it. If not, we'll handle it.
if (Skill && Skill.map) {
    for (const [name, skill] of Skill.map.entries()) {
        skills.push({
            name: skill.name,
            affinity: skill.affinity,
            type: skill.type,
            cost: skill.cost,
            description: skill.description
        });
    }
    fs.writeFileSync(path.join(dataDir, 'skills.json'), JSON.stringify(skills, null, 2));
    console.log(`Skills extraídas: ${skills.length}`);
} else {
    console.log('Skill.map não encontrado, ignorando skills.');
}

console.log('Extração concluída!');
