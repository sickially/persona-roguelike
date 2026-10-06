import { useParams, useNavigate } from 'react-router-dom'
import './Loja.css'

// Base de dados mockada das lojas
const LOJAS_DATA = {
    tanaka: {
        titulo: "Amazing Commodities",
        lojista: "Presidente Tanaka",
        icone: "📺",
        dialogo: "Ah, um cliente com um olhar aguçado! Você não vai encontrar preços menores em lugar nenhum. Aproveite nossas ofertas antes que acabem!",
        moedaNome: "Yen",
        moedaIcone: "💴",
        moedaValor: 2500,
        temaClass: "tema-tanaka",
        produtos: [
            { id: 1, nome: 'Medicina', desc: 'Restaura 50 HP.', preco: 100, icone: '💊' },
            { id: 2, nome: 'Snuff Soul', desc: 'Restaura 50 SP.', preco: 800, icone: '🍬' },
            { id: 3, nome: 'Camisa Kevlar', desc: 'Armadura básica.', preco: 1500, icone: '👕' },
        ]
    },
    jose: {
        titulo: "Jose's Shop",
        lojista: "Jose",
        icone: "⭐",
        dialogo: "Olá, senhor! Você trouxe Cognition Stamps pra mim? Eu posso mudar a forma como a dungeon funciona se você tiver selos suficientes!",
        moedaNome: "Stamps",
        moedaIcone: "🔵",
        moedaValor: 15,
        temaClass: "tema-jose",
        produtos: [
            { id: 1, nome: '+EXP Boost', desc: 'Aumenta a experiência ganha em 10%.', preco: 5, icone: '📈' },
            { id: 2, nome: '+Yen Boost', desc: 'Aumenta o dinheiro ganho em 10%.', preco: 5, icone: '💰' },
            { id: 3, nome: 'Item Boost', desc: 'Aumenta a chance de itens em baús.', preco: 10, icone: '🎁' },
        ]
    },
    marthym: {
        titulo: "Abismo de Marthym",
        lojista: "Marthym",
        icone: "🦇",
        dialogo: "As Meta Jewels brilham com a corrupção das sombras... Traga-as para mim, e eu lhe concederei Personas poderosas.",
        moedaNome: "Meta Jewels",
        moedaIcone: "💎",
        moedaValor: 3,
        temaClass: "tema-marthym",
        produtos: [
            { id: 1, nome: 'Jack Frost', desc: 'Persona nível 3.', preco: 1, icone: '⛄' },
            { id: 2, nome: 'Nekomata', desc: 'Persona nível 17.', preco: 2, icone: '🐱' },
            { id: 3, nome: 'Black Frost', desc: 'Persona nível 40.', preco: 5, icone: '😈' },
        ]
    }
}

function Loja() {
    const { lojista } = useParams()
    const navigate = useNavigate()
    
    // Fallback caso a rota não corresponda a nenhum lojista conhecido
    const dados = LOJAS_DATA[lojista] || LOJAS_DATA['tanaka']

    return (
        <div id="tela-loja" className={dados.temaClass}>
            
            <header className="loja-header">
                <h1 className="loja-titulo">{dados.titulo}</h1>
                <button className="loja-btn-voltar" onClick={() => navigate(-1)}>
                    SAIR
                </button>
            </header>

            <main className="loja-conteudo">
                
                {/* Painel do Lojista */}
                <aside className="loja-painel-esq">
                    <div className="loja-retrato">
                        {dados.icone}
                    </div>
                    
                    <div className="loja-dialogo">
                        <strong>{dados.lojista}:</strong><br/>
                        "{dados.dialogo}"
                    </div>

                    <div className="loja-carteira">
                        <div className="loja-carteira-titulo">SUA CARTEIRA</div>
                        <div className="loja-carteira-valor">
                            {dados.moedaIcone} {dados.moedaValor}
                        </div>
                    </div>
                </aside>

                {/* Vitrine de Produtos */}
                <section className="loja-vitrine">
                    {dados.produtos.map(prod => (
                        <div key={prod.id} className="loja-produto-card">
                            <div className="loja-produto-icone">{prod.icone}</div>
                            <div className="loja-produto-nome">{prod.nome}</div>
                            <div className="loja-produto-desc">{prod.desc}</div>
                            <button className="loja-btn-comprar">
                                {prod.preco} {dados.moedaIcone}
                            </button>
                        </div>
                    ))}
                </section>
                
            </main>
        </div>
    )
}

export default Loja
