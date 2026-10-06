import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './SelecaoInicial.css'

import megatenService from '../services/megatenService'

// Personas de nível baixo (até 6), embaralhadas
const personasIniciaisRaw = megatenService.getPersonasByLevel(6).sort(() => 0.5 - Math.random()).slice(0, 3)
const PERSONAS_INICIAIS = personasIniciaisRaw.map(p => ({
    id: p.name,
    nome: p.name,
    arcana: p.arcana,
    nivel: p.level,
    hp: Math.max(60, (p.stats?.en ?? p.stats?.vi ?? 3) * 15 + 20),
    sp: Math.max(40, (p.stats?.ma ?? 3) * 10 + 15),
    icone: '🃏',
}))

const ICONES_JOGO = { p3: '🌙', p4: '📺', p5: '🃏' }

// Sorteia 6 companheiros para o jogador escolher até 3
const COMPANHEIROS_POOL = megatenService.getRandomCompanions(6, 8)

const MAX_COMPANHEIROS = 3

function SelecaoInicial() {
    const navigate = useNavigate()
    const location = useLocation()
    const caminho = location.state?.caminho || 'rebellion'

    const [personaSelecionada, setPersonaSelecionada] = useState(null)
    // Agora é um array de nomes (até 3)
    const [companheirosSelecionados, setCompanheirosSelecionados] = useState([])

    function toggleCompanheiro(nome) {
        setCompanheirosSelecionados(prev => {
            if (prev.includes(nome)) {
                // Remove se já estava selecionado
                return prev.filter(n => n !== nome)
            }
            // Adiciona se ainda tem espaço
            if (prev.length < MAX_COMPANHEIROS) {
                return [...prev, nome]
            }
            return prev
        })
    }

    function handleConfirmar() {
        if (personaSelecionada && companheirosSelecionados.length > 0) {
            navigate('/hub', {
                state: {
                    caminho,
                    persona: personaSelecionada,
                    companheiros: companheirosSelecionados,
                }
            })
        }
    }

    const podeSelecionarMais = companheirosSelecionados.length < MAX_COMPANHEIROS
    const pronto = personaSelecionada && companheirosSelecionados.length > 0

    return (
        <div id="tela-selecao">
            <header className="selecao-header">
                <h1 className="selecao-titulo">O Início da Jornada</h1>
                <p className="selecao-subtitulo">Forje seus primeiros contratos</p>
            </header>

            <section className="selecao-secao">
                <h2 className="selecao-secao-titulo">Escolha sua Persona Inicial</h2>
                <div className="selecao-grid">
                    {PERSONAS_INICIAIS.map(p => (
                        <div
                            key={p.id}
                            className={`selecao-card ${personaSelecionada === p.id ? 'selecao-card--ativo' : ''}`}
                            onClick={() => setPersonaSelecionada(p.id)}
                        >
                            <div className="selecao-card-check">✓</div>
                            <div className="selecao-card-icone">{p.icone}</div>
                            <h3 className="selecao-card-nome">{p.nome}</h3>
                            <div className="selecao-card-detalhes">
                                <span>Arcana: {p.arcana}</span>
                                <span>Nível: {p.nivel}</span>
                                <span>HP: {p.hp} | SP: {p.sp}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="selecao-secao">
                <h2 className="selecao-secao-titulo">
                    Escolha seus Companheiros
                    <span className="selecao-contador">
                        {companheirosSelecionados.length}/{MAX_COMPANHEIROS}
                    </span>
                </h2>
                <p className="selecao-dica-multi">
                    Selecione até 3 companheiros para sua party. Pelo menos 1 é obrigatório.
                </p>
                <div className="selecao-grid selecao-grid--6">
                    {COMPANHEIROS_POOL.map(c => {
                        const selecionado = companheirosSelecionados.includes(c.nome)
                        const bloqueado  = !selecionado && !podeSelecionarMais
                        return (
                            <div
                                key={c.nome}
                                className={[
                                    'selecao-card',
                                    selecionado  ? 'selecao-card--ativo'     : '',
                                    bloqueado    ? 'selecao-card--bloqueado'  : '',
                                ].join(' ')}
                                onClick={() => !bloqueado && toggleCompanheiro(c.nome)}
                            >
                                <div className="selecao-card-check">
                                    {selecionado
                                        ? `#${companheirosSelecionados.indexOf(c.nome) + 1}`
                                        : '+'
                                    }
                                </div>
                                <div className="selecao-card-icone">{ICONES_JOGO[c.game] || '⭐'}</div>
                                <h3 className="selecao-card-nome">{c.nome}</h3>
                                <div className="selecao-card-detalhes">
                                    <span>Persona: {c.personaInicial}</span>
                                    <span>Arcana: {c.arcana}</span>
                                    <span>{megatenService.getGameLabel(c.game)} · Nv. {c.nivel}</span>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                                        Skills: {c.learnsetInicial?.slice(0, 2).join(', ')}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            <button
                className="selecao-btn-confirmar"
                onClick={handleConfirmar}
                disabled={!pronto}
            >
                {pronto
                    ? `Confirmar Party (${companheirosSelecionados.length + 1} membros)`
                    : 'Escolha sua Persona e ao menos 1 companheiro'
                }
            </button>
        </div>
    )
}

export default SelecaoInicial
