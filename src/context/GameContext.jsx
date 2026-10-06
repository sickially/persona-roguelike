import { createContext, useContext, useState, useCallback } from 'react'
import megatenService from '../services/megatenService'

// ────────────────────────────────────────────
//  Helpers de construção de membros
// ────────────────────────────────────────────

const NIVEL_INICIAL = 4

const ICONES_JOGO = { p3: '🌙', p4: '📺', p5: '🃏' }

/**
 * Extrai o custo numérico de uma skill, independente do formato do campo cost.
 * O JSON pode ter cost como: number | { stat, amount } | null | undefined
 */
export function getCustoSkill(skill) {
    if (!skill) return 0
    if (typeof skill.cost === 'number') return skill.cost
    if (skill.cost && typeof skill.cost === 'object') return skill.cost.amount ?? 0
    return 0
}

/**
 * Retorna o stat de custo: 'HP' para skills físicas, 'SP' para as demais.
 */
export function getStatCustoSkill(skill) {
    if (!skill) return 'SP'
    if (typeof skill.cost === 'object' && skill.cost?.stat === 'HP') return 'HP'
    if (skill.affinity === 'Phys' || skill.affinity === 'Gun') return 'HP'
    return 'SP'
}

/**
 * Filtra e escolhe as skills de acordo com as regras:
 * 1. Máximo 4 skills
 * 2. As 3 primeiras podem ser qualquer coisa, menos suporte (se possível)
 * 3. A 4ª skill SEMPRE DEVE SER uma skill de suporte (cura ou buff)
 * @param {Array} candidatos - array de nomes de skills ou objetos {name: "..."}
 */
function selecionarSkills(candidatos = []) {
    const skillsReais = candidatos
        .map(c => typeof c === 'string' ? c : c.name)
        .map(nome => megatenService.getSkillByName(nome))
        .filter(Boolean)

    const isSupport = (s) => s.type === 'HEALING' || s.type === 'SUPPORT' || s.affinity === 'Healing' || s.affinity === 'Support'
    
    let ofensivas = skillsReais.filter(s => !isSupport(s))
    let suportes = skillsReais.filter(s => isSupport(s))

    // Se não tiver nenhuma skill de suporte na pool original, dá uma padrão básica
    if (suportes.length === 0) {
        suportes.push(megatenService.getSkillByName('Dia')) // Cura básica
    }

    // Se não tiver ofensivas suficientes, preenche com Cleave (físico) ou Zio (mágico)
    if (ofensivas.length === 0) {
        ofensivas.push(megatenService.getSkillByName('Cleave'))
    }

    // Pega até 3 ofensivas
    const selecionadas = ofensivas.slice(0, 3)

    // Adiciona 1 suporte — garante que não é null
    const skillSuporte = suportes.find(Boolean)
    if (skillSuporte) selecionadas.push(skillSuporte)

    // Remove qualquer null/undefined que possa ter escapado
    return selecionadas.filter(Boolean)
}


/**
 * Monta o membro PROTAGONISTA a partir da persona escolhida na seleção.
 * @param {Object} personaObj - objeto persona da database (com stats)
 * @param {string} nomeJogador - nome salvo no localStorage
 */
function montarProtagonista(personaObj, nomeJogador) {
    const en = personaObj?.stats?.en ?? 5
    const ma = personaObj?.stats?.ma ?? 4
    // HP robusto — mínimo 150 para o nível 4
    const hpMax = Math.max(150, en * 15 + 75)
    const spMax = Math.max(80,  ma * 10 + 40)

    return {
        id: 1,
        nome: nomeJogador || 'Protagonista',
        nivel: NIVEL_INICIAL,
        personaEquipada: personaObj?.name ?? 'Arsene',
        subPersona: null,
        hp: hpMax,
        hpMax,
        sp: spMax,
        spMax,
        icone: '🃏',
        arma: 'Adaga Inicial',
        armadura: 'Uniforme Escolar',
        isProtagonista: true,
        skills: selecionarSkills(personaObj?.learnset ?? []),
    }
}

/**
 * Monta um membro COMPANHEIRO a partir dos dados da database de companions.
 * @param {Object} companionData - objeto companion da database
 * @param {number} memberId - ID único do membro
 */
