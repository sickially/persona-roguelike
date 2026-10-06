import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import './VelvetRoom.css'

import fusionService from '../services/fusionService'
import { useGame } from '../context/GameContext'

// ──────────────────────────────────────────────
//  Constantes
// ──────────────────────────────────────────────

// Ícone por arcana
const ARCANA_ICON = {
    Fool: '🃏', Magician: '🪄', Priestess: '📖', Empress: '👑',
    Emperor: '⚔️', Hierophant: '📜', Lovers: '💘', Chariot: '🏇',
    Justice: '⚖️', Hermit: '🔦', Fortune: '🎰', Strength: '🦁',
    Hanged: '🙃', Death: '💀', Temperance: '⏳', Devil: '😈',
    Tower: '🗼', Star: '⭐', Moon: '🌙', Sun: '☀️', Judgement: '📯',
}

// Cor por elemento
const ELEMENT_COLOR = {
    Fire: '#ff6b35', Ice: '#64d8ff', Elec: '#ffe055', Wind: '#7dffb3',
    Psy: '#d87dff', Nuke: '#ff4d4d', Bless: '#fffacd', Dark: '#9966cc',
    Phys: '#ff9944', Gun: '#aaaaaa', Almighty: '#ffffff',
}

// Custo de invocar do compêndio
function custoCompendio(nivel) {
    return nivel * 100
}

// ──────────────────────────────────────────────
//  Sub-componente: Card de Persona selecionável (slots de fusão)
// ──────────────────────────────────────────────
function PersonaCard({ persona, slot, onClick }) {
    if (!persona) {
        return (
            <div className="vr-slot vr-slot--vazio vr-slot--clicavel" onClick={onClick} id={`velvet-slot-${slot}`}>
                <span className="vr-slot-icon">+</span>
                <span className="vr-slot-label">Selecionar Persona {slot}</span>
            </div>
        )
    }

    return (
        <div className="vr-slot vr-slot--preenchido vr-slot--selecionado" id={`velvet-slot-persona-${slot}`}>
            <div className="vr-slot-arcana">
                <span className="vr-slot-arcana-icon">{ARCANA_ICON[persona.arcana] ?? '❓'}</span>
                <span className="vr-slot-arcana-nome">{persona.arcana}</span>
            </div>
            <h3 className="vr-slot-nome">{persona.name}</h3>
            <div className="vr-slot-nivel">Nv. {persona.level}</div>
            <div className="vr-slot-stats">
                {Object.entries(persona.stats || {}).map(([stat, val]) => (
                    <span key={stat} className="vr-stat-chip">
                        <span className="vr-stat-label">{stat.toUpperCase()}</span>
                        <span className="vr-stat-val">{val}</span>
                    </span>
                ))}
            </div>
            {persona.resistances && (
                <div className="vr-resistencias">
                    {persona.resistances.weak?.map(el => (
                        <span key={el} className="vr-res-tag vr-res-weak" style={{ borderColor: ELEMENT_COLOR[el] }}>
                            {el} ↓
                        </span>
                    ))}
                    {persona.resistances.null?.map(el => (
                        <span key={el} className="vr-res-tag vr-res-null" style={{ borderColor: ELEMENT_COLOR[el] }}>
                            {el} ∅
                        </span>
                    ))}
                    {persona.resistances.repel?.map(el => (
                        <span key={el} className="vr-res-tag vr-res-repel" style={{ borderColor: ELEMENT_COLOR[el] }}>
                            {el} ↑
                        </span>
                    ))}
                </div>
            )}
            <button className="vr-slot-remover" onClick={onClick} title="Remover da seleção">✕</button>
        </div>
    )
}

