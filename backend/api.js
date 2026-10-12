
const divalunos = document.getElementById('alunos');

console.log("div dos alunos:", divalunos);


async function obterAlunos() {
    const response = await fetch('http://localhost:3000/alunos');
    const alunos = await response.json();
    console.log("alunos:", alunos);

    // Limpar a lista antes de voltar a apresentar os alunos
    divalunos.innerHTML = "";

    alunos.forEach(aluno => {
        const novop = document.createElement("p");
        const novob = document.createElement("button");
        novob.textContent = "Apagar";
        novob.dataset.id = aluno.id;
        novob.addEventListener("click", apagarAluno);
        novop.textContent = aluno.nome + " " + aluno.cursoId + " ";
        novop.appendChild(novob);
        divalunos.appendChild(novop);
    });

    return alunos;
}



async function apagarAluno(event) {
    const oBotao = event.target;
    console.log(oBotao.dataset.id);
    const aUrl = `http://localhost:3000/alunos/${oBotao.dataset.id}`;
    await fetch(aUrl, {
        method: 'DELETE'
    });
    await obterAlunos();
}



obterAlunos();
