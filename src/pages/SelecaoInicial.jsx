import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './SelecaoInicial.css'

import megatenService from '../services/megatenService'

// Obter Personas de nível baixo (<= 6) para a seleção inicial, embaralhar e pegar 3
const personasIniciaisRaw = megatenService.getPersonasByLevel(6).sort(() => 0.5 - Math.random()).slice(0, 3)

const PERSONAS_INICIAIS = personasIniciaisRaw.map(p => ({
    id: p.name, 
    nome: p.name, 
    arcana: p.arcana, 
    nivel: p.level, 
    // Criando um HP e SP baseados nos status reais da API (Endurance e Magic)
    hp: (p.stats?.en || 3) * 15 + 20, 
    sp: (p.stats?.ma || 3) * 10 + 15, 
    icone: '🃏' 
}))

// Mapeamento de ícones por jogo
const ICONES_JOGO = { p3: '🌙', p4: '📺', p5: '🃏' }

// Sorteia 3 companheiros reais aleatórios da database
const COMPANHEIROS_INICIAIS = megatenService.getRandomCompanions(3)

function SelecaoInicial() {
    const navigate = useNavigate()
    const location = useLocation()
    const caminho = location.state?.caminho || 'rebellion'

    const [personaSelecionada, setPersonaSelecionada] = useState(null)
    const [companheiroSelecionado, setCompanheiroSelecionado] = useState(null)

    function handleConfirmar() {
        if (personaSelecionada && companheiroSelecionado) {
            navigate('/hub', { state: { caminho, persona: personaSelecionada, companheiro: companheiroSelecionado } })
        }
    }

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
                <h2 className="selecao-secao-titulo">Escolha seu Primeiro Companheiro</h2>
                <div className="selecao-grid">
                    {COMPANHEIROS_INICIAIS.map(c => (
                        <div 
                            key={c.nome} 
                            className={`selecao-card ${companheiroSelecionado === c.nome ? 'selecao-card--ativo' : ''}`}
                            onClick={() => setCompanheiroSelecionado(c.nome)}
                        >
                            <div className="selecao-card-check">✓</div>
                            <div className="selecao-card-icone">{ICONES_JOGO[c.game] || '⭐'}</div>
                            <h3 className="selecao-card-nome">{c.nome}</h3>
                            <div className="selecao-card-detalhes">
                                <span>Persona: {c.personaInicial}</span>
                                <span>Arcana: {c.arcana}</span>
                                <span>{megatenService.getGameLabel(c.game)} · Nv. {c.nivel}</span>
                                <span style={{fontSize:'0.75rem', opacity: 0.7}}>Skills: {c.learnsetInicial?.slice(0,2).join(', ')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <button 
                className="selecao-btn-confirmar" 
                onClick={handleConfirmar}
                disabled={!personaSelecionada || !companheiroSelecionado}
            >
                Confirmar e Avançar
            </button>
        </div>
    )
}

export default SelecaoInicial
