import { Route, Routes } from "react-router-dom";
import Inicio from './pages/Inicio.jsx'
import Teste from './pages/teste.jsx'

function App() {
    return (
        <div>

            <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="/teste" element={<Teste />} />
            </Routes>

        </div>
    );
}

export default App;