import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './VelvetRoom.css'

import megatenService from '../services/megatenService'

// Pega todas as Personas da base real para listar na Velvet Room
const PERSONAS_MOCK = megatenService.getAllPersonas().map(p => ({
    id: p.name, 
    nome: p.name, 
    arcana: p.arcana, 
    nivel: p.level 
}))
// Ordena por nível para facilitar a visualização
PERSONAS_MOCK.sort((a, b) => a.nivel - b.nivel)

function VelvetRoom() {
    const navigate = useNavigate()
    const [abaAtiva, setAbaAtiva] = useState('fundir')
    const nivelJogador = 5 // Mock de nível do jogador

    return (
        <div id="tela-velvet">
            <header className="velvet-header">
                <h1 className="velvet-titulo">Velvet Room</h1>
                <button className="velvet-btn-voltar" onClick={() => navigate(-1)}>
                    VOLTAR
                </button>
            </header>

            <div className="velvet-corpo">
                <nav className="velvet-menu">
                    <button 
                        className={`velvet-btn-menu ${abaAtiva === 'fundir' ? 'velvet-btn-menu--ativo' : ''}`}
                        onClick={() => setAbaAtiva('fundir')}
                    >
                        <span className="velvet-btn-titulo">Fundir Personas</span>
                        <span className="velvet-btn-desc">Crie novas Personas combinando as atuais.</span>
                    </button>
                    
                    <button 
                        className={`velvet-btn-menu ${abaAtiva === 'registrar' ? 'velvet-btn-menu--ativo' : ''}`}
                        onClick={() => setAbaAtiva('registrar')}
                    >
                        <span className="velvet-btn-titulo">Registrar Persona</span>
                        <span className="velvet-btn-desc">Grave o estado atual de uma Persona.</span>
                    </button>

                    <button 
                        className={`velvet-btn-menu ${abaAtiva === 'comprar' ? 'velvet-btn-menu--ativo' : ''}`}
                        onClick={() => setAbaAtiva('comprar')}
                    >
                        <span className="velvet-btn-titulo">Invocar do Registro</span>
                        <span className="velvet-btn-desc">Compre Personas previamente registradas.</span>
                    </button>
                </nav>

                <main className="velvet-conteudo">
                    {abaAtiva === 'fundir' && (
                        <>
                            <h2 className="velvet-secao-titulo">Selecione Personas para Fusão</h2>
                            <div className="velvet-grid">
                                {PERSONAS_MOCK.map(p => (
                                    <div 
                                        key={p.id} 
                                        className={`velvet-persona-card ${p.nivel > nivelJogador ? 'velvet-persona-card--bloqueado' : ''}`}
                                    >
                                        <h3 className="velvet-persona-nome">{p.nome}</h3>
                                        <div className="velvet-persona-info">
                                            <span>{p.arcana}</span>
                                            <span>Nv: {p.nivel}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {abaAtiva === 'registrar' && (
                        <>
                            <h2 className="velvet-secao-titulo">Registro de Personas</h2>
                            <p style={{color: 'rgba(227, 234, 255, 0.6)'}}>Selecione uma Persona do seu inventário para registrar o seu progresso no compêndio.</p>
                            {/* Grid de personas do inventário do jogador iria aqui */}
                        </>
                    )}

                    {abaAtiva === 'comprar' && (
                        <>
                            <h2 className="velvet-secao-titulo">Compêndio de Personas</h2>
                            <p style={{color: 'rgba(227, 234, 255, 0.6)'}}>Pague com Yen para invocar Personas registradas.</p>
                            {/* Grid do compêndio iria aqui */}
                        </>
                    )}
                </main>
            </div>

            <footer className="velvet-footer">
                <span>Bem-vindo à Velvet Room. Este é o espaço entre o sonho e a realidade, mente e matéria.</span>
                <span>Nível do Jogador: {nivelJogador}</span>
            </footer>
        </div>
    )
}

export default VelvetRoom
