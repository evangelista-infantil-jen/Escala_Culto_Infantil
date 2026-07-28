import { db } from "./firebase.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    setDoc,
    documentId
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

    // Disponibilidades do mês
    const q = query(
        collection(db, "disponibilidades"),
        where("mes", "==", mesAdmin.value)
    );

    const snapshotDisponibilidades = await getDocs(q);

    // Todos os voluntários
    const snapshotVoluntarios = await getDocs(
        collection(db, "voluntarios")
    );

    // Cria um mapa por nome
    const voluntarios = {};

    snapshotVoluntarios.forEach(doc => {

        const dados = doc.data();

        voluntarios[dados.nome] = dados;

    });

    // Junta disponibilidade + cadastro
    snapshotDisponibilidades.forEach(doc => {

        const disponibilidade = doc.data();

        const cadastro = voluntarios[disponibilidade.nome];

        if (!cadastro) return;

        participantes.push({

            nome: disponibilidade.nome,

            dias: disponibilidade.dias,

            funcao: cadastro.funcao,

            faixa: cadastro.faixa,

            ativo: cadastro.ativo

        });

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

        // ==========================
// EVANGELISTA
// ==========================

const candidatosEvangelista = disponiveis.filter(p => {

    // Quinta → somente Evangelista ou Ambos Adulto
    if (!ehDomingo) {

        return (
            (p.funcao === "Evangelista" || p.funcao === "Ambos") &&
            p.faixa === "Adulto"
        );

    }

    // Domingo → Evangelista ou Ambos
    return (
        p.funcao === "Evangelista" ||
        p.funcao === "Ambos"
    );

});

candidatosEvangelista.forEach(pessoa => {

    evangelista.innerHTML +=
        `<option value="${pessoa.nome}">${pessoa.nome}</option>`;

});

// ==========================
// AUXILIAR
// ==========================

if (auxiliar) {

    const candidatosAuxiliar = disponiveis.filter(p =>

        p.funcao === "Auxiliar" ||
        p.funcao === "Ambos"

    );

    candidatosAuxiliar.forEach(pessoa => {

        auxiliar.innerHTML +=
            `<option value="${pessoa.nome}">${pessoa.nome}</option>`;

    });

    // Se trocar a evangelista...
    evangelista.addEventListener("change", () => {

        auxiliar.innerHTML =
            `<option value="">Selecionar...</option>`;

        const evangelistaEscolhida = participantes.find(p =>
            p.nome === evangelista.value
        );

        let lista = candidatosAuxiliar;

        // Evangelista Junior → Auxiliar Adulto
        if (
            evangelistaEscolhida &&
            evangelistaEscolhida.faixa === "Junior"
        ) {

            lista = candidatosAuxiliar.filter(p =>
                p.faixa === "Adulto"
            );

        }

        // Não deixar escolher a mesma pessoa
        lista = lista.filter(p =>
            p.nome !== evangelista.value
        );

        lista.forEach(pessoa => {

            auxiliar.innerHTML +=
                `<option value="${pessoa.nome}">${pessoa.nome}</option>`;

        });

    });

}

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

        Swal.fire({
            icon: "warning",
            title: "Escala inválida",
            text: "A mesma pessoa não pode ocupar os dois cargos no mesmo culto.",
            confirmButtonColor: "#dbaefc"
        });

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

        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Escala salva com sucesso!",
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true
        });
        atualizarResumoEscalas();
        carregarEscala();

    }

    catch (erro) {

        console.error(erro);

        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Ocorreu um erro ao salvar a escala.\nTente Novamente mais tarde, ou contate a Tia Jen S2",
            confirmButtonColor: "#dbaefc"
        });

    }

});

// ========================================
// GERAR SUGESTÃO AUTOMÁTICA
// ========================================

btnSugestao.addEventListener("click", gerarSugestao);

