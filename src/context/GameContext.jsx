import { createContext, useContext, useState, useCallback } from 'react'
import megatenService from '../services/megatenService'

// ────────────────────────────────────────────
//  Estado inicial do jogo
// ────────────────────────────────────────────

// Personas do protagonista no inventário (slot de fusão)
const PERSONAS_INICIAIS_PROTO = [
    megatenService.getPersonaByName('Arsene'),
    megatenService.getPersonaByName('Pixie'),
    megatenService.getPersonaByName('Slime'),
    megatenService.getPersonaByName('Jack-o-Lantern'),
    megatenService.getPersonaByName('Sandman'),
].filter(Boolean)

// Fallback caso os nomes não batam exatamente
const PERSONAS_FALLBACK = megatenService.getAllPersonas().slice(0, 5)
const PERSONAS_PROTO = PERSONAS_INICIAIS_PROTO.length >= 2
    ? PERSONAS_INICIAIS_PROTO
    : PERSONAS_FALLBACK

// Equipe com personas equipadas (essas NÃO podem ser fundidas)
const EQUIPE_INICIAL = [
    {
        id: 1,
        nome: 'Protagonista',
        nivel: 5,
        personaEquipada: 'Arsène',   // nome da persona ativa
        subPersona: null,
        hp: 100, hpMax: 100,
        sp: 80,  spMax: 100,
        icone: '🃏',
        arma: 'Adaga Inicial',
        armadura: 'Uniforme Escolar',
        isProtagonista: true,
    },
    {
        id: 2,
        nome: 'Yosuke',
        nivel: 5,
        personaEquipada: 'Jiraiya',
        subPersona: null,
        hp: 90, hpMax: 120,
        sp: 50, spMax: 80,
        icone: '🌪️',
        arma: 'Kunai',
        armadura: 'Camiseta Básica',
        isProtagonista: false,
    },
    {
        id: 3,
        nome: 'Chie',
        nivel: 4,
        personaEquipada: 'Tomoe',
        subPersona: null,
        hp: 130, hpMax: 130,
        sp: 30, spMax: 40,
        icone: '🥋',
        arma: 'Sapatos de Combate',
        armadura: 'Jaqueta Verde',
        isProtagonista: false,
    },
]

// ────────────────────────────────────────────
//  Context
// ────────────────────────────────────────────
const GameContext = createContext(null)

export function GameProvider({ children }) {
    // Equipe de combate
    const [equipe, setEquipe] = useState(EQUIPE_INICIAL)

    // Inventário de personas do PROTAGONISTA (podem ser fundidas)
    // Não inclui a persona equipada da equipe (ela fica "em uso")
    const [inventarioPersonas, setInventarioPersonas] = useState(PERSONAS_PROTO)

    // Compêndio: personas registradas { [nome]: personaObj }
    const [compendio, setCompendio] = useState({})

    // Moedas
    const [yen, setYen] = useState(0)

    // ── Personas equipadas pela equipe toda (bloqueadas para fusão) ──
    const personasEquipadas = equipe.map(m => m.personaEquipada).filter(Boolean)

    // ── Inventário disponível para fusão:
    //    apenas personas do protagonista que NÃO estejam equipadas por algum membro
    const inventarioParaFusao = inventarioPersonas.filter(
        p => !personasEquipadas.includes(p.name)
    )

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

        // Adiciona ao inventário se ainda não estiver lá
        const jaTemNoInventario = inventarioPersonas.some(p => p.name === nomePersona)
        if (jaTemNoInventario) return { sucesso: false, erro: 'Persona já está no seu inventário.' }

        setYen(prev => prev - custo)
        setInventarioPersonas(prev => [...prev, persona])
        return { sucesso: true }
    }, [compendio, yen, inventarioPersonas])

    // ── Fundir personas (remove A e B, adiciona resultado) ──
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

    return (
        <GameContext.Provider value={{
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
