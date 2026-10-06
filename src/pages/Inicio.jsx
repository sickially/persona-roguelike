import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Inicio.css'

const CAMINHOS = [
    {
        id: 'mortality',
        nome: 'Mortality',
        origem: 'Tartarus · Persona 3',
        desc: 'Suba os andares da torre sombria. A escuridão cresce a cada degrau.',
        icone: '🗼',
    },
    {
        id: 'truth',
        nome: 'Truth',
        origem: 'Midnight Channel · Persona 4',
        desc: 'Entre na névoa do canal da meia-noite. A verdade nunca é o que parece.',
        icone: '📺',
    },
    {
        id: 'rebellion',
        nome: 'Rebellion',
        origem: 'Mementos · Persona 5',
        desc: 'Desça pelos trilhos do subconsciente. Roube os corações corrompidos.',
        icone: '🚇',
    },
]

function Inicio() {
    const navigate = useNavigate()
    const [caminhoSelecionado, setCaminhoSelecionado] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSetup, setIsSetup] = useState(false)
    const [nomeJogador, setNomeJogador] = useState('')

    useEffect(() => {
        // Simula o carregamento inicial da database Megaten (Etapa 2)
        const timer = setTimeout(() => {
            setIsLoading(false)
            
            // Verifica se o jogador já tem nome salvo localmente
            const nomeSalvo = localStorage.getItem('personaRoguelike_nome')
            if (!nomeSalvo) {
                setIsSetup(true)
            }
        }, 2000)

        return () => clearTimeout(timer)
    }, [])

    function handleSalvarNome(e) {
        e.preventDefault()
        if (nomeJogador.trim().length > 0) {
            localStorage.setItem('personaRoguelike_nome', nomeJogador.trim())
            setIsSetup(false)
        }
    }

    function handleJogar() {
        if (!caminhoSelecionado) return
        navigate('/selecao-inicial', { state: { caminho: caminhoSelecionado } })
    }

    if (isLoading) {
        return (
            <div id="tela-inicio" className="inicio-centralizado">
                <div className="inicio-loading-spinner"></div>
                <h2 className="inicio-loading-texto">Carregando Compêndio...</h2>
                <p className="inicio-loading-subtexto">Conectando à Megaten Database</p>
            </div>
        )
    }

    if (isSetup) {
        return (
            <div id="tela-inicio" className="inicio-centralizado">
                <div className="inicio-setup-box">
                    <h2>Bem-vindo à Velvet Room</h2>
                    <p>Antes de forjar seu destino, como devo chamá-lo?</p>
                    <form onSubmit={handleSalvarNome}>
                        <input 
                            type="text" 
                            className="inicio-input-nome"
                            placeholder="Seu Nome..." 
                            value={nomeJogador}
                            onChange={(e) => setNomeJogador(e.target.value)}
                            maxLength={15}
                            autoFocus
                        />
                        <button 
                            type="submit" 
                            className="inicio-btn-jogar"
                            disabled={nomeJogador.trim().length === 0}
                            style={{marginTop: '2rem'}}
                        >
                            Assinar Contrato
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div id="tela-inicio">

            {/* Logo */}
            <header className="inicio-logo">
                <p className="inicio-logo-subtitulo">Shin Megami Tensei</p>
                <h1 className="inicio-logo-titulo">
                    Persona
                    <span>Roguelike</span>
                </h1>
            </header>

            {/* Separador */}
            <div className="inicio-separador">
                <div className="inicio-separador-linha"></div>
                <div className="inicio-separador-icone"></div>
                <div className="inicio-separador-linha"></div>
            </div>

            {/* Instrução */}
            <p className="inicio-instrucao">
                Bem-vindo de volta, <strong>{localStorage.getItem('personaRoguelike_nome')}</strong>.<br/>
                Escolha seu caminho.
            </p>

            {/* Cards de Caminho */}
            <div className="inicio-caminhos">
                {CAMINHOS.map((c) => (
                    <div
                        key={c.id}
                        className={`caminho-card caminho-card--${c.id}${caminhoSelecionado === c.id ? ' caminho-card--ativo' : ''}`}
                        onClick={() => setCaminhoSelecionado(c.id)}
                        role="button"
                        aria-pressed={caminhoSelecionado === c.id}
                        id={`card-caminho-${c.id}`}
                    >
                        <div className="caminho-card-bg"></div>
                        <div className="caminho-card-overlay"></div>
                        <span className="caminho-card-icone">{c.icone}</span>
                        {caminhoSelecionado === c.id && (
                            <div className="caminho-card-selecionado">✓</div>
                        )}
                        <div className="caminho-card-conteudo">
                            <h2 className="caminho-card-nome">{c.nome}</h2>
                            <p className="caminho-card-origem">{c.origem}</p>
                            <p className="caminho-card-desc">{c.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Botão Jogar */}
            <button
                className={`inicio-btn-jogar${!caminhoSelecionado ? ' inicio-btn-jogar--desativado' : ''}`}
                onClick={handleJogar}
                disabled={!caminhoSelecionado}
                id="btn-iniciar-jornada"
            >
                {caminhoSelecionado ? 'Iniciar Jornada' : 'Selecione um Caminho'}
            </button>

            {/* Rodapé */}
            <footer className="inicio-rodape">
                <p>Baseado na franquia Shin Megami Tensei: Persona · Projeto Fan-Made</p>
            </footer>

        </div>
    )
}

export default Inicio