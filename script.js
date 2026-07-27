import { db } from "./firebase.js";
import {
    doc,
    setDoc,
    serverTimestamp,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// =======================
// ELEMENTOS
// =======================

const campoNome = document.getElementById("nome");
const campoMes = document.getElementById("mes");
const botaoSalvar = document.getElementById("salvar");
const calendario = document.getElementById("calendario");

// =======================
// DADOS
// =======================

const diasSelecionados = [];

const meses = {
    "Janeiro": 0,
    "Fevereiro": 1,
    "Março": 2,
    "Abril": 3,
    "Maio": 4,
    "Junho": 5,
    "Julho": 6,
    "Agosto": 7,
    "Setembro": 8,
    "Outubro": 9,
    "Novembro": 10,
    "Dezembro": 11
};

// =======================
// CARREGAR VOLUNTÁRIOS
// =======================

async function carregarVoluntarios() {

    campoNome.innerHTML = `
        <option value="">
            Selecione seu nome...
        </option>
    `;

    const snapshot = await getDocs(
        collection(db, "voluntarios")
    );

    const voluntarios = [];

    snapshot.forEach(doc => {

        const pessoa = doc.data();

        if (pessoa.ativo === false) return;

        voluntarios.push(pessoa);

    });

    voluntarios.sort((a, b) =>
        a.nome.localeCompare(b.nome)
    );

    voluntarios.forEach(pessoa => {

        campoNome.innerHTML += `
            <option value="${pessoa.nome}">
                ${pessoa.nome}
            </option>
        `;

    });

}

// =======================
// GERA O CALENDÁRIO
// =======================

function gerarCalendario() {

    calendario.innerHTML = "";

    const diasSemana = [
        "Dom",
        "Seg",
        "Ter",
        "Qua",
        "Qui",
        "Sex",
        "Sáb"
    ];

    diasSemana.forEach(nome => {

        const titulo = document.createElement("div");

        titulo.className = "diaSemana";

        titulo.innerText = nome;

        calendario.appendChild(titulo);

    });

    const ano = new Date().getFullYear();

    const mes = meses[campoMes.value];

    const primeiroDia = new Date(ano, mes, 1);

    const ultimoDia = new Date(ano, mes + 1, 0).getDate();

    for (let i = 0; i < primeiroDia.getDay(); i++) {

        const vazio = document.createElement("div");

        calendario.appendChild(vazio);

    }

    for (let dia = 1; dia <= ultimoDia; dia++) {

        const data = new Date(ano, mes, dia);

        const card = document.createElement("div");

        card.className = "diaCalendario";

        const numero = String(dia).padStart(2, "0");

        card.innerText = numero;

        // Domingos e Quintas
        if (data.getDay() === 0 || data.getDay() === 4) {

            card.classList.add("selecionavel");

            card.addEventListener("click", () => {

                if (diasSelecionados.includes(numero)) {

                    diasSelecionados.splice(
                        diasSelecionados.indexOf(numero),
                        1
                    );

                    card.classList.remove("selecionado");

                } else {

                    diasSelecionados.push(numero);

                    card.classList.add("selecionado");

                }

            });

        } else {

            card.classList.add("desabilitado");

        }

        calendario.appendChild(card);

    }

}

// =======================
// ALTERAR MÊS
// =======================

campoMes.addEventListener("change", () => {

    diasSelecionados.length = 0;

    gerarCalendario();

});

// =======================
// SALVAR NO FIREBASE
// =======================

botaoSalvar.addEventListener("click", async () => {

    const nome = campoNome.value.trim();

    if (nome === "") {

        alert("Digite seu nome.");

        campoNome.focus();

        return;

    }

    if (diasSelecionados.length === 0) {

        alert("Selecione pelo menos um dia disponível.");

        return;

    }

    try {

        const ano = new Date().getFullYear();

        const numeroMes = String(meses[campoMes.value] + 1).padStart(2, "0");

        const idDocumento =
            `${ano}-${numeroMes}_${nome}`
                .replace(/\s+/g, "_")
                .toLowerCase();

        await setDoc(

            doc(db, "disponibilidades", idDocumento),

            {

                nome: nome,

                mes: `${ano}-${numeroMes}`,

                dias: diasSelecionados.sort(),

                atualizadoEm: serverTimestamp()

            }

        );

        alert("✅ Disponibilidade salva com sucesso!");

        campoNome.value = "";

        diasSelecionados.length = 0;

        gerarCalendario();

    }

    catch (erro) {

        console.error(erro);

        alert("Erro ao salvar no Firebase.");

    }

});

// =======================
// INICIAR
// =======================

gerarCalendario();
carregarVoluntarios();
