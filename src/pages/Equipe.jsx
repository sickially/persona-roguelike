import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import megatenService from '../services/megatenService'
import './Equipe.css'

// Dados Mockados da Equipe
const EQUIPE_MOCK = [
    { 
        id: 1, 
        nome: 'Protagonista', 
        nivel: 5,
        persona: 'Arsène', 
        subPersona: 'Pixie',
        hp: 100, hpMax: 100, 
        sp: 80, spMax: 100, 
        icone: '🃏',
        arma: 'Adaga Inicial',
        armadura: 'Uniforme Escolar'
    },
    { 
        id: 2, 
        nome: 'Yosuke', 
        nivel: 5,
        persona: 'Jiraiya', 
        subPersona: null,
        hp: 90, hpMax: 120, 
        sp: 50, spMax: 80, 
        icone: '🌪️',
        arma: 'Kunai',
        armadura: 'Camiseta Básica'
    },
    { 
        id: 3, 
        nome: 'Chie', 
        nivel: 4,
        persona: 'Tomoe', 
        subPersona: null,
        hp: 130, hpMax: 130, 
        sp: 30, spMax: 40, 
        icone: '🥋',
        arma: 'Sapatos de Combate',
        armadura: 'Jaqueta Verde'
    }
]

function Equipe() {
    const navigate = useNavigate()
    const [membroAtivo, setMembroAtivo] = useState(EQUIPE_MOCK[0])

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
                    {EQUIPE_MOCK.map(membro => (
                        <div 
                            key={membro.id}
                            className={`equipe-membro-card ${membro.id === membroAtivo.id ? 'equipe-membro-card--ativo' : ''}`}
                            onClick={() => setMembroAtivo(membro)}
                        >
                            <div className="equipe-membro-icone">{membro.icone}</div>
                            <div className="equipe-membro-resumo">
                                <span className="equipe-membro-nome">{membro.nome}</span>
                                <span className="equipe-membro-persona">{membro.persona} (Nv. {membro.nivel})</span>
                            </div>
                        </div>
                    ))}
                </aside>

                {/* Detalhes do membro selecionado */}
                <section className="equipe-detalhes">
                    
                    <div className="equipe-detalhes-header">
                        <div className="equipe-detalhes-nome">
                            <h2>{membroAtivo.nome}</h2>
                            <p style={{color: 'rgba(227,234,255,0.5)', fontFamily: 'Rajdhani'}}>Persona: {membroAtivo.persona}</p>
                        </div>
                        <div className="equipe-detalhes-nivel">
                            NÍVEL {membroAtivo.nivel}
                        </div>
                    </div>

                    <div className="equipe-detalhes-status">
                        <div className="equipe-status-box">
                            <h3>VITALS (HP/SP)</h3>
                            <div className="equipe-status-barras">
                                <div className="equipe-status-barra">
                                    <span>HP</span>
                                    <div className="equipe-status-bg">
                                        <div className="equipe-status-fill equipe-status-fill--hp" style={{width: `${(membroAtivo.hp/membroAtivo.hpMax)*100}%`}}></div>
                                    </div>
                                    <span>{membroAtivo.hp}/{membroAtivo.hpMax}</span>
                                </div>
                                <div className="equipe-status-barra">
                                    <span>SP</span>
                                    <div className="equipe-status-bg">
                                        <div className="equipe-status-fill equipe-status-fill--sp" style={{width: `${(membroAtivo.sp/membroAtivo.spMax)*100}%`}}></div>
                                    </div>
                                    <span>{membroAtivo.sp}/{membroAtivo.spMax}</span>
                                </div>
                            </div>
                        </div>

                        <div className="equipe-status-box">
                            <h3>EQUIPAMENTOS</h3>
                            <div className="equipe-equipamentos">
                                <div className="equipe-equip-item">
                                    <span className="equipe-equip-label">Arma</span>
                                    <span>{membroAtivo.arma}</span>
                                </div>
                                <div className="equipe-equip-item">
                                    <span className="equipe-equip-label">Armadura</span>
                                    <span>{membroAtivo.armadura}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="equipe-subpersona">
                        <div className="equipe-subpersona-info">
                            <h4>STATUS DA PERSONA ({membroAtivo.persona})</h4>
                            {(() => {
                                const personaData = megatenService.getPersonaByName(membroAtivo.persona)
                                if (personaData) {
                                    return (
                                        <p style={{marginTop: '0.5rem'}}>
                                            <strong>St:</strong> {personaData.stats.st} | <strong>Ma:</strong> {personaData.stats.ma} | <strong>En:</strong> {personaData.stats.en} | <strong>Ag:</strong> {personaData.stats.ag} | <strong>Lu:</strong> {personaData.stats.lu}<br/>
                                            <span style={{fontSize: '0.75rem'}}>*Dados reais extraídos da database Megaten</span>
                                        </p>
                                    )
                                }
                                return <p style={{marginTop: '0.5rem'}}>Status indisponíveis para esta Persona.</p>
                            })()}
                        </div>
                    </div>

                </section>
            </main>
        </div>
    )
}

export default Equipe
