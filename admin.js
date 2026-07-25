import { db } from "./firebase.js";

import {

collection,

onSnapshot

}

from

"https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const lista = document.getElementById("listaParticipantes");

const totalPessoas = document.getElementById("totalPessoas");

const totalDias = document.getElementById("totalDias");

const selects = document.querySelectorAll(".domingo select");

onSnapshot(

collection(db,"disponibilidades"),

(snapshot)=>{

    lista.innerHTML="";

    let participantes=[];

    let qtdDias=0;

    snapshot.forEach(doc=>{

        participantes.push(doc.data());

    });

    totalPessoas.innerText=participantes.length;

    participantes.forEach(pessoa=>{

        const dias=pessoa.dias || [];

        qtdDias += dias.length;

        const div=document.createElement("div");

        div.className="participante";

        div.innerHTML=`

        <h3>👤 ${pessoa.nome}</h3>

        ${dias.map(d=>`<span class="tag">${d}</span>`).join("")}

        `;

        lista.appendChild(div);

    });

    totalDias.innerText=qtdDias;

    preencherSelects(participantes);

}

);

function preencherSelects(participantes){

    selects.forEach(select=>{

        select.innerHTML="<option>Selecionar...</option>";

        participantes.forEach(p=>{

            const option=document.createElement("option");

            option.value=p.nome;

            option.innerText=p.nome;

            select.appendChild(option);

        });

    });

}