function montarCompanheiro(companionData, memberId) {
    const st = companionData?.stats?.st ?? 3
    const vi = companionData?.stats?.vi ?? 3
    const ma = companionData?.stats?.ma ?? 3

    // HP robusto — mínimo 120 para companheiros nível 4
    const hpMax = Math.max(120, vi * 18 + 70)
    const spMax = Math.max(50,  ma * 8  + 30)

    const icone = ICONES_JOGO[companionData?.game] ?? '⭐'

    return {
        id: memberId,
        nome: companionData.nome,
        nivel: NIVEL_INICIAL,
        personaEquipada: companionData.personaInicial,
        subPersona: null,
        hp: hpMax,
        hpMax,
        sp: spMax,
        spMax,
        icone,
        arma: `Arma de ${companionData.nome.split(' ')[0]}`,
        armadura: `Armadura de ${companionData.nome.split(' ')[0]}`,
        isProtagonista: false,
        game: companionData.game,
        arcana: companionData.arcana,
        learnset: companionData.learnsetInicial ?? [],
        skills: selecionarSkills(companionData.learnsetInicial ?? []),
    }
}

/**
 * Equipe padrão — usada apenas como fallback antes do jogador confirmar a seleção.
 * Todos em nível 4.
 */
function montarEquipePadrao() {
    const arsene = megatenService.getPersonaByName('Arsene')
        ?? megatenService.getAllPersonas()[0]
    const protagonista = montarProtagonista(arsene, 'Protagonista')

    // Pega 2 companheiros de nível baixo como fallback
    const fallbacks = megatenService.getRandomCompanions(2, 8)
    const comp1 = fallbacks[0] ? montarCompanheiro(fallbacks[0], 2) : null
    const comp2 = fallbacks[1] ? montarCompanheiro(fallbacks[1], 3) : null

    return [protagonista, comp1, comp2].filter(Boolean)
}

/**
 * Inventário inicial do protagonista (personas no bolso, não equipadas).
 * A persona equipada NÃO entra aqui — está em personaEquipada do membro.
 */
function montarInventarioInicial(personaEquipada) {
    const extras = ['Pixie', 'Slime', 'Jack-o-Lantern', 'Sandman']
        .map(n => megatenService.getPersonaByName(n))
        .filter(p => p && p.name !== personaEquipada?.name)

    // Fallback se nomes não baterem
    if (extras.length < 2) {
        return megatenService.getAllPersonas()
            .filter(p => p.name !== personaEquipada?.name)
            .slice(0, 4)
    }
    return extras
}

// ────────────────────────────────────────────
//  Context
// ────────────────────────────────────────────
const GameContext = createContext(null)

