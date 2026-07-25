// Dias selecionados
const diasSelecionados = [];

// Todos os botões de dias
const botoesDias = document.querySelectorAll(".dia");

// Botão salvar
const botaoSalvar = document.getElementById("salvar");

// Campo nome
const campoNome = document.getElementById("nome");

// Campo mês
const campoMes = document.getElementById("mes");

// Selecionar dias
botoesDias.forEach(botao => {

    botao.addEventListener("click", () => {

        const dia = botao.innerText;

        if (diasSelecionados.includes(dia)) {

            const indice = diasSelecionados.indexOf(dia);

            diasSelecionados.splice(indice, 1);

            botao.classList.remove("ativo");

        } else {

            diasSelecionados.push(dia);

            botao.classList.add("ativo");

        }

    });

});

// Salvar
botaoSalvar.addEventListener("click", () => {

    const nome = campoNome.value.trim();

    if (nome === "") {

        alert("Digite seu nome.");

        campoNome.focus();

        return;

    }

    if (diasSelecionados.length === 0) {

        alert("Selecione pelo menos um domingo.");

        return;

    }

    const disponibilidade = {

        nome: nome,

        mes: campoMes.value,

        dias: diasSelecionados.sort()

    };

    await addDoc(collection(db,"disponibilidades"),{

    nome:nome,

    mes:campoMes.value,

    dias:diasSelecionados,

    criadoEm:new Date()

    });

    /*
        AQUI será conectado ao Firebase.

        Exemplo:

        salvarDisponibilidade(disponibilidade);

    */

    alert(
`Obrigado, ${nome}!

Sua disponibilidade foi registrada com sucesso.

Que Deus abençoe seu ministério ❤️`
    );

    campoNome.value = "";

    diasSelecionados.length = 0;

    botoesDias.forEach(botao => {

        botao.classList.remove("ativo");

    });

});
