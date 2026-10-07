import { useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useGame, getCustoSkill, getStatCustoSkill } from '../context/GameContext'
import megatenService from '../services/megatenService'
import './Combate.css'

// Converte qualquer NaN / undefined / null em 0
const toNum = (v) => (typeof v === 'number' && isFinite(v) ? v : 0)

// ─── Gerador de inimigos baseado no tipo de encontro ───
function gerarInimigos(tipo) {
    const commonPool = [
        { nome: 'Cowardly Maya',  hp: 60,  hpMax: 60,  atk: 10, icone: '🎭', fraqueza: 'Fire', img: '/enemies/cowardly_maya.png' },
        { nome: 'Lying Hablerie', hp: 80,  hpMax: 80,  atk: 14, icone: '🗿', fraqueza: 'Ice', img: '/enemies/hablerie.jpg' },
        { nome: 'Magic Hand',     hp: 120, hpMax: 120, atk: 20, icone: '🖐️', fraqueza: 'Wind', img: '/enemies/magic_hand.png' },
        { nome: 'Pixie',          hp: 50,  hpMax: 50,  atk: 18, icone: '🧚', fraqueza: 'Gun', img: '/enemies/pixie.png' },
        { nome: 'Bicorn',         hp: 100, hpMax: 100, atk: 15, icone: '🐴', fraqueza: 'Elec', img: '/enemies/bicorn.png' },
        { nome: 'Agathion',       hp: 70,  hpMax: 70,  atk: 12, icone: '🏺', fraqueza: 'Wind', img: '/enemies/agathion.png' },
        { nome: 'Slime',          hp: 90,  hpMax: 90,  atk: 11, icone: '💧', fraqueza: 'Fire', img: '/enemies/slime.png' }
    ];

    if (tipo === 'RARA') {
        return [
            { id: 'r1', nome: 'Golden Hand', hp: 250, hpMax: 250, atk: 25, icone: '✨', fraqueza: 'Phys', isDown: false, img: '/enemies/golden_hand.png' }
        ];
    }
    
    if (tipo === 'BOSS') {
        return [
            { id: 'b1', nome: 'Rampaging Gigas', hp: 500, hpMax: 500, atk: 45, icone: '👹', fraqueza: 'Psy', isDown: false, img: '/enemies/agathion.png' }
        ];
    }

    // Default: BATALHA (Batalhas comuns)
    const qtd = Math.floor(Math.random() * 2) + 2; // 2 ou 3 inimigos por luta
    const gerados = [];
    for (let i = 0; i < qtd; i++) {
        const sorteio = commonPool[Math.floor(Math.random() * commonPool.length)];
        gerados.push({
            ...sorteio,
            id: `e${i + 1}`,
            nome: `${sorteio.nome} ${String.fromCharCode(65 + i)}`,
            isDown: false
        });
    }
    return gerados;
}

// ─── Recompensas por tipo ───
const RECOMPENSAS = {
    BATALHA: { exp: 45,  yen: 120 },
    RARA:    { exp: 150, yen: 400 },
    BOSS:    { exp: 500, yen: 1000 },
}

// ─── Analisador de Skills baseado na database do Megaten ───
function parseSkillEffect(skill) {
    const desc = (skill.description || '').toLowerCase();
    
    const isMulti = desc.includes('all foes') || desc.includes('all allies');
    
    let tipoAcao = 'dano'; // 'dano', 'cura', 'suporte'
    let power = 30; // poder base

    // Determinar o tipo da ação
    if (skill.affinity === 'Recovery' || desc.includes('hp recovery')) {
        tipoAcao = 'cura';
        if (desc.includes('slight')) power = 45;
        else if (desc.includes('moderate')) power = 120;
        else if (desc.includes('full')) power = 9999;
        else if (desc.includes('half')) power = -50; // Valor negativo usado como flag de % no código
        else power = 60;
    } else if (skill.affinity === 'Ailment' || skill.type === 'AILMENT' || desc.includes('decreases') || desc.includes('lowers') || desc.includes('chance of inflicting')) {
        tipoAcao = 'debuff';
    } else if (skill.affinity === 'Support' || skill.type === 'SUPPORT' || desc.includes('raises') || desc.includes('allies')) {
        tipoAcao = 'suporte';
    } else {
        tipoAcao = 'dano';
        if (desc.includes('miniscule')) power = 20;
        else if (desc.includes('weak')) power = 50;
        else if (desc.includes('medium')) power = 100;
        else if (desc.includes('heavy')) power = 180;
        else if (desc.includes('severe')) power = 320;
        else if (desc.includes('colossal')) power = 550;
        else {
            const custoBase = typeof skill.cost === 'number' ? skill.cost : (skill.cost?.amount || 10);
            power = Math.max(30, custoBase * 3);
        }
    }

    return { tipoAcao, power, isMulti, desc };
}

