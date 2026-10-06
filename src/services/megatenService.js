import personasData from '../data/personas.json';
import skillsData from '../data/skills.json';
import companionsData from '../data/companions.json';

// Mapeamento de jogo para label legível
const GAME_LABELS = { p3: 'Persona 3', p4: 'Persona 4', p5: 'Persona 5' }

class MegatenService {
    /**
     * Retorna todas as Personas extraídas.
     * @returns {Array} Lista de personas
     */
    getAllPersonas() {
        return personasData;
    }

    /**
     * Busca uma Persona pelo nome (case-insensitive).
     * @param {string} name 
     * @returns {Object|null} Persona encontrada
     */
    getPersonaByName(name) {
        if (!name) return null;
        const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return personasData.find(p => 
            p.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedName
        ) || null;
    }

    /**
     * Filtra Personas por Arcana.
     * @param {string} arcana 
     * @returns {Array} Lista de personas daquela arcana
     */
    getPersonasByArcana(arcana) {
        if (!arcana) return [];
        return personasData.filter(p => p.arcana.toLowerCase() === arcana.toLowerCase());
    }

    /**
     * Retorna Personas que o jogador pode obter/fundir (Nível <= nível do jogador).
     * @param {number} maxLevel 
     * @returns {Array} Lista de personas permitidas
     */
    getPersonasByLevel(maxLevel) {
        return personasData.filter(p => p.level <= maxLevel);
    }

    /**
     * Retorna todas as Skills.
     * @returns {Array} Lista de skills
     */
    getAllSkills() {
        return skillsData;
    }

    /**
     * Busca uma skill pelo nome.
     * @param {string} name 
     * @returns {Object|null}
     */
    getSkillByName(name) {
        if (!name) return null;
        const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return skillsData.find(s => 
            s.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedName
        ) || null;
    }

    /**
     * Retorna todos os companheiros extraídos da database.
     * @returns {Array}
     */
    getAllCompanions() {
        return companionsData;
    }

    /**
     * Filtra companheiros de um jogo específico (p3, p4, p5).
     * @param {string} game 
     * @returns {Array}
     */
    getCompanionsByGame(game) {
        return companionsData.filter(c => c.game === game);
    }

    /**
     * Retorna N companheiros aleatórios (opcionalmente com nível máximo).
     * @param {number} count - quantidade desejada
     * @param {number|null} maxLevel - nível máximo (opcional)
     * @returns {Array}
     */
    getRandomCompanions(count = 3, maxLevel = null) {
        const pool = maxLevel 
            ? companionsData.filter(c => c.nivel <= maxLevel)
            : [...companionsData];
        return pool.sort(() => 0.5 - Math.random()).slice(0, count);
    }

    /**
     * Formata o label do jogo de origem para exibição.
     * @param {string} gameCode 
     * @returns {string}
     */
    getGameLabel(gameCode) {
        return GAME_LABELS[gameCode] || gameCode;
    }
}

export default new MegatenService();
