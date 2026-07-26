import { db } from "./firebase.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const mesAdmin = document.getElementById("mesAdmin");
const escalaDiv = document.getElementById("escala");
const btnSalvar = document.getElementById("salvarEscala");
const btnExportar = document.getElementById("exportarImagem");
const totalParticipantes = document.getElementById("totalParticipantes");
const totalCultos = document.getElementById("totalCultos");
const cultosMontados = document.getElementById("cultosMontados");
const listaDisponibilidades = document.getElementById("listaDisponibilidades");
const diasSemDisponibilidade = document.getElementById("diasSemDisponibilidade");
const btnSugestao = document.getElementById("gerarSugestao");

let participantes = [];

const mesesTexto = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
];

async function carregarParticipantes() {

    participantes = [];

    const q = query(
        collection(db, "disponibilidades"),
        where("mes", "==", mesAdmin.value)
    );

    const snapshot = await getDocs(q);

    snapshot.forEach(doc => {

        participantes.push(doc.data());

    });

    gerarEscala();

}

function gerarEscala() {

    escalaDiv.innerHTML = "";
    listaDisponibilidades.innerHTML = "";
    diasSemDisponibilidade.innerHTML = "";

    let quantidadeCultos = 0;

    const [ano, mes] = mesAdmin.value.split("-");

    const ultimoDia = new Date(ano, mes, 0).getDate();

    for (let dia = 1; dia <= ultimoDia; dia++) {

        const data = new Date(ano, mes - 1, dia);

        if (data.getDay() !== 0 && data.getDay() !== 4)
            continue;
        quantidadeCultos++;

        const numero = String(dia).padStart(2, "0");

        const disponiveis = participantes.filter(p =>
            p.dias.includes(numero)
        );

        const card = document.createElement("div");

        card.className = "domingo";

        const ehDomingo = data.getDay() === 0;

card.innerHTML = `

<h3>
${ehDomingo ? "🌞 Domingo" : "🌙 Quinta"}
${numero}
</h3>

<label>Evangelista</label>

<select class="evangelista">
    <option value="">Selecionar...</option>
</select>

${ehDomingo ? `
<label>Auxiliar</label>

<select class="auxiliar">
    <option value="">Selecionar...</option>
</select>
` : ""}

`;

        const evangelista = card.querySelector(".evangelista");

        const auxiliar = card.querySelector(".auxiliar");

        disponiveis.forEach(pessoa => {

    evangelista.innerHTML +=
        `<option value="${pessoa.nome}">${pessoa.nome}</option>`;

    if (auxiliar) {

        auxiliar.innerHTML +=
            `<option value="${pessoa.nome}">${pessoa.nome}</option>`;

    }

});

        escalaDiv.appendChild(card);

    }
    
    totalParticipantes.innerText = participantes.length;
    totalCultos.innerText = quantidadeCultos;
    // ===== Lista de participantes =====

participantes
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .forEach(pessoa => {

        const div = document.createElement("div");

        div.className = "participante";

        div.innerHTML = `
            <strong>${pessoa.nome}</strong><br>
            ${pessoa.dias.join(" • ")}
        `;

        listaDisponibilidades.appendChild(div);

    });
    for (let dia = 1; dia <= ultimoDia; dia++) {

    const data = new Date(ano, mes - 1, dia);

    if (data.getDay() !== 0 && data.getDay() !== 4)
        continue;

    const numero = String(dia).padStart(2, "0");

    const disponiveis = participantes.filter(p =>
        p.dias.includes(numero)
    );

    if (disponiveis.length === 0) {

        const p = document.createElement("p");

        p.innerHTML =
            `⚠ ${data.getDay()==0 ? "Domingo" : "Quinta"} ${numero}`;

        diasSemDisponibilidade.appendChild(p);

    }

}

if (diasSemDisponibilidade.innerHTML === "") {

    diasSemDisponibilidade.innerHTML =
        "<p>✅ Todos os cultos possuem pelo menos um voluntário disponível.</p>";

}
    carregarEscala();

}

mesAdmin.addEventListener("change", carregarParticipantes);

carregarParticipantes();

// ========================================
// CARREGAR ESCALA JÁ SALVA
// ========================================

async function carregarEscala() {

    const documento = await getDoc(
        doc(db, "escalas", mesAdmin.value)
    );

    // Limpa os selects antes de carregar
    document.querySelectorAll(".domingo").forEach(card => {

        card.querySelector(".evangelista").value = "";

        const aux = card.querySelector(".auxiliar");

        if (aux) aux.value = "";

    });

    // Se não existir escala salva
    if (!documento.exists()) {

        atualizarResumoEscalas();

        return;

    }

    const dados = documento.data();

    if (dados.eventos) {

        document.querySelectorAll(".domingo").forEach(card => {

            const titulo = card.querySelector("h3").innerText;

            const dia = titulo.match(/\d+/)[0];

            if (!dados.eventos[dia]) return;

            const evangelista = card.querySelector(".evangelista");
            const auxiliar = card.querySelector(".auxiliar");

            evangelista.value = dados.eventos[dia].evangelista || "";

            if (auxiliar) {

                auxiliar.value = dados.eventos[dia].auxiliar || "";

            }

        });

    }

    atualizarResumoEscalas();

}

// ========================================
// ATUALIZA O CARD "ESCALAS PRONTAS"
// ========================================

