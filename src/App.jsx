import { Route, Routes } from "react-router-dom";
import Inicio from './pages/Inicio.jsx'
import SelecaoInicial from './pages/SelecaoInicial.jsx'
import Hub from './pages/Hub.jsx'
import Dungeon from './pages/Dungeon.jsx'
import Combate from './pages/Combate.jsx'
import VelvetRoom from './pages/VelvetRoom.jsx'
import Equipe from './pages/Equipe.jsx'
import Inventario from './pages/Inventario.jsx'
import Loja from './pages/Loja.jsx'
import Teste from './pages/teste.jsx'

function App() {
    return (
        <div>

            <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="/selecao-inicial" element={<SelecaoInicial />} />
                <Route path="/hub" element={<Hub />} />
                <Route path="/dungeon" element={<Dungeon />} />
                <Route path="/combate" element={<Combate />} />
                <Route path="/equipe" element={<Equipe />} />
                <Route path="/inventario" element={<Inventario />} />
                <Route path="/velvet-room" element={<VelvetRoom />} />
                <Route path="/loja/:lojista" element={<Loja />} />
                <Route path="/teste" element={<Teste />} />
            </Routes>

        </div>
    );
}

export default App;