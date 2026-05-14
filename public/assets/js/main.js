const form = document.querySelector("#search-form");
const input = document.querySelector("#concurso-input");
const button = document.querySelector("button");
const result = document.querySelector("#result");

function formatDate(dataString) {
    const [year, month, day] = String(dataString).split("T")[0].split("-");
    return `${day}/${month}/${year}`;
}

function formatCurrency(valorString) {
    return Number(valorString).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function setMessage(message) {
    result.innerHTML = `
    <div class="message">${message}</div>
    `;
}


function renderDraw(data) {
    result.innerHTML = `
    <article class="draw">
                    <header class="draw-header">
                        <div>
                            <h2 class="draw-title">Concurso ${data.concurso}</h2>
                            <span class="draw-date">${formatDate(data.data_do_sorteio)}</span>
                        </div>
                        <strong>
                        ${Number(data.ganhadores_6_acertos) == 0 ? "Acumulou" : "Não Acumulou"}</strong>
                    </header>

                    <ul class="balls">
                        <li class="ball">${data.bola1}</li>
                        <li class="ball">${data.bola2}</li>
                        <li class="ball">${data.bola3}</li>
                        <li class="ball">${data.bola4}</li>
                        <li class="ball">${data.bola5}</li>
                        <li class="ball">${data.bola6}</li>
                    </ul>

                    <div class="details">
                        <div class="detail">
                            <strong>6 acertos</strong>
                            ${data.ganhadores_6_acertos} ganhador(es), ${formatCurrency(data.rateio_6_acertos)}
                        </div>

                        <div class="detail">
                            <strong>5 acertos</strong>
                            ${data.ganhadores_5_acertos} ganhador(es), ${formatCurrency(data.rateio_5_acertos)}
                        </div>

                        <div class="detail">
                            <strong>4 acertos</strong>
                            ${data.ganhadores_4_acertos} ganhador(es), ${formatCurrency(data.rateio_4_acertos)}
                        </div>

                        <div class="detail">
                            <strong>Estimativa</strong>
                            ${formatCurrency(data.estimativa_premio)}
                        </div>
                    </div>
                </article>
    `;
}

async function loadConcurso(concurso = "") {
    const endpoint = concurso ? `/api/${concurso}` : "/api";

    button.disabled = true;
    setMessage("Buscando concurso...");

    await delay(50);

    try {
        const response = await fetch(endpoint);
        const data = await response.json();

        if (!response.ok) {
            setMessage(data.message || "Não foi possível carregar o concurso");
            return
        };
        renderDraw(data);
    } catch (error) {
        setMessage("Não foi possível conectar à API");
    } finally {
        button.disabled = false;
    }
}

form.addEventListener("submit", function (event) {
    event.preventDefault();
    loadConcurso(input.value.trim());
});

loadConcurso(); // Carrega o último concurso ao iniciar

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
