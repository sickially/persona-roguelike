import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import './Hub.css'

const DICAS = [
    'Personas acima do seu nível não podem ser fundidas na Velvet Room.',
    'Shadows raras dropam itens únicos e dobro de experiência.',
    'Uma vez que avança no caminho, não há retorno.',
    'Gerencie seus 8 slots de Persona com sabedoria.',
    'Meta Jewels são raras — use-as com cuidado em Marthym.',
]

function Hub() {
    const navigate = useNavigate()
    const location = useLocation()
    const { equipe, yen, jogoIniciado, inicializarJogo, segmentoAtual, dungeonState } = useGame()

    useEffect(() => {
        if (!jogoIniciado) {
            const { persona, companheiros, companheiro } = location.state || {}
            // Suporta tanto o novo formato (companheiros[]) quanto o legado (companheiro string)
            inicializarJogo(persona, companheiros ?? companheiro)
        }
    }, [jogoIniciado, inicializarJogo, location.state])

    // Se a equipe ainda estiver nula (carregando/inicializando), evita renderizar a página vazia
    if (!equipe) return null


    /* Recebe o caminho escolhido via state da navegação */
    const caminho = location.state?.caminho || 'rebellion'

    const dica = DICAS[Math.floor(Math.random() * DICAS.length)]

    const nomeCaminho = {
        mortality: 'Mortality',
        truth: 'Truth',
        rebellion: 'Rebellion',
    }

    return (
        <div id="tela-hub">

            {/* Header */}
            <header className="hub-header">
                <div className="hub-header-logo">
                    Persona <span>Roguelike</span>
                </div>

                <div className="hub-badge-fase">
                    <span className="hub-badge-fase-dot"></span>
                    SEGMENTO {segmentoAtual.toString().padStart(2, '0')} · {dungeonState.andar >= 0 ? 'EM ANDAMENTO' : 'CAMINHO LIVRE'}
                </div>
            </header>

            {/* Corpo */}
            <div className="hub-corpo">

                {/* Painel Esquerdo — Equipe */}
                <aside className="hub-painel-equipe">
                    <p className="hub-painel-titulo">Equipe</p>

                {equipe.map((membro) => {
                        const hpPct = membro.hpMax ? (membro.hp / membro.hpMax) * 100 : 100
                        const spPct = membro.spMax ? (membro.sp / membro.spMax) * 100 : 100
                        const isKO  = membro.hp <= 0
                        return (
                        <div className={`hub-membro-card ${isKO ? 'hub-membro-card--ko' : ''}`} key={membro.id}>
                            <div className="hub-membro-avatar">{membro.icone}</div>

                            <div className="hub-membro-info">
                                <p className="hub-membro-nome">{membro.nome}{isKO && <span className="hub-ko-badge"> K.O.</span>}</p>
                                <p className="hub-membro-persona">{membro.personaEquipada}</p>
                            </div>

                            <div className="hub-membro-hp">
                                <span className="hub-membro-hp-valor">HP</span>
                                <div className="hub-barra">
                                    <div
                                        className="hub-barra-fill hub-barra-fill--hp"
                                        style={{ width: `${hpPct}%`, background: hpPct > 50 ? undefined : hpPct > 20 ? '#F39C12' : '#E74C3C' }}
                                    />
                                </div>
                                <span className="hub-membro-hp-valor">SP</span>
                                <div className="hub-barra">
                                    <div
                                        className="hub-barra-fill hub-barra-fill--sp"
                                        style={{ width: `${spPct}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                        )
                    })}
                </aside>

                {/* Centro — Ações */}
                <main className="hub-centro">

                    {/* Badge do caminho */}
                    <div className="hub-caminho-badge">
                        <span className="hub-caminho-badge-label">Caminho Atual</span>
                        <h1 className={`hub-caminho-badge-nome hub-caminho-badge-nome--${caminho}`}>
                            {nomeCaminho[caminho] || 'Rebellion'}
                        </h1>
                    </div>

                    {/* Botões de ação */}
                    <nav className="hub-acoes">

                        <button
                            className="hub-btn hub-btn--destaque"
                            id="btn-iniciar-exploracao"
                            onClick={() => navigate('/dungeon', { state: { caminho } })}
                        >
                            <span className="hub-btn-icone">⚔️</span>
                            <span className="hub-btn-texto">
                                {dungeonState.andar >= 0 ? 'Retomar Exploração' : 'Iniciar Exploração'}
                                <span className="hub-btn-desc">Avançar pelos caminhos da dungeon</span>
                            </span>
                            <span className="hub-btn-seta">›</span>
                        </button>

                        <div className="hub-btn-separador"></div>

                        <button
                            className="hub-btn"
                            id="btn-gerenciar-equipe"
                            onClick={() => navigate('/equipe')}
                        >
                            <span className="hub-btn-icone">👥</span>
                            <span className="hub-btn-texto">
                                Gerenciar Equipe
                                <span className="hub-btn-desc">Equipamentos, sub-persona e status</span>
                            </span>
                            <span className="hub-btn-seta">›</span>
                        </button>

                        <button
                            className="hub-btn"
                            id="btn-gerenciar-inventario"
                            onClick={() => navigate('/inventario')}
                        >
                            <span className="hub-btn-icone">🎒</span>
                            <span className="hub-btn-texto">
                                Gerenciar Inventário
                                <span className="hub-btn-desc">Itens obtidos na exploração</span>
                            </span>
                            <span className="hub-btn-seta">›</span>
                        </button>

                        <button
                            className="hub-btn"
                            id="btn-velvet-room"
                            onClick={() => navigate('/velvet-room')}
                        >
                            <span className="hub-btn-icone">🔮</span>
                            <span className="hub-btn-texto">
                                Velvet Room
                                <span className="hub-btn-desc">Fundir, registrar ou comprar Personas</span>
                            </span>
                            <span className="hub-btn-seta">›</span>
                        </button>

                        <div className="hub-btn-separador"></div>

                        <button
                            className="hub-btn"
                            id="btn-salvar"
                        >
                            <span className="hub-btn-icone">💾</span>
                            <span className="hub-btn-texto">
                                Salvar Progresso
                                <span className="hub-btn-desc">Salvo localmente no dispositivo</span>
                            </span>
                            <span className="hub-btn-seta">›</span>
                        </button>

                    </nav>
                </main>

                {/* Painel Direito — Informações */}
                <aside className="hub-painel-info">

                    <div>
                        <p className="hub-painel-titulo">Moedas</p>
                        <div className="hub-moedas">
                            <div className="hub-moeda-item">
                                <span className="hub-moeda-label">
                                    <span className="hub-moeda-icone">💴</span> Yen
                                </span>
                                <span className="hub-moeda-valor">¥ {yen.toLocaleString('pt-BR')}</span>
                            </div>
                            <div className="hub-moeda-item">
                                <span className="hub-moeda-label">
                                    <span className="hub-moeda-icone">🔵</span> C. Stamps
                                </span>
                                <span className="hub-moeda-valor">0</span>
                            </div>
                            <div className="hub-moeda-item">
                                <span className="hub-moeda-label">
                                    <span className="hub-moeda-icone">💎</span> Meta Jewels
                                </span>
                                <span className="hub-moeda-valor">0</span>
                            </div>
                        </div>
                    </div>

                    <div className="hub-segmentos">
                        <p className="hub-painel-titulo">Progresso</p>
                        <p className="hub-segmento-label">Segmento</p>
                        <p className="hub-segmento-contador">
                            <span>{segmentoAtual.toString().padStart(2, '0')}</span>/10
                        </p>
                        <div className="hub-segmento-pontos">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`hub-segmento-ponto${i < segmentoAtual ? ' hub-segmento-ponto--completo' : ''}`}
                                ></div>
                            ))}
                        </div>
                    </div>

                    <div className="hub-dica">
                        <p className="hub-dica-titulo">// DICA</p>
                        <p className="hub-dica-texto">{dica}</p>
                    </div>

                </aside>

            </div>

            {/* Footer */}
            <footer className="hub-footer">
                <span className="hub-footer-texto">Personas disponíveis: 1 / 8 slots</span>
                <span className="hub-footer-texto">Nível do Protagonista: 1</span>
            </footer>

        </div>
    )
}

export default Hub