function Combate() {
    const navigate = useNavigate()
    const location = useLocation()
    const { equipe, atualizarEquipeAposCombate, ganharYen, avancarSegmento } = useGame()

    const caminho    = location.state?.caminho    || 'rebellion'
    const tipoInimigo = location.state?.tipoInimigo || 'BATALHA'

    // Estado local de batalha — copiamos a equipe para não mutar o contexto durante o combate
    const [aliados, setAliados] = useState(() =>
        equipe.map(m => ({ ...m }))
    )
    const [inimigos, setInimigos] = useState(() => gerarInimigos(tipoInimigo))

    // turnoIndex = index do membro que o PLAYER selecionou para agir
    // (não avance automático — o player clica no membro desejado)
    const [turnoIndex, setTurnoIndex] = useState(() => {
        // Começa selecionando o protagonista (index 0)
        return 0
    })
    const [log, setLog]               = useState('')
    const [animandoId, setAnimandoId] = useState(null)
    const [resultado, setResultado]   = useState(null) // 'vitoria' | 'derrota'
    const [fase, setFase]             = useState('jogador') // 'jogador' | 'inimigo' | 'selecao_alvo' | 'fim'
    const [acaoPendente, setAcaoPendente] = useState(null)
    const [aliadoAtacadoId, setAliadoAtacadoId] = useState(null)
    const [menuAberto, setMenuAberto] = useState(false)
    const [jaAgiu, setJaAgiu]         = useState(new Set()) // IDs que já agiram nesta rodada

    const aliadoAtual = aliados[turnoIndex]
    const recompensa  = RECOMPENSAS[tipoInimigo] ?? RECOMPENSAS.BATALHA

    // Quantos aliados vivos ainda não agiram nesta rodada
    const vivosNaoAgiram = aliados.filter(a => a.hp > 0 && !jaAgiu.has(a.id))
    const todosAgiram = vivosNaoAgiram.length === 0

    function dispararLog(msg) {
        setLog('')
        setTimeout(() => setLog(msg), 30)
    }

    // ── Verificações de fim de combate ──
    function verificarFim(novosAliados, novosInimigos) {
        const todosMortos   = novosInimigos.every(i => i.hp <= 0)
        const todosKO       = novosAliados.every(a => a.hp <= 0)

        if (todosMortos) {
            setTimeout(() => {
                setResultado('vitoria')
                setFase('fim')
            }, 800)
            return true
        }
        if (todosKO) {
            setTimeout(() => {
                setResultado('derrota')
                setFase('fim')
            }, 800)
            return true
        }
        return false
    }

    // ── Turno do inimigo (após todos os aliados agirem) ──
    function turnoInimigo(novosAliados, novosInimigos) {
        const vivos = novosInimigos.filter(i => i.hp > 0)
        if (vivos.length === 0) return

        setFase('inimigo')
        setMenuAberto(false)

        // Cada inimigo ataca um aliado aleatório vivo
        let estadoAliados = [...novosAliados]
        let delay = 0

        vivos.forEach((inimigo) => {
            delay += 700
            setTimeout(() => {
                if (inimigo.isDown) {
                    dispararLog(`${inimigo.nome} estava debilitado e se recuperou, perdendo o turno!`)
                    setInimigos(prev => prev.map(i => i.id === inimigo.id ? { ...i, isDown: false } : i))
                    return
                }

                estadoAliados = estadoAliados.map(a => {
                    if (a.hp <= 0) return a
                    const alvosVivos = estadoAliados.filter(x => x.hp > 0)
                    const alvoEscolhido = alvosVivos[Math.floor(Math.random() * alvosVivos.length)]
                    if (alvoEscolhido?.id !== a.id) return a

                    const dano = Math.max(1, inimigo.atk + Math.floor(Math.random() * 8) - 4)
                    setAliadoAtacadoId(a.id)
                    dispararLog(`${inimigo.nome} atacou ${a.nome} por ${dano} de dano!`)
                    setTimeout(() => setAliadoAtacadoId(null), 400)
                    return { ...a, hp: Math.max(0, a.hp - dano) }
                })
                setAliados([...estadoAliados])
            }, delay)
        })

        // Após todos os ataques: verifica fim e reinicia rodada do jogador
        setTimeout(() => {
            setAliados(prev => {
                const fim = verificarFim(prev, novosInimigos)
                if (!fim) {
                    // Nova rodada: reset de quem agiu; seleciona primeiro aliado vivo
                    const primeiroVivo = prev.findIndex(a => a.hp > 0)
                    setTurnoIndex(primeiroVivo >= 0 ? primeiroVivo : 0)
                    setJaAgiu(new Set())
                    setFase('jogador')
                }
                return prev
            })
        }, delay + 600)
    }

    // ── Player seleciona qual membro vai agir (ou um alvo se estiver selecionando) ──
    function handleSelecionarMembro(index) {
        const membro = aliados[index]
        if (!membro) return
        
        if (fase === 'selecao_alvo') {
             handleAlvoClick(membro.id, 'aliado');
             return;
        }

        if (fase !== 'jogador' || resultado) return
        if (membro.hp <= 0 || jaAgiu.has(membro.id)) return
        
        setTurnoIndex(index)
        setMenuAberto(false)
    }

    // ── Após uma ação do jogador: marca como agido e decide próximo passo ──
    function posAcaoJogador(novosAliados, novosInimigos, ganhouOneMore = false) {
        if (ganhouOneMore) {
            dispararLog(`1 MORE! ${aliadoAtual.nome} ganhou um turno extra!`)
            return
        }

        const novoJaAgiu = new Set(jaAgiu)
        novoJaAgiu.add(aliadoAtual.id)
        setJaAgiu(novoJaAgiu)

        const vivos = novosAliados.filter(a => a.hp > 0)
        const restantes = vivos.filter(a => !novoJaAgiu.has(a.id))

        if (restantes.length > 0) {
            // Ainda há aliados que não agiram — auto-seleciona o próximo vivo
            const proxIndex = novosAliados.findIndex(a => a.hp > 0 && !novoJaAgiu.has(a.id))
            setTurnoIndex(proxIndex)
            // NÃO é turno do inimigo ainda
        } else {
            // Todos os vivos já agiram — turno dos inimigos
            turnoInimigo(novosAliados, novosInimigos)
        }
    }

    // ── AÇÃO: Ataque físico ──
    function handleAtaque() {
        if (fase !== 'jogador') return
        setAcaoPendente({ tipo: 'ataque' })
        setFase('selecao_alvo')
        dispararLog('Selecione um inimigo para atacar.')
    }

    // ── AÇÃO: Abrir menu de Skills ──
    function handleAbrirSkills() {
        if (fase !== 'jogador') return
        setMenuAberto(true)
    }

    // ── AÇÃO: Usar uma Skill específica ──
    function handleUsarSkill(skill) {
        if (fase !== 'jogador') return
        
        const statCusto = getStatCustoSkill(skill)
        const valorCusto = getCustoSkill(skill)
        
        let custoSP = 0
        let custoHP = 0

        if (statCusto === 'HP') {
            custoHP = Math.max(1, Math.floor(aliadoAtual.hpMax * (valorCusto / 100)))
            if (aliadoAtual.hp <= custoHP + 1) {
                dispararLog(`${aliadoAtual.nome} não tem HP suficiente!`)
                return
            }
        } else {
            custoSP = valorCusto || 5
            if (aliadoAtual.sp < custoSP) {
                dispararLog(`${aliadoAtual.nome} não tem SP suficiente!`)
                return
            }
        }

        setMenuAberto(false)
        const efeito = parseSkillEffect(skill);

        if (efeito.isMulti) {
             executarSkillMulti(skill, efeito, custoSP, custoHP);
        } else {
             setAcaoPendente({ tipo: 'skill', skill, efeito, custoSP, custoHP });
             setFase('selecao_alvo');
             if (efeito.tipoAcao === 'cura' || efeito.tipoAcao === 'suporte') {
                  dispararLog(`Selecione um aliado para usar ${skill.name}.`);
             } else {
                  dispararLog(`Selecione um inimigo para usar ${skill.name}.`);
             }
        }
    }

    // ── CANCELAR SELEÇÃO ──
    function handleCancelarAcao() {
         setAcaoPendente(null);
         setFase('jogador');
         dispararLog('Ação cancelada.');
    }

    // ── CLIQUE NO ALVO ──
    function handleAlvoClick(alvoId, tipoAlvo) {
        if (fase !== 'selecao_alvo' || !acaoPendente) return;

        if (acaoPendente.tipo === 'ataque') {
             if (tipoAlvo !== 'inimigo') {
                 dispararLog('Ataques básicos só podem mirar inimigos!');
                 return;
             }
             executarAtaqueFisico(alvoId);
        } else if (acaoPendente.tipo === 'skill') {
             const { skill, efeito } = acaoPendente;
             
             if (efeito.tipoAcao === 'cura' || efeito.tipoAcao === 'suporte') {
                 if (tipoAlvo !== 'aliado') {
                     dispararLog('Esta skill só pode mirar aliados!');
                     return;
                 }
                 executarSkillSingle(alvoId, 'aliado', acaoPendente);
             } else {
                 if (tipoAlvo !== 'inimigo') {
                     dispararLog('Esta skill só pode mirar inimigos!');
                     return;
                 }
                 executarSkillSingle(alvoId, 'inimigo', acaoPendente);
             }
        }
    }

    function executarAtaqueFisico(alvoId) {
        const alvo = inimigos.find(i => i.id === alvoId);
        if (!alvo || alvo.hp <= 0) return;

        setFase('inimigo')
        setAcaoPendente(null)

        const persona = megatenService.getPersonaByName(aliadoAtual.personaEquipada)
        const sorte = persona?.stats?.lu || 5
        const chanceCrit = 0.05 + (Math.min(sorte, 99) / 99) * 0.20
        const isCrit = Math.random() < chanceCrit
        const isWeakness = alvo.fraqueza === 'Phys'
        let hitOneMore = false

        if (isCrit || isWeakness) {
            if (!alvo.isDown) hitOneMore = true
        }

        let dano = Math.max(1, 18 + Math.floor(Math.random() * 12) - 6)
        if (isCrit) dano = Math.floor(dano * 1.5)
        if (isWeakness) dano = Math.floor(dano * 1.5)

        const critMsg = isCrit ? " CRITICAL HIT!" : (isWeakness ? " WEAKNESS!" : "")
        dispararLog(`${aliadoAtual.nome} atacou ${alvo.nome} por ${dano} de dano!${critMsg}`)
        setAnimandoId(alvo.id)

        setTimeout(() => {
            setAnimandoId(null)
            const novosInimigos = inimigos.map(i =>
                i.id === alvo.id ? { ...i, hp: Math.max(0, i.hp - dano), isDown: i.isDown || isCrit || isWeakness } : i
            )
            setInimigos(novosInimigos)

            const fim = verificarFim(aliados, novosInimigos)
            if (!fim) {
                setFase('jogador')
                posAcaoJogador(aliados, novosInimigos, hitOneMore)
            }
        }, 500)
    }

    function executarSkillSingle(alvoId, tipoAlvo, acao) {
        const { skill, efeito, custoSP, custoHP } = acao;

        // Aplica o custo da skill ao usuário
        setAliados(prev => prev.map(a =>
            a.id === aliadoAtual.id 
                ? { ...a, sp: Math.max(0, a.sp - custoSP), hp: Math.max(1, a.hp - custoHP) }
                : a
        ));

        setAcaoPendente(null);
        setFase('inimigo');

        if (tipoAlvo === 'aliado') {
             const alvo = aliados.find(a => a.id === alvoId);
             if (efeito.tipoAcao === 'cura') {
                  const amount = efeito.power === -50 ? Math.floor(alvo.hpMax * 0.5) : efeito.power;
                  dispararLog(`${aliadoAtual.nome} usou ${skill.name} em ${alvo.nome}! Recuperou HP.`);
                  
                  setTimeout(() => {
                      setAliados(prev => {
                          const curados = prev.map(a => 
                              a.id === alvo.id ? { ...a, hp: Math.min(a.hpMax, a.hp + amount) } : a
                          );
                          setFase('jogador');
                          posAcaoJogador(curados, inimigos);
                          return curados;
                      });
                  }, 600);
             } else {
                  dispararLog(`${aliadoAtual.nome} usou ${skill.name} em ${alvo.nome}! (${skill.description})`);
                  setTimeout(() => {
                      setFase('jogador');
                      posAcaoJogador(aliados, inimigos);
                  }, 600);
             }
        } else {
             const alvo = inimigos.find(i => i.id === alvoId);
             
             if (efeito.tipoAcao === 'debuff') {
                 dispararLog(`${aliadoAtual.nome} usou ${skill.name} em ${alvo.nome}! (${skill.description})`);
                 setAnimandoId(alvo.id);
                 setTimeout(() => {
                     setAnimandoId(null);
                     setFase('jogador');
                     posAcaoJogador(aliados, inimigos);
                 }, 800);
             } else {
                 const variacao = 0.85 + (Math.random() * 0.3);
                 let danoReal = Math.floor(efeito.power * variacao);
                 
                 const isFisico = skill.affinity === 'Phys' || skill.affinity === 'Gun';
                 let critMsg = "";
                 let isCrit = false;
                 if (isFisico) {
                     const persona = megatenService.getPersonaByName(aliadoAtual.personaEquipada);
                     const sorte = persona?.stats?.lu || 5;
                     const chanceCrit = 0.05 + (Math.min(sorte, 99) / 99) * 0.20;
                     if (Math.random() < chanceCrit) {
                         danoReal = Math.floor(danoReal * 1.5);
                         critMsg = " CRITICAL HIT!";
                         isCrit = true;
                     }
                 }
                 
                 const isWeakness = skill.affinity === alvo.fraqueza;
                 if (isWeakness) {
                     danoReal = Math.floor(danoReal * 1.5);
                     if (!critMsg) critMsg = " WEAKNESS!";
                 }
                 
                 let hitOneMore = false;
                 if (isCrit || isWeakness) {
                     if (!alvo.isDown) hitOneMore = true;
                 }
                 
                 dispararLog(`${aliadoAtual.nome} usou ${skill.name} em ${alvo.nome} por ${danoReal} de dano!${critMsg}`);
                 setAnimandoId(alvo.id);
                 
                 setTimeout(() => {
                     setAnimandoId(null);
                     const novosInimigos = inimigos.map(i =>
                         i.id === alvo.id ? { ...i, hp: Math.max(0, i.hp - danoReal), isDown: i.isDown || isCrit || isWeakness } : i
                     );
                     setInimigos(novosInimigos);
                     const fim = verificarFim(aliados, novosInimigos);
                     if (!fim) {
                         setFase('jogador');
                         posAcaoJogador(aliados, novosInimigos, hitOneMore);
                     }
                 }, 800);
             }
        }
    }

    function executarSkillMulti(skill, efeito, custoSP, custoHP) {
        setAliados(prev => prev.map(a =>
            a.id === aliadoAtual.id 
                ? { ...a, sp: Math.max(0, a.sp - custoSP), hp: Math.max(1, a.hp - custoHP) }
                : a
        ));
        setFase('inimigo');
        
        if (efeito.tipoAcao === 'cura' || efeito.tipoAcao === 'suporte') {
            dispararLog(`${aliadoAtual.nome} usou ${skill.name}! A equipe foi afetada!`);
            setTimeout(() => {
                setAliados(prev => {
                    const curados = prev.map(a => {
                        if (a.hp <= 0) return a;
                        if (efeito.tipoAcao === 'cura') {
                            const amount = efeito.power === -50 ? Math.floor(a.hpMax * 0.5) : efeito.power;
                            return { ...a, hp: Math.min(a.hpMax, a.hp + amount) };
                        }
                        return a;
                    });
                    setFase('jogador');
                    posAcaoJogador(curados, inimigos);
                    return curados;
                });
            }, 600);
        } else {
            const vivos = inimigos.filter(i => i.hp > 0);
            if (vivos.length === 0) {
                 setFase('jogador');
                 posAcaoJogador(aliados, inimigos);
                 return;
            }
            dispararLog(`${aliadoAtual.nome} usou ${skill.name}!`);
            vivos.forEach(a => setAnimandoId(prev => a.id));
            
            setTimeout(() => {
                setAnimandoId(null);
                let novosInimigos = [...inimigos];
                let hitOneMoreMulti = false;
                vivos.forEach(alvo => {
                    if (efeito.tipoAcao === 'debuff') {
                        dispararLog(`${skill.name} afetou ${alvo.nome}!`);
                    } else {
                        const variacao = 0.85 + (Math.random() * 0.3);
                        let danoReal = Math.floor(efeito.power * variacao);
                        
                        const isFisico = skill.affinity === 'Phys' || skill.affinity === 'Gun';
                        let critMsg = "";
                        let isCrit = false;
                        if (isFisico) {
                            const persona = megatenService.getPersonaByName(aliadoAtual.personaEquipada);
                            const sorte = persona?.stats?.lu || 5;
                            const chanceCrit = 0.05 + (Math.min(sorte, 99) / 99) * 0.20;
                            if (Math.random() < chanceCrit) {
                                danoReal = Math.floor(danoReal * 1.5);
                                critMsg = " CRÍTICO!";
                                isCrit = true;
                            }
                        }
                        
                        const isWeakness = skill.affinity === alvo.fraqueza;
                        if (isWeakness) {
                            danoReal = Math.floor(danoReal * 1.5);
                            if (!critMsg) critMsg = " WEAKNESS!";
                        }
                        
                        if (isCrit || isWeakness) {
                            if (!alvo.isDown) hitOneMoreMulti = true;
                        }
                        
                        novosInimigos = novosInimigos.map(i =>
                            i.id === alvo.id ? { ...i, hp: Math.max(0, i.hp - danoReal), isDown: i.isDown || isCrit || isWeakness } : i
                        );
                        dispararLog(`${skill.name} causou ${danoReal} de dano a ${alvo.nome}!${critMsg}`);
                    }
                });
                setInimigos(novosInimigos);
                const fim = verificarFim(aliados, novosInimigos);
                if (!fim) {
                     setFase('jogador');
                     posAcaoJogador(aliados, novosInimigos, hitOneMoreMulti);
                }
            }, 800);
        }
    }

    // ── AÇÃO: Fugir (50% de chance) ──
    function handleFugir() {
        if (fase !== 'jogador') return
        if (Math.random() < 0.5) {
            dispararLog('Fugiu com sucesso!')
            setTimeout(() => navigate('/dungeon', { state: { caminho } }), 1200)
        } else {
            dispararLog('Tentou fugir... Mas falhou!')
            turnoInimigo(aliados, inimigos)
        }
    }

    // ── Finalizar combate: sync contexto e navegar ──
    function finalizarCombate() {
        if (resultado === 'vitoria') {
            // Sincroniza HP/SP de volta ao contexto global
            atualizarEquipeAposCombate(aliados.map(a => ({ id: a.id, hp: a.hp, sp: a.sp })))
            ganharYen(recompensa.yen)

            if (tipoInimigo === 'BOSS') {
                avancarSegmento()
                navigate('/hub', { state: { caminho } })
                return
            }
        }
        
        // Retorna para a dungeon para continuar (seja fuga ou vitória comum)
        navigate('/dungeon', { state: { caminho } })
    }

    // ─────────────────────────────────────────────
    return (
        <div id="tela-combate">

            {/* LOG DE NOTIFICAÇÃO */}
            {log && (
                <div key={log} className="combate-log mostrar">
                    {log}
                </div>
            )}

            {/* HEADER */}
            <header className="combate-header">
                <div className="combate-turno-indicador">
                    {fase === 'inimigo'
                        ? <>TURNO: <span>INIMIGO</span></>
                        : resultado
                            ? <>TURNO: <span>{resultado === 'vitoria' ? 'VITÓRIA' : 'DERROTA'}</span></>
                            : <>TURNO: <span>{aliadoAtual?.nome?.toUpperCase()}</span></>
                    }
                </div>
            </header>

            {/* CAMPO */}
            <main className="combate-campo">
                {/* INIMIGOS NO CENTRO */}
                <div className="combate-inimigos">
                    {inimigos.map((inimigo) => {
                        const isMorto = inimigo.hp <= 0
                        const isSelecaoAlvo = fase === 'selecao_alvo'
                        const isAtaque = isSelecaoAlvo && (!acaoPendente?.efeito || acaoPendente.efeito.tipoAcao === 'dano' || acaoPendente.efeito.tipoAcao === 'debuff')
                        const clicavel = isAtaque && !isMorto && !resultado

                        return (
                            <div
                                key={inimigo.id}
                                className={`combate-inimigo-card ${isMorto ? 'combate-inimigo-card--morto' : ''} ${clicavel ? 'combate-inimigo-card--clicavel' : ''}`}
                                onClick={() => clicavel && handleAlvoClick(inimigo.id, 'inimigo')}
                                title={clicavel ? 'Clique para selecionar' : ''}
                            >
                                {inimigo.img && (
                                    <img src={inimigo.img} alt={inimigo.nome} className="combate-inimigo-img" />
                                )}
                                <div className="combate-inimigo-info">
                                    <div className="combate-inimigo-nome">
                                        {inimigo.icone} {inimigo.nome} {inimigo.isDown && <span style={{color: '#f1c40f', fontSize: '0.8em', marginLeft: '4px'}}>[DOWN]</span>}
                                    </div>
                                    <div className="combate-inimigo-hp">
                                        <div
                                            className="combate-inimigo-hp-fill"
                                            style={{ width: `${(inimigo.hp / inimigo.hpMax) * 100}%` }}
                                        />
                                    </div>
                                    <div className="combate-inimigo-hp-texto">
                                        {inimigo.hp} / {inimigo.hpMax}
                                    </div>
                                </div>
                                <div className={`combate-efeito-ataque ${animandoId === inimigo.id ? 'animar' : ''}`} />
                            </div>
                        )
                    })}
                </div>
            </main>

            {/* ALIADOS (BASEADO EM ETRIAN ODYSSEY - ACIMA DOS BOTÕES) */}
            <div className="combate-aliados-horiz">
                {aliados.map((aliado, index) => {
                    const isAtivo   = index === turnoIndex && fase === 'jogador' && !resultado
                    const isKO      = aliado.hp <= 0
                    const jaAgiuEle = jaAgiu.has(aliado.id)
                    const isSelecaoAlvo = fase === 'selecao_alvo'
                    const isCura = isSelecaoAlvo && acaoPendente?.efeito && (acaoPendente.efeito.tipoAcao === 'cura' || acaoPendente.efeito.tipoAcao === 'suporte')
                    
                    const clicavelParaAgir = fase === 'jogador' && !isKO && !jaAgiuEle && !resultado
                    const clicavelParaCura = isSelecaoAlvo && isCura && !isKO && !resultado
                    const clicavel = clicavelParaAgir || clicavelParaCura

                    return (
                        <div
                            key={aliado.id}
                            className={[
                                'combate-aliado-card-horiz',
                                isAtivo   ? 'combate-aliado-card-horiz--ativo'    : '',
                                isKO      ? 'combate-aliado-card-horiz--ko'        : '',
                                jaAgiuEle ? 'combate-aliado-card-horiz--agiu'      : '',
                                clicavel  ? 'combate-aliado-card-horiz--clicavel'  : '',
                                aliado.id === aliadoAtacadoId ? 'combate-aliado-card-horiz--hit' : '',
                            ].join(' ')}
                            onClick={() => handleSelecionarMembro(index)}
                            title={isKO ? 'K.O.' : clicavelParaCura ? 'Clique para curar/buffar' : jaAgiuEle ? 'Já agiu nesta rodada' : 'Clique para controlar'}
                        >
                            {jaAgiuEle && !isKO && (
                                <div className="combate-agiu-badge">✓</div>
                            )}
                            <div className="combate-aliado-nome">
                                <span>{aliado.nome}</span>
                                <span className="combate-aliado-icone">{aliado.icone}</span>
                            </div>
                            {isKO && (
                                <div className="combate-ko-badge">K.O.</div>
                            )}
                            <div className="combate-barras">
                                <div className="combate-barra-container">
                                    <span className="combate-barra-label">HP</span>
                                    <div className="combate-barra-bg">
                                        <div
                                            className="combate-barra-fill combate-barra-fill--hp"
                                            style={{ width: `${(toNum(aliado.hp) / (toNum(aliado.hpMax) || 1)) * 100}%` }}
                                        />
                                    </div>
                                    <span className="combate-barra-valor">{toNum(aliado.hp)}/{toNum(aliado.hpMax)}</span>
                                </div>
                                <div className="combate-barra-container">
                                    <span className="combate-barra-label">SP</span>
                                    <div className="combate-barra-bg">
                                        <div
                                            className="combate-barra-fill combate-barra-fill--sp"
                                            style={{ width: `${(toNum(aliado.sp) / (toNum(aliado.spMax) || 1)) * 100}%` }}
                                        />
                                    </div>
                                    <span className="combate-barra-valor">{toNum(aliado.sp)}/{toNum(aliado.spMax)}</span>
                                </div>
                            </div>
                            {aliado.personaEquipada && (
                                <div className="combate-persona-tag">
                                    ♦ {aliado.personaEquipada}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* AÇÕES / SKILLS */}
            <footer className="combate-acoes">
                {menuAberto ? (
                    <div className="combate-menu-skills">
                        <div className="combate-menu-skills-header">
                            <h3>{aliadoAtual.personaEquipada} — Skills</h3>
                            <button className="combate-btn-voltar" onClick={() => setMenuAberto(false)}>Voltar</button>
                        </div>
                        <div className="combate-skills-lista">
                            {aliadoAtual.skills?.map(skill => {
                                const statCusto = getStatCustoSkill(skill)
                                const valorCusto = getCustoSkill(skill)
                                const custoTexto = statCusto === 'HP'
                                    ? `${valorCusto}% HP`
                                    : `${valorCusto || 5} SP`
                                return (
                                    <button 
                                        key={skill.name} 
                                        className="combate-skill-item"
                                        onClick={() => handleUsarSkill(skill)}
                                    >
                                        <div className="combate-skill-info">
                                            <span className="combate-skill-nome">{skill.name}</span>
                                            <span className="combate-skill-tipo">{skill.affinity}</span>
                                        </div>
                                        <div className="combate-skill-detalhes">
                                            <span className="combate-skill-custo">{custoTexto}</span>
                                            <span className="combate-skill-desc">{skill.description}</span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ) : fase === 'selecao_alvo' ? (
                    <div className="combate-menu-selecao">
                        <p style={{ color: '#E3EAFF', fontFamily: 'Rajdhani', margin: '0 0 1rem 0' }}>Selecione um alvo no campo de batalha.</p>
                        <button className="combate-btn-acao" onClick={handleCancelarAcao} style={{ borderColor: '#E74C3C', color: '#E74C3C' }}>
                            CANCELAR
                        </button>
                    </div>
                ) : (
                    <>
                        <button
                            className="combate-btn-acao"
                            onClick={handleAtaque}
                            disabled={fase !== 'jogador' || !!resultado}
                        >
                            ATAQUE
                        </button>
                        <button
                            className="combate-btn-acao"
                            onClick={handleAbrirSkills}
                            disabled={fase !== 'jogador' || !!resultado || !aliadoAtual?.skills?.length}
                        >
                            SKILL
                        </button>
                        <button className="combate-btn-acao" disabled={true}>ITEM</button>
                        <button className="combate-btn-acao" disabled={true}>PERSONA</button>
                        <button
                            className="combate-btn-acao"
                            onClick={handleFugir}
                            disabled={fase !== 'jogador' || !!resultado}
                        >
                            FUGIR
                        </button>
                    </>
                )}
            </footer>

            {/* RESULTADO */}
            {resultado && (
                <div className={`combate-vitoria-overlay ${resultado === 'derrota' ? 'combate-derrota-overlay' : ''}`}>
                    {resultado === 'vitoria' ? (
                        <>
                            <h1 className="combate-vitoria-titulo">ALL OUT ATTACK!</h1>
                            <p className="combate-vitoria-dados">
                                + {recompensa.exp} EXP &nbsp;|&nbsp; + ¥{recompensa.yen.toLocaleString('pt-BR')}
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="combate-vitoria-titulo combate-derrota-titulo">GAME OVER</h1>
                            <p className="combate-vitoria-dados" style={{ color: '#E74C3C' }}>
                                Toda a equipe foi derrotada...
                            </p>
                        </>
                    )}
                    <button className="combate-vitoria-btn" onClick={finalizarCombate}>
                        RETORNAR AO MAPA
                    </button>
                </div>
            )}

        </div>
    )
}

export default Combate