function gerarSugestao() {

    const contador = {};
    const evangelizouDomingo = {};
    const ultimoCulto = {};

    participantes.forEach(p => {

        contador[p.nome] = 0;
        evangelizouDomingo[p.nome] = false;
        ultimoCulto[p.nome] = -99;

    });

    const cultos = [...document.querySelectorAll(".domingo")];

    // ===================================
    // PRIORIZA CULTOS COM MENOS OPÇÕES
    // ===================================

    cultos.sort((a, b) => {

        const diaA = a.querySelector("h3").innerText.match(/\d+/)[0];
        const diaB = b.querySelector("h3").innerText.match(/\d+/)[0];

        const quintaA = a.querySelector("h3").innerText.includes("Quinta");
        const quintaB = b.querySelector("h3").innerText.includes("Quinta");

        const dispA = participantes.filter(p =>
            p.ativo &&
            p.dias.includes(diaA)
        );

        const dispB = participantes.filter(p =>
            p.ativo &&
            p.dias.includes(diaB)
        );

        const evA = dispA.filter(p =>
            (p.funcao == "Evangelista" || p.funcao == "Ambos") &&
            (quintaA ? p.faixa == "Adulto" : true)
        );

        const evB = dispB.filter(p =>
            (p.funcao == "Evangelista" || p.funcao == "Ambos") &&
            (quintaB ? p.faixa == "Adulto" : true)
        );

        if (evA.length != evB.length)
            return evA.length - evB.length;

        return dispA.length - dispB.length;

    });

    cultos.forEach((card, indiceCulto) => {

        const titulo = card.querySelector("h3").innerText;

        const dia = titulo.match(/\d+/)[0];

        const ehQuinta = titulo.includes("Quinta");

        let disponiveis = participantes.filter(p =>
            p.ativo &&
            p.dias.includes(dia)
        );

        function descanso(lista){

            let livres = lista.filter(p =>
                indiceCulto - ultimoCulto[p.nome] > 2
            );

            if(livres.length == 0)
                livres = lista;

            return livres;

        }

        function ordenar(lista){

            return lista.sort((a,b)=>{

                // Nunca evangelizou no domingo
                if(evangelizouDomingo[a.nome] != evangelizouDomingo[b.nome])
                    return evangelizouDomingo[a.nome] - evangelizouDomingo[b.nome];

                // Menos dias disponíveis
                if(a.dias.length != b.dias.length)
                    return a.dias.length - b.dias.length;

                // Menos escalas
                if(contador[a.nome] != contador[b.nome])
                    return contador[a.nome] - contador[b.nome];

                return a.nome.localeCompare(b.nome);

            });

        }

        const selectEvangelista = card.querySelector(".evangelista");
        const selectAuxiliar = card.querySelector(".auxiliar");

        // ===================================
        // QUINTA
        // ===================================

        if(ehQuinta){

            let candidatos = disponiveis.filter(p=>

                (p.funcao=="Evangelista" ||
                 p.funcao=="Ambos")

                &&

                p.faixa=="Adulto"

            );

            candidatos = ordenar(descanso(candidatos));

            if(candidatos.length){

                selectEvangelista.value = candidatos[0].nome;

                contador[candidatos[0].nome]++;

                ultimoCulto[candidatos[0].nome] = indiceCulto;

            }

            return;

        }

        // ===================================
        // DOMINGO - EVANGELISTA
        // ===================================

        let evangelistas = disponiveis.filter(p=>

            (p.funcao=="Evangelista" ||
             p.funcao=="Ambos")

            &&

            !evangelizouDomingo[p.nome]

        );

        if(evangelistas.length==0){

            evangelistas = disponiveis.filter(p=>

                p.funcao=="Evangelista" ||
                p.funcao=="Ambos"

            );

        }

        evangelistas = ordenar(descanso(evangelistas));

        if(!evangelistas.length)
            return;

        const escolhido = evangelistas[0];

        selectEvangelista.value = escolhido.nome;

        contador[escolhido.nome]++;

        ultimoCulto[escolhido.nome] = indiceCulto;

        evangelizouDomingo[escolhido.nome] = true;

        // ===================================
        // DOMINGO - AUXILIAR
        // ===================================

        let auxiliares;

        if(escolhido.faixa=="Junior"){

            auxiliares = disponiveis.filter(p=>

                p.nome != escolhido.nome &&

                (p.funcao=="Auxiliar" ||
                 p.funcao=="Ambos")

                &&

                p.faixa=="Adulto"

            );

        }

        else{

            auxiliares = disponiveis.filter(p=>

                p.nome != escolhido.nome &&

                (p.funcao=="Auxiliar" ||
                 p.funcao=="Ambos")

            );

        }

        // Quem já evangelizou domingo vira prioridade como auxiliar
        let prioridade = auxiliares.filter(p =>
            evangelizouDomingo[p.nome]
        );

        if(prioridade.length){

            auxiliares = prioridade;

        }

        auxiliares = ordenar(descanso(auxiliares));

        if(auxiliares.length){

            selectAuxiliar.value = auxiliares[0].nome;

            contador[auxiliares[0].nome]++;

            ultimoCulto[auxiliares[0].nome] = indiceCulto;

        }

    });

    atualizarResumoEscalas();

    Swal.fire({
        toast:true,
        position:"top-end",
        icon:"success",
        title:"Sugestão gerada!",
        text:"Revise a escala antes de salvar.",
        showConfirmButton:false,
        timer:2500,
        timerProgressBar:true
    });

}
// ========================================
// EXPORTAR COMO IMAGEM
// ========================================