function atualizarResumoEscalas() {

    let completas = 0;

    const cultos = document.querySelectorAll(".domingo");

    cultos.forEach(card => {

        const evangelista = card.querySelector(".evangelista").value;

        const auxiliar = card.querySelector(".auxiliar");

        // Quinta-feira (não possui auxiliar)
        if (!auxiliar) {

            if (evangelista) completas++;

            return;

        }

        // Domingo (precisa dos dois)
        if (evangelista && auxiliar.value) {

            completas++;

        }

    });

    cultosMontados.innerText = `${completas}/${cultos.length}`;

}
// ========================================
// IMPEDIR PESSOA REPETIDA
// ========================================

document.addEventListener("change", (e) => {

    if (
        !e.target.classList.contains("evangelista") &&
        !e.target.classList.contains("auxiliar")
    ) return;

    const card = e.target.closest(".domingo");

    const evangelista = card.querySelector(".evangelista");
    const auxiliar = card.querySelector(".auxiliar");
    if (!auxiliar) return;

    if (
        evangelista.value &&
        evangelista.value === auxiliar.value
    ) {

        alert("A mesma pessoa não pode ser Evangelista e Auxiliar no mesmo culto.");

        e.target.value = "";

    }

    atualizarResumoEscalas();
});

// ========================================
// SALVAR ESCALA
// ========================================

btnSalvar.addEventListener("click", async () => {

    const eventos = {};

    document.querySelectorAll(".domingo").forEach(card => {

        const titulo = card.querySelector("h3").innerText;

        const dia = titulo.match(/\d+/)[0];

        const evangelista = card.querySelector(".evangelista").value;

        const auxiliarSelect = card.querySelector(".auxiliar");
        const auxiliar = auxiliarSelect ? auxiliarSelect.value : "";

        eventos[dia] = {

            evangelista,
            auxiliar

        };

    });

    try {

        await setDoc(

            doc(db, "escalas", mesAdmin.value),

            {

                mes: mesAdmin.value,

                eventos: eventos,

                atualizadoEm: new Date()

            }

        );

        alert("✅ Escala salva com sucesso!");
        atualizarResumoEscalas();
        carregarEscala();

    }

    catch (erro) {

        console.error(erro);

        alert("Erro ao salvar a escala.");

    }

});

// ========================================
// GERAR SUGESTÃO AUTOMÁTICA
// ========================================

btnSugestao.addEventListener("click", gerarSugestao);

function gerarSugestao() {

    const contador = {};

    participantes.forEach(p => {
        contador[p.nome] = 0;
    });

    document.querySelectorAll(".domingo").forEach(card => {

        const titulo = card.querySelector("h3").innerText;
        const dia = titulo.match(/\d+/)[0];

        // Pessoas disponíveis nesse dia
        let disponiveis = participantes.filter(p => p.dias.includes(dia));

        // Ordena:
        // 1º quem tem menos dias disponíveis no mês
        // 2º quem foi menos escalado até agora
        disponiveis.sort((a, b) => {

            if (a.dias.length !== b.dias.length)
                return a.dias.length - b.dias.length;

            return contador[a.nome] - contador[b.nome];

        });

        const evangelista = card.querySelector(".evangelista");
        const auxiliar = card.querySelector(".auxiliar");

        // Evangelista
        if (disponiveis.length > 0) {

            evangelista.value = disponiveis[0].nome;

            contador[disponiveis[0].nome]++;

        }

        // Auxiliar (apenas domingos)
        if (auxiliar) {

            const restante = disponiveis.filter(p =>
                p.nome !== evangelista.value
            );

            if (restante.length > 0) {

                restante.sort((a, b) =>
                    contador[a.nome] - contador[b.nome]
                );

                auxiliar.value = restante[0].nome;

                contador[restante[0].nome]++;

            }

        }

    });

    alert("✨ Sugestão gerada!\nRevise antes de salvar.");

}

// ========================================
// EXPORTAR COMO IMAGEM
// ========================================

btnExportar.addEventListener("click", async () => {

    const card = document.createElement("div");

    card.id = "cardExportacao";

    const titulo = mesesTexto[parseInt(mesAdmin.value.split("-")[1]) - 1];

    let html = `

    <div class="topo">

        <div class="logo">🌈</div>

        <h1>Escala do Culto Infantil</h1>

        <h2>${titulo.toUpperCase()} • ${mesAdmin.value.split("-")[0]}</h2>

    </div>

    `;

    document.querySelectorAll(".domingo").forEach(culto=>{

        const titulo = culto.querySelector("h3").innerText;

        const evangelista = culto.querySelector(".evangelista").value || "__________";

        const auxSelect = culto.querySelector(".auxiliar");

        html += `

        <div class="cultoExportacao">

            <h3>${titulo}</h3>

            <p>👩 <strong>Evangelista:</strong> ${evangelista}</p>

        `;

        if(auxSelect){

            html += `

            <p>🤝 <strong>Auxiliar:</strong> ${auxSelect.value || "__________"}</p>

            `;

        }

        html += `

        </div>

        `;

    });

    html += `

    <div class="rodapeExportacao">

        💚 Ministério Infantil

    </div>

    `;

    card.innerHTML = html;

    document.body.appendChild(card);

    const canvas = await html2canvas(card,{

        scale:2,

        backgroundColor:null

    });

    const link = document.createElement("a");

    link.download = `Escala_${mesAdmin.value}.png`;

    link.href = canvas.toDataURL();

    link.click();

    document.body.removeChild(card);

});
