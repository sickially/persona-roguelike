import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Inventario.css'

// Mocks para a Etapa 1
const INVENTARIO_MOCK = [
    { id: 1, nome: 'Medicina', tipo: 'Consumível', desc: 'Restaura 50 HP de um aliado.', valor: 100, icone: '💊', qtd: 5 },
    { id: 2, nome: 'Snuff Soul', tipo: 'Consumível', desc: 'Restaura 50 SP de um aliado.', valor: 500, icone: '🍬', qtd: 2 },
    { id: 3, nome: 'Adaga Inicial', tipo: 'Arma', desc: 'Uma adaga simples, mas afiada. Dano Físico baixo.', valor: 200, icone: '🗡️', qtd: 1 },
    { id: 4, nome: 'Agi Card', tipo: 'Skill Card', desc: 'Ensina a skill "Agi" (Dano de Fogo leve) a uma Persona.', valor: 800, icone: '🃏', qtd: 1 },
]

const CATEGORIAS = ['Todos', 'Consumível', 'Arma', 'Armadura', 'Skill Card']

function Inventario() {
    const navigate = useNavigate()
    const [categoriaAtiva, setCategoriaAtiva] = useState('Todos')
    const [itemAtivo, setItemAtivo] = useState(null)

    const itensFiltrados = categoriaAtiva === 'Todos' 
        ? INVENTARIO_MOCK 
        : INVENTARIO_MOCK.filter(i => i.tipo === categoriaAtiva)

    return (
        <div id="tela-inventario">
            <header className="inv-header">
                <h1 className="inv-titulo">Inventário</h1>
                <button className="inv-btn-voltar" onClick={() => navigate(-1)}>
                    VOLTAR
                </button>
            </header>

            <main className="inv-conteudo">
                
                {/* MENU LATERAL DE CATEGORIAS */}
                <aside className="inv-categorias">
                    {CATEGORIAS.map(cat => (
                        <button 
                            key={cat}
                            className={`inv-btn-cat ${categoriaAtiva === cat ? 'inv-btn-cat--ativo' : ''}`}
                            onClick={() => {
                                setCategoriaAtiva(cat)
                                setItemAtivo(null)
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </aside>

                {/* GRADE DE ITENS */}
                <section className="inv-grade-container">
                    <div className="inv-grade">
                        {itensFiltrados.map(item => (
                            <div 
                                key={item.id} 
                                className={`inv-item ${itemAtivo?.id === item.id ? 'inv-item--ativo' : ''}`}
                                onClick={() => setItemAtivo(item)}
                            >
                                {item.icone}
                                <span className="inv-item-qtd">x{item.qtd}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* DETALHES DO ITEM */}
                <aside className="inv-detalhes">
                    {itemAtivo ? (
                        <>
                            <div className="inv-detalhe-icone">{itemAtivo.icone}</div>
                            <h2 className="inv-detalhe-nome">{itemAtivo.nome}</h2>
                            <p className="inv-detalhe-desc">{itemAtivo.desc}</p>
                            <p className="inv-detalhe-valor">Valor: {itemAtivo.valor} Yen</p>
                            <button className="inv-btn-usar">USAR / DESCARTAR</button>
                        </>
                    ) : (
                        <p className="inv-detalhe-vazio">Selecione um item para ver seus detalhes.</p>
                    )}
                </aside>

            </main>
        </div>
    )
}

export default Inventario
