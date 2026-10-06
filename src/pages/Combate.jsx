import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Combate.css'

// Mocks para a Etapa 1
const ALIADOS_MOCK = [
    { id: 1, nome: 'Protagonista', hp: 100, hpMax: 100, sp: 80, spMax: 100, icone: '🃏' },
    { id: 2, nome: 'Yosuke',       hp: 90, hpMax: 120, sp: 50, spMax: 80, icone: '🌪️' },
]

const INIMIGOS_MOCK = [
    { id: 'e1', nome: 'Slime A', hp: 100, icone: '💧' },
    { id: 'e2', nome: 'Slime B', hp: 100, icone: '💧' },
]

function Combate() {
    const navigate = useNavigate()

    const [aliados] = useState(ALIADOS_MOCK)
    const [inimigos, setInimigos] = useState(INIMIGOS_MOCK)
    
    // 0 = Protagonista, 1 = Yosuke, etc.
    const [turnoAliadoIndex, setTurnoAliadoIndex] = useState(0)
    
    const [log, setLog] = useState('')
    const [animandoId, setAnimandoId] = useState(null)
    const [vitoria, setVitoria] = useState(false)

    function dispararLog(mensagem) {
        setLog('')
        setTimeout(() => setLog(mensagem), 50)
    }

    function handleAtaque() {
        const inimigoAlvo = inimigos[0]
        if (!inimigoAlvo) return

        dispararLog(`${aliados[turnoAliadoIndex].nome} atacou ${inimigoAlvo.nome}!`)
        setAnimandoId(inimigoAlvo.id)

        // Mock de dano visual apenas removendo o inimigo após o hit
        setTimeout(() => {
            setAnimandoId(null)
            const novosInimigos = inimigos.slice(1) // Remove o primeiro inimigo
            setInimigos(novosInimigos)

            if (novosInimigos.length === 0) {
                setTimeout(() => setVitoria(true), 1000)
            } else {
                // Passa o turno
                setTurnoAliadoIndex((prev) => (prev + 1) % aliados.length)
            }
        }, 500)
    }

    function handleSkill() {
        dispararLog(`${aliados[turnoAliadoIndex].nome} usou uma Skill! (Em desenvolvimento)`)
    }

    function handleFugir() {
        dispararLog(`Tentando fugir... Falhou!`)
    }

    function finalizarCombate() {
        navigate(-1) // Volta para a dungeon ou hub
    }

    return (
        <div id="tela-combate">

            {/* LOG DE NOTIFICAÇÃO (Animado) */}
            {log && (
                <div key={log} className="combate-log mostrar">
                    {log}
                </div>
            )}

            <header className="combate-header">
                <div className="combate-turno-indicador">
                    TURNO: <span>{vitoria ? 'FINALIZADO' : aliados[turnoAliadoIndex]?.nome.toUpperCase()}</span>
                </div>
            </header>

            <main className="combate-campo">
                
                {/* LADO ESQUERDO - ALIADOS */}
                <div className="combate-aliados">
                    {aliados.map((aliado, index) => (
                        <div 
                            key={aliado.id} 
                            className={`combate-aliado-card ${index === turnoAliadoIndex && !vitoria ? 'combate-aliado-card--ativo' : ''}`}
                        >
                            <div className="combate-aliado-nome">
                                <span>{aliado.nome}</span>
                                <span className="combate-aliado-icone">{aliado.icone}</span>
                            </div>
                            
                            <div className="combate-barras">
                                <div className="combate-barra-container">
                                    <span className="combate-barra-label">HP</span>
                                    <div className="combate-barra-bg">
                                        <div className="combate-barra-fill combate-barra-fill--hp" style={{width: `${(aliado.hp/aliado.hpMax)*100}%`}}></div>
                                    </div>
                                </div>
                                <div className="combate-barra-container">
                                    <span className="combate-barra-label">SP</span>
                                    <div className="combate-barra-bg">
                                        <div className="combate-barra-fill combate-barra-fill--sp" style={{width: `${(aliado.sp/aliado.spMax)*100}%`}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* LADO DIREITO - INIMIGOS */}
                <div className="combate-inimigos">
                    {inimigos.map((inimigo) => (
                        <div key={inimigo.id} className="combate-inimigo-card">
                            <div className="combate-inimigo-nome">{inimigo.nome} {inimigo.icone}</div>
                            <div className="combate-inimigo-hp">
                                <div className="combate-inimigo-hp-fill"></div>
                            </div>
                            {/* Overlay para flash de ataque */}
                            <div className={`combate-efeito-ataque ${animandoId === inimigo.id ? 'animar' : ''}`}></div>
                        </div>
                    ))}
                </div>

            </main>

            {/* MENU DE AÇÕES */}
            <footer className="combate-acoes">
                <button className="combate-btn-acao" onClick={handleAtaque} disabled={vitoria}>ATAQUE</button>
                <button className="combate-btn-acao" onClick={handleSkill} disabled={vitoria}>SKILL</button>
                <button className="combate-btn-acao" disabled={vitoria}>ITEM</button>
                <button className="combate-btn-acao" disabled={vitoria}>PERSONA</button>
                <button className="combate-btn-acao" onClick={handleFugir} disabled={vitoria}>FUGIR</button>
            </footer>

            {/* TELA DE RESULTADO / VITÓRIA */}
            {vitoria && (
                <div className="combate-vitoria-overlay">
                    <h1 className="combate-vitoria-titulo">ALL OUT ATTACK!</h1>
                    <p className="combate-vitoria-dados">+ 45 EXP | + 120 Yen</p>
                    <button className="combate-vitoria-btn" onClick={finalizarCombate}>
                        RETORNAR AO MAPA
                    </button>
                </div>
            )}

        </div>
    )
}

export default Combate
