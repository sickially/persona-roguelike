import './inicio.css'

function Inicio() {
    return ( 
        <div>

            <h1> Persona: Roguelike </h1>
            <p>Escolha seu caminho:</p>

            <div className="caminhos">
            <img src="https://placehold.co/250x250?text=Mortality" />
            <img src="https://placehold.co/250x250?text=Truth" />
            <a href="/teste"><img src="https://placehold.co/250x250?text=Rebellion" /></a>  
            </div>

            <br/><br/><br/><br/><br/><br/>
            <button>Jogar</button>
        </div>
     );
}

export default Inicio;