export function GameProvider({ children }) {
    // Flag: jogo já foi inicializado com as escolhas do jogador?
    const [jogoIniciado, setJogoIniciado] = useState(false)

    // Equipe de combate (null até inicializar)
    const [equipe, setEquipe] = useState(() => montarEquipePadrao())

    // Inventário de personas do PROTAGONISTA (podem ser fundidas)
    const [inventarioPersonas, setInventarioPersonas] = useState([])

    // Compêndio: personas registradas { [nome]: personaObj }
    const [compendio, setCompendio] = useState({})

    // Moedas
    const [yen, setYen] = useState(0)

    // ── Personas equipadas pela equipe toda (bloqueadas para fusão) ──
    const personasEquipadas = equipe.map(m => m.personaEquipada).filter(Boolean)

    // ── Inventário disponível para fusão ──
    const inventarioParaFusao = inventarioPersonas.filter(
        p => !personasEquipadas.includes(p.name)
    )

    // ────────────────────────────────────────────
    //  INICIALIZAR JOGO com as escolhas do jogador
    // ────────────────────────────────────────────
    /**
     * Chamado pelo Hub ao receber as escolhas da SelecaoInicial.
     * @param {string} personaEscolhida      - nome da persona escolhida
     * @param {string|string[]} companheiros - nome(s) do(s) companheiro(s) escolhido(s)
     */
    const inicializarJogo = useCallback((personaEscolhida, companheiros) => {
        if (jogoIniciado) return

        const personaCompleta = megatenService.getPersonaByName(personaEscolhida?.name ?? personaEscolhida)
            ?? megatenService.getAllPersonas()[0]

        const nomeJogador = localStorage.getItem('personaRoguelike_nome') || 'Protagonista'
        const protagonista = montarProtagonista(personaCompleta, nomeJogador)

        // Normaliza para array (compatível com string legada ou array novo)
        const listaCompanheiros = Array.isArray(companheiros)
            ? companheiros
            : companheiros ? [companheiros] : []

        // Monta até 3 companheiros (total party = 4 com protagonista)
        const todosCompanions = megatenService.getAllCompanions()
        const membrosCompanheiros = listaCompanheiros
            .slice(0, 3)
            .map((nomeOuObj, index) => {
                const nome = typeof nomeOuObj === 'string' ? nomeOuObj : (nomeOuObj?.nome ?? nomeOuObj)
                const data = todosCompanions.find(c => c.nome === nome)
                return data ? montarCompanheiro(data, index + 2) : null
            })
            .filter(Boolean)

        const novaEquipe = [protagonista, ...membrosCompanheiros]
        const novoInventario = montarInventarioInicial(personaCompleta)

        setEquipe(novaEquipe)
        setInventarioPersonas(novoInventario)
        setYen(0)
        setCompendio({})
        setJogoIniciado(true)
    }, [jogoIniciado])


    // ── Registrar persona no compêndio ──
    const registrarNoCompendio = useCallback((persona) => {
        setCompendio(prev => ({ ...prev, [persona.name]: persona }))
    }, [])

    // ── Invocar persona do compêndio (custo: nivel * 100 Yen) ──
    const invocarDoCompendio = useCallback((nomePersona) => {
        const persona = compendio[nomePersona]
        if (!persona) return { sucesso: false, erro: 'Persona não registrada no compêndio.' }

        const custo = persona.level * 100
        if (yen < custo) return { sucesso: false, erro: `Yen insuficiente. Custo: ¥${custo.toLocaleString('pt-BR')}` }

        const jaTemNoInventario = inventarioPersonas.some(p => p.name === nomePersona)
        if (jaTemNoInventario) return { sucesso: false, erro: 'Persona já está no seu inventário.' }

        setYen(prev => prev - custo)
        setInventarioPersonas(prev => [...prev, persona])
        return { sucesso: true }
    }, [compendio, yen, inventarioPersonas])

    // ── Fundir personas ──
    const executarFusao = useCallback((personaA, personaB, resultado) => {
        setInventarioPersonas(prev =>
            prev
                .filter(p => p.name !== personaA.name && p.name !== personaB.name)
                .concat(resultado)
        )
    }, [])

    // ── Ganhar Yen ──
    const ganharYen = useCallback((quantidade) => {
        setYen(prev => prev + quantidade)
    }, [])

    // ── Atualizar HP/SP de um membro específico ──
    const atualizarHpSp = useCallback((membroId, novoHp, novoSp) => {
        setEquipe(prev => prev.map(m =>
            m.id === membroId
                ? { ...m, hp: Math.max(0, Math.min(novoHp, m.hpMax)), sp: Math.max(0, Math.min(novoSp, m.spMax)) }
                : m
        ))
    }, [])

    // ── Sincronizar equipe após combate ──
    // Membros K.O. (hp=0) voltam com 1 HP para não ficarem permanentemente mortos
    const atualizarEquipeAposCombate = useCallback((estadoFinal) => {
        setEquipe(prev => prev.map(m => {
            const novo = estadoFinal.find(e => e.id === m.id)
            if (!novo) return m
            const hpFinal = Math.max(0, Math.min(novo.hp, m.hpMax))
            return {
                ...m,
                // Membro K.O. volta com 1 HP ("inconsciente, mas vivo")
                hp: hpFinal === 0 ? 1 : hpFinal,
                sp: Math.max(0, Math.min(novo.sp, m.spMax)),
            }
        }))
    }, [])

    return (
        <GameContext.Provider value={{
            jogoIniciado,
            inicializarJogo,
            equipe,
            setEquipe,
            inventarioPersonas,
            setInventarioPersonas,
            inventarioParaFusao,
            personasEquipadas,
            compendio,
            registrarNoCompendio,
            invocarDoCompendio,
            executarFusao,
            yen,
            ganharYen,
            setYen,
            atualizarHpSp,
            atualizarEquipeAposCombate,
        }}>
            {children}
        </GameContext.Provider>
    )
}

export function useGame() {
    const ctx = useContext(GameContext)
    if (!ctx) throw new Error('useGame deve ser usado dentro de <GameProvider>')
    return ctx
}
