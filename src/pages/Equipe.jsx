import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import megatenService from '../services/megatenService'
import './Equipe.css'

// Garante que nunca exibimos NaN — converte qualquer valor inválido em 0
const toNum = (v) => (typeof v === 'number' && isFinite(v) ? v : 0)

function Equipe() {
    const navigate = useNavigate()
    const { equipe, inventarioPersonas, personasEquipadas } = useGame()

    const [membroAtivo, setMembroAtivo] = useState(equipe[0] ?? null)

    // Sincroniza membro ativo se o contexto mudou (ex: voltou do combate)
    const membroAtualizado = equipe.find(m => m.id === membroAtivo?.id) ?? equipe[0]

    if (!membroAtualizado) {
        return (
            <div id="tela-equipe">
                <p style={{ padding: '2rem', color: '#E3EAFF' }}>Sem membros na equipe.</p>
            </div>
        )
    }

    const personaData = megatenService.getPersonaByName(membroAtualizado.personaEquipada)

    return (
        <div id="tela-equipe">
            <header className="equipe-header">
                <h1 className="equipe-titulo">Gerenciar Equipe</h1>
                <button className="equipe-btn-voltar" onClick={() => navigate(-1)}>
                    VOLTAR
                </button>
            </header>

            <main className="equipe-conteudo">

                {/* Lista lateral de membros */}
                <aside className="equipe-lista">
                    {equipe.map(membro => {
                        const hp    = toNum(membro.hp)
                        const hpMax = toNum(membro.hpMax) || 1
                        const hpPct = (hp / hpMax) * 100
                        const isKO  = membro.hp <= 0
                        return (
                            <div
                                key={membro.id}
                                className={[
                                    'equipe-membro-card',
                                    membro.id === membroAtualizado.id ? 'equipe-membro-card--ativo' : '',
                                    isKO ? 'equipe-membro-card--ko' : '',
                                ].join(' ')}
                                onClick={() => setMembroAtivo(membro)}
                            >
                                <div className="equipe-membro-icone">{membro.icone}</div>
                                <div className="equipe-membro-resumo">
                                    <span className="equipe-membro-nome">
                                        {membro.nome} {isKO && <span className="equipe-ko-tag">K.O.</span>}
                                    </span>
                                    <span className="equipe-membro-persona">
                                        {membro.personaEquipada} (Nv.&nbsp;{membro.nivel})
                                    </span>
                                    {/* Mini barra de HP */}
                                    <div className="equipe-mini-hp-bg">
                                        <div
                                            className="equipe-mini-hp-fill"
                                            style={{
                                                width: `${hpPct}%`,
                                                background: hpPct > 50 ? '#2ECC71' : hpPct > 20 ? '#F39C12' : '#E74C3C',
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </aside>

                {/* Detalhes do membro selecionado */}
                <section className="equipe-detalhes">

                    <div className="equipe-detalhes-header">
                        <div className="equipe-detalhes-nome">
                            <h2>{membroAtualizado.nome}</h2>
                            <p style={{ color: 'rgba(227,234,255,0.5)', fontFamily: 'Rajdhani' }}>
                                Persona: {membroAtualizado.personaEquipada}
                                {membroAtualizado.isProtagonista && (
                                    <span className="equipe-tag-proto"> ★ Protagonista</span>
                                )}
                            </p>
                        </div>
                        <div className="equipe-detalhes-nivel">
                            NÍVEL {membroAtualizado.nivel}
                        </div>
                    </div>

                    <div className="equipe-detalhes-status">
                        {/* HP / SP */}
                        <div className="equipe-status-box">
                            <h3>VITALS (HP/SP)</h3>
                            <div className="equipe-status-barras">
                                <div className="equipe-status-barra">
                                    <span>HP</span>
                                    <div className="equipe-status-bg">
                                        <div
                                            className="equipe-status-fill equipe-status-fill--hp"
                                            style={{ width: `${(toNum(membroAtualizado.hp) / (toNum(membroAtualizado.hpMax) || 1)) * 100}%` }}
                                        />
                                    </div>
                                    <span style={{ fontFamily: 'Rajdhani', minWidth: '60px', textAlign: 'right' }}>
                                        {toNum(membroAtualizado.hp)}/{toNum(membroAtualizado.hpMax)}
                                    </span>
                                </div>
                                <div className="equipe-status-barra">
                                    <span>SP</span>
                                    <div className="equipe-status-bg">
                                        <div
                                            className="equipe-status-fill equipe-status-fill--sp"
                                            style={{ width: `${(toNum(membroAtualizado.sp) / (toNum(membroAtualizado.spMax) || 1)) * 100}%` }}
                                        />
                                    </div>
                                    <span style={{ fontFamily: 'Rajdhani', minWidth: '60px', textAlign: 'right' }}>
                                        {toNum(membroAtualizado.sp)}/{toNum(membroAtualizado.spMax)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Equipamentos */}
                        <div className="equipe-status-box">
                            <h3>EQUIPAMENTOS</h3>
                            <div className="equipe-equipamentos">
                                <div className="equipe-equip-item">
                                    <span className="equipe-equip-label">Arma</span>
                                    <span>{membroAtualizado.arma ?? '—'}</span>
                                </div>
                                <div className="equipe-equip-item">
                                    <span className="equipe-equip-label">Armadura</span>
                                    <span>{membroAtualizado.armadura ?? '—'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats da Persona */}
                    <div className="equipe-subpersona">
                        <div className="equipe-subpersona-info">
                            <h4>STATUS DA PERSONA ({membroAtualizado.personaEquipada})</h4>
                            {personaData ? (
                                <div className="equipe-persona-stats">
                                    {Object.entries(personaData.stats).map(([stat, val]) => (
                                        <div key={stat} className="equipe-persona-stat-item">
                                            <span className="equipe-persona-stat-label">
                                                {stat.toUpperCase()}
                                            </span>
                                            <span className="equipe-persona-stat-val">{val}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ marginTop: '0.5rem', color: 'rgba(227,234,255,0.5)' }}>
                                    Status indisponíveis para esta Persona.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Personas no inventário (apenas para o Protagonista) */}
                    {membroAtualizado.isProtagonista && inventarioPersonas.length > 0 && (
                        <div className="equipe-inventario-personas">
                            <h3>PERSONAS NO INVENTÁRIO</h3>
                            <div className="equipe-personas-grid">
                                {inventarioPersonas.map(p => (
                                    <div
                                        key={p.name}
                                        className={`equipe-persona-chip ${personasEquipadas.includes(p.name) ? 'equipe-persona-chip--equipada' : ''}`}
                                    >
                                        <span>{p.name}</span>
                                        <span className="equipe-persona-chip-lv">Lv.{p.level}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </section>
            </main>
        </div>
    )
}

export default Equipe