// ──────────────────────────────────────────────
//  Sub-componente: Card de resultado de fusão
// ──────────────────────────────────────────────
function ResultCard({ persona }) {
    if (!persona) return null

    const iniciaisSkills = (persona.learnset || [])
        .filter(s => s.level === 0)
        .slice(0, 4)

    return (
        <div className="vr-resultado-card" id="velvet-resultado-card">
            <div className="vr-resultado-header">
                <span className="vr-resultado-arcana-icon">{ARCANA_ICON[persona.arcana] ?? '❓'}</span>
                <div>
                    <div className="vr-resultado-arcana-nome">{persona.arcana}</div>
                    <h2 className="vr-resultado-nome">{persona.name}</h2>
                </div>
                <div className="vr-resultado-nivel">Nv. {persona.level}</div>
            </div>

            <div className="vr-resultado-stats">
                {Object.entries(persona.stats || {}).map(([stat, val]) => (
                    <div key={stat} className="vr-resultado-stat">
                        <span className="vr-resultado-stat-label">{stat.toUpperCase()}</span>
                        <span className="vr-resultado-stat-val">{val}</span>
                    </div>
                ))}
            </div>

            {persona.resistances && (
                <div className="vr-resultado-res">
                    {['weak', 'resist', 'null', 'drain', 'repel'].map(tipo => {
                        const els = persona.resistances[tipo] || []
                        if (els.length === 0) return null
                        const labels = { weak: 'FRACO', resist: 'RESISTE', null: 'NULO', drain: 'ABSORVE', repel: 'REPELE' }
                        return (
                            <div key={tipo} className={`vr-res-grupo vr-res-grupo--${tipo}`}>
                                <span className="vr-res-grupo-label">{labels[tipo]}</span>
                                <div className="vr-res-grupo-lista">
                                    {els.map(el => (
                                        <span key={el} className="vr-res-el" style={{ color: ELEMENT_COLOR[el] ?? '#fff' }}>
                                            {el}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {iniciaisSkills.length > 0 && (
                <div className="vr-resultado-skills">
                    <div className="vr-resultado-skills-titulo">Skills Iniciais</div>
                    <div className="vr-resultado-skills-lista">
                        {iniciaisSkills.map(s => (
                            <span key={s.name} className="vr-skill-chip">{s.name}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// ──────────────────────────────────────────────
//  Modal de seleção de persona do inventário
// ──────────────────────────────────────────────
function ModalSelecao({ inventario, personasEquipadas, excludePersona, onSelect, onClose }) {
    const [filtro, setFiltro] = useState('')
    const [arcanaFiltro, setArcanaFiltro] = useState('Todas')

    const arcanas = ['Todas', ...new Set(inventario.map(p => p.arcana))]

    const filtradas = inventario.filter(p => {
        if (excludePersona && p.name === excludePersona.name) return false
        if (arcanaFiltro !== 'Todas' && p.arcana !== arcanaFiltro) return false
        if (filtro && !p.name.toLowerCase().includes(filtro.toLowerCase())) return false
        return true
    })

    return (
        <div className="vr-modal-overlay" onClick={onClose} id="velvet-modal-selecao">
            <div className="vr-modal" onClick={e => e.stopPropagation()}>
                <div className="vr-modal-header">
                    <h3 className="vr-modal-titulo">Selecionar Persona</h3>
                    <button className="vr-modal-fechar" onClick={onClose}>✕</button>
                </div>

                <div className="vr-modal-filtros">
                    <input
                        className="vr-modal-busca"
                        placeholder="Buscar por nome..."
                        value={filtro}
                        onChange={e => setFiltro(e.target.value)}
                        id="velvet-busca-persona"
                        autoFocus
                    />
                    <div className="vr-modal-arcanas">
                        {arcanas.map(arc => (
                            <button
                                key={arc}
                                className={`vr-arcana-btn ${arcanaFiltro === arc ? 'vr-arcana-btn--ativo' : ''}`}
                                onClick={() => setArcanaFiltro(arc)}
                            >
                                {arc !== 'Todas' && ARCANA_ICON[arc]} {arc}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="vr-modal-lista">
                    {filtradas.length === 0 ? (
                        <p className="vr-modal-vazio">Nenhuma Persona disponível para fusão.</p>
                    ) : (
                        filtradas.map(p => {
                            const equipada = personasEquipadas.includes(p.name)
                            return (
                                <button
                                    key={p.name}
                                    className={`vr-modal-item ${equipada ? 'vr-modal-item--bloqueado' : ''}`}
                                    onClick={() => !equipada && onSelect(p)}
                                    disabled={equipada}
                                    title={equipada ? `${p.name} está equipada por um membro da equipe` : ''}
                                    id={`velvet-modal-item-${p.name.replace(/\s/g, '-')}`}
                                >
                                    <span className="vr-modal-item-arcana">
                                        {ARCANA_ICON[p.arcana]} {p.arcana}
                                    </span>
                                    <span className="vr-modal-item-nome">{p.name}</span>
                                    <span className="vr-modal-item-nivel">Nv. {p.level}</span>
                                    {equipada && (
                                        <span className="vr-modal-item-equipada" title="Em uso pela equipe">🔒 Em uso</span>
                                    )}
                                </button>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}

// ──────────────────────────────────────────────
//  Aba: Fusão Normal
// ──────────────────────────────────────────────
function AbaFusao({ inventario, personasEquipadas, yen, ganharYen, executarFusao, registrarNoCompendio }) {
    const [slotA, setSlotA] = useState(null)
    const [slotB, setSlotB] = useState(null)
    const [modalAberto, setModalAberto] = useState(null) // 'A' | 'B' | null
    const [fusaoConfirmada, setFusaoConfirmada] = useState(false)
    const [historico, setHistorico] = useState([])

    const fusao = useMemo(() => {
        if (!slotA || !slotB) return null
        return fusionService.fuseTwo(slotA, slotB)
    }, [slotA, slotB])

    function abrirModal(slot) {
        setFusaoConfirmada(false)
        setModalAberto(slot)
    }

    function selecionarPersona(persona) {
        if (modalAberto === 'A') {
            setSlotA(persona)
            if (slotB?.name === persona.name) setSlotB(null)
        } else {
            setSlotB(persona)
            if (slotA?.name === persona.name) setSlotA(null)
        }
        setModalAberto(null)
        setFusaoConfirmada(false)
    }

    function confirmarFusao() {
        if (!fusao?.result) return
        executarFusao(slotA, slotB, fusao.result)
        setHistorico(prev => [fusao.result, ...prev].slice(0, 6))
        setFusaoConfirmada(true)
        setSlotA(null)
        setSlotB(null)
    }

    function cancelarSlot(slot) {
        if (slot === 'A') setSlotA(null)
        else setSlotB(null)
        setFusaoConfirmada(false)
    }

    const podeConfirmar = fusao && !fusao.error && !fusaoConfirmada

    // Inventário disponível para fusão: exclui personas equipadas
    const inventarioDisponivel = inventario.filter(p => !personasEquipadas.includes(p.name))

    return (
        <div className="vr-corpo">

            {/* ── Painel Esquerdo: Seleção ── */}
            <section className="vr-painel-selecao">
                <h2 className="vr-secao-titulo">Selecionar Personas</h2>
                <p className="vr-secao-desc">
                    Combine duas Personas do inventário do protagonista.
                    Personas equipadas pela equipe não podem ser fundidas.
                </p>

                {inventarioDisponivel.length < 2 && (
                    <div className="vr-aviso">
                        ⚠️ Você precisa de pelo menos 2 Personas livres no inventário para fundir.
                    </div>
                )}

                <div className="vr-slots">
                    <PersonaCard
                        persona={slotA}
                        slot="A"
                        onClick={() => slotA ? cancelarSlot('A') : abrirModal('A')}
                    />
                    <div className="vr-fusion-operador">
                        <span className="vr-fusion-plus">+</span>
                    </div>
                    <PersonaCard
                        persona={slotB}
                        slot="B"
                        onClick={() => slotB ? cancelarSlot('B') : abrirModal('B')}
                    />
                </div>

                <button
                    className={`vr-btn-fundir ${podeConfirmar ? 'vr-btn-fundir--ativo' : ''}`}
                    onClick={confirmarFusao}
                    disabled={!podeConfirmar}
                    id="velvet-btn-fundir"
                >
                    {fusaoConfirmada ? '✓ Fusão Realizada!' : '⚗️  Executar Fusão'}
                </button>

                {/* Inventário disponível */}
                <div className="vr-inventario-resumo">
                    <div className="vr-inventario-titulo">
                        Inventário — {inventarioDisponivel.length} livres / {inventario.length} total
                    </div>
                    <div className="vr-inventario-lista">
                        {inventario.map(p => {
                            const equipada = personasEquipadas.includes(p.name)
                            return (
                                <div key={p.name} className={`vr-inventario-item ${equipada ? 'vr-inventario-item--equipado' : ''}`}>
                                    <span>{ARCANA_ICON[p.arcana] ?? '❓'}</span>
                                    <span className="vr-inventario-nome">{p.name}</span>
                                    <span className="vr-inventario-nivel">Nv. {p.level}</span>
                                    {equipada && <span className="vr-inventario-lock">🔒</span>}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ── Divisor ── */}
            <div className="vr-divisor">
                <div className="vr-divisor-linha" />
                <span className="vr-divisor-icon">⟶</span>
                <div className="vr-divisor-linha" />
            </div>

            {/* ── Painel Direito: Resultado ── */}
            <section className="vr-painel-resultado">
                <h2 className="vr-secao-titulo">Resultado</h2>

                {!slotA && !slotB && !fusaoConfirmada && (
                    <div className="vr-resultado-vazio">
                        <span className="vr-resultado-vazio-icon">🔮</span>
                        <p>Selecione duas Personas para ver o resultado.</p>
                    </div>
                )}

                {(slotA || slotB) && !(slotA && slotB) && !fusaoConfirmada && (
                    <div className="vr-resultado-vazio">
                        <span className="vr-resultado-vazio-icon">⏳</span>
                        <p>Selecione a {slotA ? 'segunda' : 'primeira'} Persona para calcular.</p>
                    </div>
                )}

                {slotA && slotB && fusao?.error && (
                    <div className="vr-resultado-erro">
                        <span className="vr-resultado-erro-icon">⚠️</span>
                        <p>{fusao.error}</p>
                    </div>
                )}

                {slotA && slotB && fusao && !fusao.error && !fusaoConfirmada && (
                    <>
                        <div className="vr-resultado-meta">
                            <span className="vr-resultado-formula">
                                {slotA.arcana} + {slotB.arcana}
                                <span className="vr-resultado-seta">→</span>
                                {fusao.resultArcana}
                            </span>
                            <span className="vr-resultado-nivel-calc">
                                Nv. ⌊({slotA.level} + {slotB.level}) / 2⌋ + 1 = {Math.floor((slotA.level + slotB.level) / 2) + 1}
                            </span>
                        </div>
                        <ResultCard persona={fusao.result} />
                    </>
                )}

                {fusaoConfirmada && historico[0] && (
                    <div className="vr-fusao-confirmada">
                        <div className="vr-fusao-confirmada-badge">✓ FUSÃO COMPLETA</div>
                        <ResultCard persona={historico[0]} />
                    </div>
                )}

                {historico.length > 0 && (
                    <div className="vr-historico">
                        <div className="vr-historico-titulo">Fusões Anteriores</div>
                        <div className="vr-historico-lista">
                            {historico.map((p, i) => (
                                <div key={`${p.name}-${i}`} className="vr-historico-item">
                                    <span>{ARCANA_ICON[p.arcana]}</span>
                                    <span className="vr-historico-nome">{p.name}</span>
                                    <span className="vr-historico-nivel">Nv. {p.level}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* Modal de seleção */}
            {modalAberto && (
                <ModalSelecao
                    inventario={inventario}
                    personasEquipadas={personasEquipadas}
                    excludePersona={modalAberto === 'A' ? slotB : slotA}
                    onSelect={selecionarPersona}
                    onClose={() => setModalAberto(null)}
                />
            )}
        </div>
    )
}

// ──────────────────────────────────────────────
//  Aba: Compêndio (Registrar & Invocar)
// ──────────────────────────────────────────────
function AbaCompendio({ inventario, personasEquipadas, compendio, registrarNoCompendio, invocarDoCompendio, yen }) {
    const [subAba, setSubAba] = useState('registrar') // 'registrar' | 'invocar'
    const [feedbackMsg, setFeedbackMsg] = useState(null) // { tipo: 'ok'|'erro', texto }
    const [filtro, setFiltro] = useState('')

    function mostrarFeedback(tipo, texto) {
        setFeedbackMsg({ tipo, texto })
        setTimeout(() => setFeedbackMsg(null), 3000)
    }

    function handleRegistrar(persona) {
        if (compendio[persona.name]) {
            mostrarFeedback('erro', `${persona.name} já está registrada no compêndio.`)
            return
        }
        registrarNoCompendio(persona)
        mostrarFeedback('ok', `${persona.name} registrada com sucesso!`)
    }

    function handleInvocar(nomePersona) {
        const res = invocarDoCompendio(nomePersona)
        if (res.sucesso) {
            mostrarFeedback('ok', `${nomePersona} invocada para o inventário!`)
        } else {
            mostrarFeedback('erro', res.erro)
        }
    }

    const personasNoCompendio = Object.values(compendio).filter(
        p => !filtro || p.name.toLowerCase().includes(filtro.toLowerCase())
    )

    const inventarioRegistravel = inventario.filter(
        p => !filtro || p.name.toLowerCase().includes(filtro.toLowerCase())
    )

    return (
        <div className="vr-compendio">

            {/* Sub-abas */}
            <div className="vr-compendio-tabs">
                <button
                    className={`vr-compendio-tab ${subAba === 'registrar' ? 'vr-compendio-tab--ativo' : ''}`}
                    onClick={() => { setSubAba('registrar'); setFiltro('') }}
                    id="velvet-tab-registrar"
                >
                    📝 Registrar Persona
                </button>
                <button
                    className={`vr-compendio-tab ${subAba === 'invocar' ? 'vr-compendio-tab--ativo' : ''}`}
                    onClick={() => { setSubAba('invocar'); setFiltro('') }}
                    id="velvet-tab-invocar"
                >
                    📯 Invocar do Compêndio
                </button>
            </div>

            {/* Feedback */}
            {feedbackMsg && (
                <div className={`vr-feedback ${feedbackMsg.tipo === 'ok' ? 'vr-feedback--ok' : 'vr-feedback--erro'}`}>
                    {feedbackMsg.tipo === 'ok' ? '✓' : '✕'} {feedbackMsg.texto}
                </div>
            )}

            {/* Barra de busca */}
            <input
                className="vr-modal-busca vr-compendio-busca"
                placeholder={subAba === 'registrar' ? 'Buscar no inventário...' : 'Buscar no compêndio...'}
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
            />

            {/* ── Registrar ── */}
            {subAba === 'registrar' && (
                <div className="vr-compendio-conteudo">
                    <p className="vr-secao-desc">
                        Registre uma Persona do seu inventário no Compêndio para poder invocá-la mais tarde.
                        Personas equipadas pela equipe <strong>não podem</strong> ser registradas.
                    </p>
                    {inventarioRegistravel.length === 0 ? (
                        <div className="vr-resultado-vazio">
                            <span className="vr-resultado-vazio-icon">📦</span>
                            <p>Nenhuma Persona no inventário.</p>
                        </div>
                    ) : (
                        <div className="vr-compendio-grid">
                            {inventarioRegistravel.map(p => {
                                const equipada = personasEquipadas.includes(p.name)
                                const jaRegistrada = !!compendio[p.name]
                                return (
                                    <div
                                        key={p.name}
                                        className={`vr-compendio-card ${equipada ? 'vr-compendio-card--bloqueado' : ''} ${jaRegistrada ? 'vr-compendio-card--registrado' : ''}`}
                                    >
                                        <div className="vr-compendio-card-header">
                                            <span className="vr-compendio-arcana-icon">{ARCANA_ICON[p.arcana] ?? '❓'}</span>
                                            <div>
                                                <div className="vr-compendio-arcana-nome">{p.arcana}</div>
                                                <div className="vr-compendio-nome">{p.name}</div>
                                            </div>
                                            <div className="vr-compendio-nivel">Nv. {p.level}</div>
                                        </div>
                                        <div className="vr-compendio-stats">
                                            {Object.entries(p.stats || {}).map(([stat, val]) => (
                                                <span key={stat} className="vr-stat-chip">
                                                    <span className="vr-stat-label">{stat.toUpperCase()}</span>
                                                    <span className="vr-stat-val">{val}</span>
                                                </span>
                                            ))}
                                        </div>
                                        <button
                                            className={`vr-compendio-btn ${jaRegistrada ? 'vr-compendio-btn--registrado' : ''} ${equipada ? 'vr-compendio-btn--disabled' : ''}`}
                                            onClick={() => !equipada && !jaRegistrada && handleRegistrar(p)}
                                            disabled={equipada || jaRegistrada}
                                            title={equipada ? 'Persona está equipada pela equipe' : jaRegistrada ? 'Já registrada' : 'Registrar no compêndio'}
                                        >
                                            {equipada ? '🔒 Em Uso' : jaRegistrada ? '✓ Registrada' : '📝 Registrar'}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── Invocar ── */}
            {subAba === 'invocar' && (
                <div className="vr-compendio-conteudo">
                    <div className="vr-compendio-yen">
                        <span className="vr-compendio-yen-label">Seu saldo:</span>
                        <span className="vr-compendio-yen-valor">¥ {yen.toLocaleString('pt-BR')}</span>
                    </div>
                    <p className="vr-secao-desc">
                        Invoque Personas registradas pagando Yen. Custo: <strong>Nível × ¥100</strong>.
                    </p>

                    {personasNoCompendio.length === 0 ? (
                        <div className="vr-resultado-vazio">
                            <span className="vr-resultado-vazio-icon">📯</span>
                            <p>
                                {filtro ? 'Nenhuma Persona encontrada.' : 'O compêndio está vazio. Registre Personas primeiro.'}
                            </p>
                        </div>
                    ) : (
                        <div className="vr-compendio-grid">
                            {personasNoCompendio.map(p => {
                                const custo = custoCompendio(p.level)
                                const podePagar = yen >= custo
                                const jaNoInventario = inventario.some(inv => inv.name === p.name)
                                return (
                                    <div key={p.name} className="vr-compendio-card">
                                        <div className="vr-compendio-card-header">
                                            <span className="vr-compendio-arcana-icon">{ARCANA_ICON[p.arcana] ?? '❓'}</span>
                                            <div>
                                                <div className="vr-compendio-arcana-nome">{p.arcana}</div>
                                                <div className="vr-compendio-nome">{p.name}</div>
                                            </div>
                                            <div className="vr-compendio-nivel">Nv. {p.level}</div>
                                        </div>
                                        <div className="vr-compendio-stats">
                                            {Object.entries(p.stats || {}).map(([stat, val]) => (
                                                <span key={stat} className="vr-stat-chip">
                                                    <span className="vr-stat-label">{stat.toUpperCase()}</span>
                                                    <span className="vr-stat-val">{val}</span>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="vr-compendio-custo">
                                            Custo: <span className={podePagar ? 'vr-custo-ok' : 'vr-custo-insuf'}>
                                                ¥ {custo.toLocaleString('pt-BR')}
                                            </span>
                                        </div>
                                        <button
                                            className={`vr-compendio-btn ${jaNoInventario ? 'vr-compendio-btn--registrado' : ''} ${!podePagar && !jaNoInventario ? 'vr-compendio-btn--disabled' : ''}`}
                                            onClick={() => !jaNoInventario && handleInvocar(p.name)}
                                            disabled={!podePagar || jaNoInventario}
                                            title={jaNoInventario ? 'Já no inventário' : !podePagar ? 'Yen insuficiente' : 'Invocar Persona'}
                                        >
                                            {jaNoInventario ? '✓ No Inventário' : !podePagar ? '✕ Yen Insuficiente' : '📯 Invocar'}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ──────────────────────────────────────────────
//  Componente Principal
// ──────────────────────────────────────────────
function VelvetRoom() {
    const navigate = useNavigate()
    const [abaAtiva, setAbaAtiva] = useState('fusao') // 'fusao' | 'compendio'

    const {
        inventarioPersonas,
        personasEquipadas,
        equipe,
        compendio,
        registrarNoCompendio,
        invocarDoCompendio,
        executarFusao,
        yen,
        ganharYen,
    } = useGame()

    return (
        <div id="tela-velvet">
            {/* Partículas */}
            <div className="vr-particles" aria-hidden="true">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="vr-particle" style={{
                        left: `${(i * 5.3) % 100}%`,
                        animationDelay: `${(i * 0.7) % 8}s`,
                        animationDuration: `${6 + (i * 0.9) % 8}s`,
                    }} />
                ))}
            </div>

            {/* ── Header ── */}
            <header className="velvet-header">
                <div className="velvet-header-left">
                    <h1 className="velvet-titulo">
                        <span className="velvet-titulo-icon">🔮</span>
                        Velvet Room
                    </h1>
                    <p className="velvet-subtitulo">
                        Entre o sonho e a realidade, mente e matéria.
                    </p>
                </div>

                <div className="velvet-header-info">
                    <span className="velvet-yen">💴 ¥ {yen.toLocaleString('pt-BR')}</span>
                    <span className="velvet-inventario-count">
                        🎴 {inventarioPersonas.length} Personas
                    </span>
                </div>

                <button
                    className="velvet-btn-voltar"
                    onClick={() => navigate(-1)}
                    id="velvet-btn-voltar"
                >
                    ← VOLTAR
                </button>
            </header>

            {/* ── Navegação de abas ── */}
            <nav className="vr-tabs" role="tablist">
                <button
                    className={`vr-tab ${abaAtiva === 'fusao' ? 'vr-tab--ativo' : ''}`}
                    onClick={() => setAbaAtiva('fusao')}
                    role="tab"
                    id="velvet-tab-fusao"
                    aria-selected={abaAtiva === 'fusao'}
                >
                    <span className="vr-tab-icon">⚗️</span>
                    <span className="vr-tab-texto">
                        Fusão
                        <span className="vr-tab-desc">Combinar duas Personas</span>
                    </span>
                </button>
                <button
                    className={`vr-tab ${abaAtiva === 'compendio' ? 'vr-tab--ativo' : ''}`}
                    onClick={() => setAbaAtiva('compendio')}
                    role="tab"
                    id="velvet-tab-compendio"
                    aria-selected={abaAtiva === 'compendio'}
                >
                    <span className="vr-tab-icon">📖</span>
                    <span className="vr-tab-texto">
                        Compêndio
                        <span className="vr-tab-desc">Registrar e Invocar</span>
                    </span>
                    {Object.keys(compendio).length > 0 && (
                        <span className="vr-tab-badge">{Object.keys(compendio).length}</span>
                    )}
                </button>
            </nav>

            {/* ── Aviso sobre personas equipadas ── */}
            {personasEquipadas.length > 0 && (
                <div className="vr-equipe-aviso">
                    🔒 Personas equipadas (indisponíveis para fusão/registro):
                    {equipe.map(m => (
                        <span key={m.id} className="vr-equipe-aviso-membro">
                            {m.icone} {m.nome}: <strong>{m.personaEquipada}</strong>
                        </span>
                    ))}
                </div>
            )}

            {/* ── Conteúdo da aba ── */}
            {abaAtiva === 'fusao' && (
                <AbaFusao
                    inventario={inventarioPersonas}
                    personasEquipadas={personasEquipadas}
                    yen={yen}
                    ganharYen={ganharYen}
                    executarFusao={executarFusao}
                    registrarNoCompendio={registrarNoCompendio}
                />
            )}

            {abaAtiva === 'compendio' && (
                <AbaCompendio
                    inventario={inventarioPersonas}
                    personasEquipadas={personasEquipadas}
                    compendio={compendio}
                    registrarNoCompendio={registrarNoCompendio}
                    invocarDoCompendio={invocarDoCompendio}
                    yen={yen}
                />
            )}
        </div>
    )
}

export default VelvetRoom
