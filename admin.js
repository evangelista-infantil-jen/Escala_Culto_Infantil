import { db } from "./firebase.js";

import {

collection,

getDocs

} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const lista = document.getElementById("listaParticipantes");

const totalPessoas = document.getElementById("totalPessoas");

const totalDias = document.getElementById("totalDias");

const selects = document.querySelectorAll(".domingo select");

async function carregarParticipantes(){

    lista.innerHTML="";

    let quantidadePessoas=0;

    let quantidadeDias=0;

    const querySnapshot = await getDocs(collection(db,"disponibilidades"));

    const participantes=[];

    querySnapshot.forEach((doc)=>{

        participantes.push(doc.data());

    });

    quantidadePessoas = participantes.length;

    participantes.forEach(participante=>{

        quantidadeDias += participante.dias.length;

        const div=document.createElement("div");

        div.className="participante";

        let html=`<h3>👤 ${participante.nome}</h3>`;

        participante.dias.forEach(dia=>{

            html += `<span class="tag">${dia}</span>`;

        });

        div.innerHTML=html;

        lista.appendChild(div);

    });

    totalPessoas.innerText=quantidadePessoas;

    totalDias.innerText=quantidadeDias;

    preencherSelects(participantes);

}

function preencherSelects(participantes){

    selects.forEach(select=>{

        select.innerHTML="<option>Selecionar...</option>";

        participantes.forEach(pessoa=>{

            const option=document.createElement("option");

            option.value=pessoa.nome;

            option.innerText=pessoa.nome;

            select.appendChild(option);

        });

    });

}

document.getElementById("salvarEscala").addEventListener("click",()=>{

    alert("Em breve iremos salvar a escala.");

});

carregarParticipantes();