btnExportar.addEventListener("click", async () => {
    const card = document.createElement("div");
    card.id = "cardExportacao";
    const titulo = mesesTexto[parseInt(mesAdmin.value.split("-")[1]) - 1];

    const cultos = Array.from(document.querySelectorAll(".domingo"));

    const quantidade = cultos.length;

    let primeiraLinha = 4;

    if (quantidade == 9 || quantidade == 10)
        primeiraLinha = 5;

    const segundaLinha = quantidade - primeiraLinha;

    const classeCard =
        primeiraLinha == 5
            ? "cardPequeno"
            : "cardGrande";

    let html = `

<div class="cabecalhoEscala">

    <div class="logoArea">
        <img src="IEQLogo.png" class="logoExportacao" style="width: 75%; height: 75%;">
    </div>

    <div class="tituloArea">
        <h1>Escala do Culto Infantil</h1>
        <div class="faixaMes">
            ${titulo.toUpperCase()} • ${mesAdmin.value.split("-")[0]}
        </div>
    </div>

    <div class="textoArea">
        Qualquer dúvida ou alteração, entre em contato!
        <br>
        <img src="Evan.png" class="logoExportacao" style="width: 16%; height: 16%;"> = Evangelista 
        <br>
        <img src="Auxi.png" class="logoExportacao" style="width: 16%; height: 16%;"> = Auxiliar
    </div>

</div>

<div class="gradeEscala">
<div class="linhaExportacao">

`;

    cultos.slice(0, primeiraLinha).forEach(culto => {

        const tituloCulto = culto.querySelector("h3").innerText;

        const evangelista =
            culto.querySelector(".evangelista").value || "______";

        const aux =
            culto.querySelector(".auxiliar");

        const domingo =
            aux != null;

        html += `

<div class="cardCulto ${classeCard} ${domingo ? "domingoCard" : "quintaCard"}">

    <div class="tituloCulto">

        ${tituloCulto}

    </div>

    <div class="conteudoCulto">

        <div class="linhaPessoa">
            <img src="Evan.png" class="logoExportacao" style="width: 16%; height: 16%;"> ${evangelista}
        </div>

        ${aux ? `

        <div class="linhaPessoa">
            <img src="Auxi.png" class="logoExportacao" style="width: 16%; height: 16%;"> ${aux.value || "______"}
        </div>

        ` : ""}

    </div>

</div>

`;

    });

    html += `

</div>

<div class="linhaExportacao">

`;

    cultos.slice(primeiraLinha).forEach(culto => {

        const tituloCulto = culto.querySelector("h3").innerText;

        const evangelista =
            culto.querySelector(".evangelista").value || "______";

        const aux =
            culto.querySelector(".auxiliar");

        const domingo =
            aux != null;

        html += `

<div class="cardCulto ${classeCard} ${domingo ? "domingoCard" : "quintaCard"}">

    <div class="tituloCulto">
        ${tituloCulto}
    </div>

    <div class="conteudoCulto">
        <div class="linhaPessoa">
             <img src="Evan.png" class="logoExportacao" style="width: 16%; height: 16%;"> ${evangelista}
        </div>
        ${aux ? `
        <div class="linhaPessoa">
             <img src="Auxi.png" class="logoExportacao" style="width: 16%; height: 16%;"> ${aux.value || "______"}
        </div>
        ` : ""}
    </div>

</div>

`;

    });

    html += `

</div>

</div>

<div class="rodapeEscala">

    <div class="versiculo">
        "Deixem vir a mim as crianças e não as impeçam, pois o reino de Deus pertence aos que são semelhantes a elas"
        <strong>~ Marcos 10:14</strong>
    </div>

    <div class="assinatura">
        💜 Ministério Infantil
    </div>

</div>

`;

    card.innerHTML = html;

    document.body.appendChild(card);

    const canvas = await html2canvas(card, {

        scale: 2,
        backgroundColor: null

    });

    const link = document.createElement("a");

    link.download = `Escala_${mesAdmin.value}.png`;

    link.href = canvas.toDataURL();

    link.click();

    document.body.removeChild(card);

});
