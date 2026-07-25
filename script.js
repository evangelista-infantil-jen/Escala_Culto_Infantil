import { db } from "./firebase.js";

import {
    collection,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const diasSelecionados = [];

const botoesDias = document.querySelectorAll(".dia");

const botaoSalvar = document.getElementById("salvar");

const campoNome = document.getElementById("nome");

const campoMes = document.getElementById("mes");

botoesDias.forEach(botao => {

    botao.addEventListener("click", () => {

        const dia = botao.innerText;

        if (diasSelecionados.includes(dia)) {

            diasSelecionados.splice(
                diasSelecionados.indexOf(dia),
                1
            );

            botao.classList.remove("ativo");

        } else {

            diasSelecionados.push(dia);

            botao.classList.add("ativo");

        }

    });

});

botaoSalvar.addEventListener("click", async () => {

    const nome = campoNome.value.trim();

    if (!nome) {

        alert("Digite seu nome.");

        return;

    }

    if (diasSelecionados.length == 0) {

        alert("Escolha pelo menos um dia.");

        return;

    }

    const idDocumento = `${campoMes.value}_${nome}`
        .replaceAll(" ", "_")
        .toLowerCase();

    try {

        await setDoc(
            doc(db, "disponibilidades", idDocumento),
            {

                nome,

                mes: campoMes.value,

                dias: diasSelecionados.sort(),

                atualizadoEm: serverTimestamp()

            }
        );

        alert("Disponibilidade salva com sucesso!");

        campoNome.value = "";

        diasSelecionados.length = 0;

        botoesDias.forEach(botao => {

            botao.classList.remove("ativo");

        });

    }

    catch (erro) {

        console.error(erro);

        alert("Erro ao salvar.");

    }

});
