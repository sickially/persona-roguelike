import fusionChartData from '../data/fusion-chart.json';
import personasData from '../data/personas.json';

// Arcanas especiais que só existem como resultado de Fusão Avançada
const SPECIAL_ARCANAS = ['Judgement'];

/**
 * Constrói o lookup de fusão de arcanas a partir do fusion-chart.json.
 * O formato da tabela é triangular: table[i][j] = resultado para races[i] x races[j]
 * onde i > j.
 */
function buildFusionLookup() {
    const { races, table } = fusionChartData;
    const lookup = new Map();

    for (let i = 0; i < races.length; i++) {
        for (let j = 0; j < (table[i]?.length ?? 0); j++) {
            const result = table[i][j];
            if (result === '-') continue;

            const key1 = `${races[i]}|${races[j]}`;
            const key2 = `${races[j]}|${races[i]}`;
            lookup.set(key1, result);
            lookup.set(key2, result);
        }
    }

    return lookup;
}

const FUSION_LOOKUP = buildFusionLookup();

/**
 * Dado o nível base (média dos dois + 1), encontra a persona da arcana resultante
 * com o maior nível que não exceda o targetLevel.
 */
function findResultPersona(arcana, targetLevel, excludeNames = []) {
    const candidates = personasData
        .filter(p =>
            p.arcana === arcana &&
            !excludeNames.includes(p.name)
        )
        .sort((a, b) => a.level - b.level);

    if (candidates.length === 0) return null;

    let result = null;
    for (const p of candidates) {
        if (p.level <= targetLevel) result = p;
        else break;
    }

    return result ?? candidates[0];
}

/**
 * Calcula o nível resultante da fusão de duas personas.
 * Fórmula do P5: floor((levelA + levelB) / 2) + 1
 */
function calcResultLevel(levelA, levelB) {
    return Math.floor((levelA + levelB) / 2) + 1;
}

class FusionService {
    fuseTwo(personaA, personaB) {
        if (!personaA || !personaB) {
            return { result: null, resultArcana: null, error: 'Selecione duas Personas válidas.' };
        }
        if (personaA.name === personaB.name) {
            return { result: null, resultArcana: null, error: 'Não é possível fundir uma Persona consigo mesma.' };
        }
        if (SPECIAL_ARCANAS.includes(personaA.arcana) || SPECIAL_ARCANAS.includes(personaB.arcana)) {
            return { result: null, resultArcana: null, error: 'Arcanas especiais não podem ser fundidas normalmente.' };
        }

        const key = `${personaA.arcana}|${personaB.arcana}`;
        const resultArcana = FUSION_LOOKUP.get(key);

        if (!resultArcana) {
            return {
                result: null,
                resultArcana: null,
                error: `Não há fusão possível entre ${personaA.arcana} e ${personaB.arcana}.`
            };
        }

        const targetLevel = calcResultLevel(personaA.level, personaB.level);
        const result = findResultPersona(resultArcana, targetLevel, [personaA.name, personaB.name]);

        if (!result) {
            return {
                result: null,
                resultArcana,
                error: `Nenhuma Persona disponível na arcana ${resultArcana} para este nível.`
            };
        }

        return { result, resultArcana, error: null };
    }

    getAllArcanas() {
        return fusionChartData.races;
    }

    canFuse(arcanaA, arcanaB) {
        return FUSION_LOOKUP.has(`${arcanaA}|${arcanaB}`);
    }

    getResultArcana(arcanaA, arcanaB) {
        return FUSION_LOOKUP.get(`${arcanaA}|${arcanaB}`) ?? null;
    }

    getAllFusionOptions(inventory) {
        const options = [];
        for (let i = 0; i < inventory.length; i++) {
            for (let j = i + 1; j < inventory.length; j++) {
                const { result, resultArcana, error } = this.fuseTwo(inventory[i], inventory[j]);
                if (!error && result) {
                    options.push({
                        personaA: inventory[i],
                        personaB: inventory[j],
                        result,
                        resultArcana,
                    });
                }
            }
        }
        return options;
    }
}

export default new FusionService();
