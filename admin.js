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

            auxiliar.innerHTML +=
                `<option value="${pessoa.nome}">${pessoa.nome}</option>`;

        });

        escalaDiv.appendChild(card);

    }
    
    totalParticipantes.innerText = participantes.length;
    totalCultos.innerText = quantidadeCultos;
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

    if (!documento.exists()) return;

    const dados = documento.data();

    if (!dados.eventos) return;

    document.querySelectorAll(".domingo").forEach(card => {

        const titulo = card.querySelector("h3").innerText;

        const dia = titulo.match(/\d+/)[0];

        if (!dados.eventos[dia]) return;

        const evangelista = card.querySelector(".evangelista");
        const auxiliar = card.querySelector(".auxiliar");

        evangelista.value = dados.eventos[dia].evangelista || "";
        auxiliar.value = dados.eventos[dia].auxiliar || "";

    });

    let completas = 0;

document.querySelectorAll(".domingo").forEach(card=>{

    const ev =
    card.querySelector(".evangelista").value;

    const au =
    card.querySelector(".auxiliar").value;

    if(ev && au)
        completas++;

});

cultosMontados.innerText =
`${completas}/${document.querySelectorAll(".domingo").length}`;

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

    if (
        evangelista.value &&
        evangelista.value === auxiliar.value
    ) {

        alert("A mesma pessoa não pode ser Evangelista e Auxiliar no mesmo culto.");

        e.target.value = "";

    }

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

        const auxiliar = card.querySelector(".auxiliar").value;

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
        carregarEscala();

    }

    catch (erro) {

        console.error(erro);

        alert("Erro ao salvar a escala.");

    }

});

// ========================================
// EXPORTAR COMO IMAGEM
// ========================================

btnExportar.addEventListener("click", async () => {

    const original = btnExportar.innerText;

    btnExportar.innerText = "Gerando imagem...";

    try {

        const canvas = await html2canvas(escalaDiv, {

            backgroundColor: "#ffffff",

            scale: 2

        });

        const link = document.createElement("a");

        link.download = `Escala_${mesAdmin.value}.png`;

        link.href = canvas.toDataURL("image/png");

        link.click();

    }

    catch (erro) {

        console.error(erro);

        alert("Erro ao gerar imagem.");

    }

    btnExportar.innerText = original;

});
