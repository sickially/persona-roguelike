import { useLocation, useNavigate } from 'react-router-dom'
import './Hub.css'

/* Dados mockados para a Etapa 1 (apenas visual, sem lógica) */
const EQUIPE_MOCK = [
    { id: 1, nome: 'Protagonista', persona: 'Arsène', hp: 100, hpMax: 100, sp: 80, spMax: 100, avatar: '🃏' },
    { id: 2, nome: 'Ryuji',        persona: 'Captain Kidd', hp: 90, hpMax: 120, sp: 50, spMax: 80, avatar: '⚡' },
    { id: 3, nome: 'Ann',          persona: 'Carmen',  hp: 75, hpMax: 90,  sp: 95, spMax: 110, avatar: '🔥' },
    { id: 4, nome: 'Yusuke',       persona: 'Goemon',  hp: 60, hpMax: 100, sp: 70, spMax: 90,  avatar: '❄️' },
]

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
                    SEGMENTO 01 · CAMINHO LIVRE
                </div>
            </header>

            {/* Corpo */}
            <div className="hub-corpo">

                {/* Painel Esquerdo — Equipe */}
                <aside className="hub-painel-equipe">
                    <p className="hub-painel-titulo">Equipe</p>

                    {EQUIPE_MOCK.map((membro) => (
                        <div className="hub-membro-card" key={membro.id}>
                            <div className="hub-membro-avatar">{membro.avatar}</div>

                            <div className="hub-membro-info">
                                <p className="hub-membro-nome">{membro.nome}</p>
                                <p className="hub-membro-persona">{membro.persona}</p>
                            </div>

                            <div className="hub-membro-hp">
                                <span className="hub-membro-hp-valor">HP</span>
                                <div className="hub-barra">
                                    <div
                                        className="hub-barra-fill hub-barra-fill--hp"
                                        style={{ width: `${(membro.hp / membro.hpMax) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="hub-membro-hp-valor">SP</span>
                                <div className="hub-barra">
                                    <div
                                        className="hub-barra-fill hub-barra-fill--sp"
                                        style={{ width: `${(membro.sp / membro.spMax) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
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
                                Iniciar Exploração
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
                                <span className="hub-moeda-valor">¥ 0</span>
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
                            <span>01</span>/10
                        </p>
                        <div className="hub-segmento-pontos">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`hub-segmento-ponto${i === 0 ? ' hub-segmento-ponto--completo' : ''}`}
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
