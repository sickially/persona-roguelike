import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Dungeon.css'

// Mapeamento dos tipos de eventos na Dungeon
const TIPO_EVENTOS = {
    BATALHA: { icone: '⚔️', nome: 'Shadows' },
    BAU: { icone: '🧰', nome: 'Baú de Item' },
    CIVIL: { icone: '👤', nome: 'Civil Perdido' },
    RARA: { icone: '✨', nome: 'Shadow Rara' },
    LOJA: { icone: '🛒', nome: 'Lojista' },
    BOSS: { icone: '👹', nome: 'Boss' },
}

// Mapa mockado (linhas de baixo para cima)
// 3 Colunas: Esquerda, Centro, Direita. 5 Andares (0 a 4)
const MAPA_MOCK = [
    // Andar 0 (Início)
    [ { tipo: 'BATALHA' }, { tipo: 'BATALHA' }, { tipo: 'BATALHA' } ],
    // Andar 1
    [ { tipo: 'BAU' }, { tipo: 'BATALHA' }, { tipo: 'CIVIL' } ],
    // Andar 2
    [ { tipo: 'BATALHA' }, { tipo: 'LOJA' }, { tipo: 'RARA' } ],
    // Andar 3
    [ { tipo: 'BATALHA' }, { tipo: 'BATALHA' }, { tipo: 'BAU' } ],
    // Andar 4 (Boss - apenas 1 nó central para todos os caminhos convergirem)
    [ null, { tipo: 'BOSS' }, null ],
]

function Dungeon() {
    const navigate = useNavigate()
    const location = useLocation()
    const caminho = location.state?.caminho || 'rebellion'

    // Estado do progresso do jogador
    // O jogador começa no andar -1 (nenhum). Quando clica, vai para o andar 0
    const [andarAtual, setAndarAtual] = useState(-1)
    const [colunaAtual, setColunaAtual] = useState(null)
    const [eventoAtivo, setEventoAtivo] = useState(null)

    // Lógica ao clicar num nó do mapa
    function handleClickNo(andar, coluna, noData) {
        if (!noData) return;

        // Regra: O jogador só pode avançar para o próximo andar (+1)
        if (andar !== andarAtual + 1) return;

        // Se quiser bloquear mudança de coluna, adicionar regra aqui. 
        // No momento, permite escolher qualquer nó da próxima linha.

        setAndarAtual(andar)
        setColunaAtual(coluna)
        setEventoAtivo({ ...noData, andar, coluna })
    }

    // Fechar o evento e verificar se foi o boss
    function fecharEvento() {
        const evento = eventoAtivo
        setEventoAtivo(null)

        if (evento.tipo === 'BOSS') {
            // Se venceu o Boss, volta pro Hub 
            navigate('/hub', { state: { caminho } })
        }
    }

    return (
        <div id="tela-dungeon">
            <header className="dungeon-header">
                <div>
                    <h1 className="dungeon-info-segmento">SEGMENTO 01</h1>
                    <p className="dungeon-info-caminho">Caminho Atual: {caminho}</p>
                </div>

                <div className="dungeon-aviso">
                    ⚠️ AVISO: AVANÇO SEM RETORNO
                </div>
            </header>

            <main className="dungeon-mapa-container">
                <div className="dungeon-caminhos-grid">
                    
                    {/* Renderizando Colunas (Esquerda: 0, Centro: 1, Direita: 2) */}
                    {[0, 1, 2].map((colIndex) => (
                        <div key={`col-${colIndex}`} className="dungeon-coluna-caminho">
                            
                            {MAPA_MOCK.map((linha, andarIndex) => {
                                const noData = linha[colIndex]
                                
                                // Verifica estados visuais do nó
                                const isConcluido = andarAtual >= andarIndex && (colunaAtual === colIndex || andarAtual > andarIndex); // simplificado
                                const isDisponivel = (andarIndex === andarAtual + 1) && noData !== null;
                                const isBloqueado = (andarIndex > andarAtual + 1) || noData === null;
                                const isJogadorAqui = (andarAtual === andarIndex && colunaAtual === colIndex);

                                // Se for o Boss (andar 4), forçamos a centralização se a coluna for 1, e não renderizamos 0 e 2
                                if (andarIndex === 4 && colIndex !== 1) return <div key={`empty-${andarIndex}`} style={{width: 60, height: 60}}></div>;

                                if (!noData) return null;

                                const { icone, nome } = TIPO_EVENTOS[noData.tipo]

                                let classeNo = "dungeon-no"
                                if (isJogadorAqui || isConcluido) classeNo += " dungeon-no--concluido"
                                else if (isDisponivel) classeNo += " dungeon-no--disponivel"
                                else if (isBloqueado) classeNo += " dungeon-no--bloqueado"

                                return (
                                    <div 
                                        key={`no-${andarIndex}-${colIndex}`}
                                        className={classeNo}
                                        onClick={() => handleClickNo(andarIndex, colIndex, noData)}
                                    >
                                        {icone}
                                        <div className="dungeon-no-tooltip">{nome}</div>
                                        
                                        {isJogadorAqui && (
                                            <div className="dungeon-jogador-marker">P1</div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </main>

            {/* Modal de Evento */}
            {eventoAtivo && (
                <div className="dungeon-modal-overlay">
                    <div className="dungeon-modal">
                        <h2>{TIPO_EVENTOS[eventoAtivo.tipo].icone} {TIPO_EVENTOS[eventoAtivo.tipo].nome}</h2>
                        
                        {eventoAtivo.tipo === 'BATALHA' && <p>Uma sombra bloqueia o seu caminho. Prepare-se para a batalha!</p>}
                        {eventoAtivo.tipo === 'BAU' && <p>Você encontrou um baú escondido. (Item recebido: Medicina x1)</p>}
                        {eventoAtivo.tipo === 'CIVIL' && <p>Um civil assustado implora por ajuda. (Recompensa recebida)</p>}
                        {eventoAtivo.tipo === 'LOJA' && <p>Alguém inesperado está oferecendo mercadorias interessantes.</p>}
                        {eventoAtivo.tipo === 'RARA' && <p>Uma sombra brilhante tenta fugir! É a sua chance!</p>}
                        {eventoAtivo.tipo === 'BOSS' && <p>O guardião deste segmento o aguarda. Não há escapatória.</p>}
                        
                        <button className="dungeon-modal-btn" onClick={() => {
                            if (eventoAtivo.tipo === 'BATALHA' || eventoAtivo.tipo === 'RARA') {
                                navigate('/combate', { state: { caminho, tipoInimigo: eventoAtivo.tipo } })
                            } else if (eventoAtivo.tipo === 'BOSS') {
                                navigate('/combate', { state: { caminho, tipoInimigo: 'BOSS' } })
                            } else {
                                fecharEvento()
                            }
                        }}>
                            {eventoAtivo.tipo === 'BOSS' ? 'Concluir Segmento' : 
                             eventoAtivo.tipo === 'BATALHA' ? 'Lutar' : 'Continuar'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dungeon
