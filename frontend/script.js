const divalunos = document.getElementById("alunos");


const botaoCriarAluno = document.getElementById("criarAluno");
botaoCriarAluno.addEventListener("click", async () => {
    const nome = document.getElementById("nomeAluno").value;
    const curso = document.getElementById("cursoAluno").value;
    const idade = document.getElementById("idadeAluno").value;
    await criaAluno({ preventDefault: () => {} }, nome, curso, idade);
});


document.addEventListener("DOMContentLoaded", () => {
    // Carregae ambas as listas
    mostraAlunos();
    mostraCursos();
    
    // Event listener para o formulário de Alunos
    const formAluno = document.getElementById("form-aluno");
    if (formAluno) {
        formAluno.addEventListener("submit", salvaAluno);
    }

    // Event listener para o formulário de Cursos
    const formCurso = document.getElementById("form-curso");
    if (formCurso) {
        formCurso.addEventListener("submit", salvaCurso);
    }
});



/* ==========================================================================
   CRUD - ALUNOS
   ========================================================================== */

// Get - Buscar Alunos
async function getAlunos() {
    try {
        const response = await fetch("http://localhost:3010/alunos");
        if (!response.ok) throw new Error("Erro ao buscar alunos");
        return await response.json();
    } catch (error) {
        console.error("Erro:", error);
        return [];
    }
}


// Mostrar Alunos
async function mostraAlunos() {
    const alunos = await getAlunos();
    const divalunos = document.getElementById("alunos");
    if (!divalunos) return;
    
    divalunos.innerHTML = "";

    alunos.forEach(aluno => {
        const paluno = document.createElement("p");
        paluno.textContent = `${aluno.nome} `;

        // Botão Apagar
        const bApagar = document.createElement("button");
        bApagar.textContent = "Apagar";
        bApagar.dataset.id = aluno.id;
        bApagar.addEventListener("click", apagaAluno);

        // Botão Editar
        const bEditar = document.createElement("button");
        bEditar.textContent = "Editar";
        bEditar.addEventListener("click", () => preencheFormularioAluno(aluno));

        paluno.appendChild(bEditar);
        paluno.appendChild(bApagar);
        divalunos.appendChild(paluno);
    });
}


// Create / Update
async function salvaAluno(e) {
    e.preventDefault();

    const idInput = document.getElementById("aluno-id").value;
    const nomeInput = document.getElementById("aluno-nome").value;

    const alunoData = { nome: nomeInput };

    const url = idInput ? `http://localhost:3010/alunos/${idInput}` : "http://localhost:3010/alunos";
    const method = idInput ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(alunoData)
        });

        if (response.ok) {
            e.target.reset();
            document.getElementById("aluno-id").value = "";
            mostraAlunos();
        } else {
            console.error("Erro ao salvar aluno");
        }
    } catch (error) {
        console.error("Erro de rede:", error);
    }
}


// Delete
async function apagaAluno(e) {
    const alunosId = e.target.dataset.id;
    const url = `http://localhost:3010/alunos/${alunosId}`;

    try {
        const response = await fetch(url, { method: "DELETE" });
        if (response.ok) {
            mostraAlunos();
        } else {
            console.error("Erro ao apagar aluno");
        }
    } catch (error) {
        console.error("Erro de rede:", error);
    }
}


// Cria aluno
async function criaAluno(evento){
    evento.preventDefault();
    const nome = document.getElementById("nomeAluno").value;
    const curso = document.getElementById("cursoAluno").value;
    const idade = document.getElementById("idadeAluno").value;

    const novoAluno = {
        nome: nomeAluno,
        cursoId: cursoAluno,
        idade: idadeAluno
    }

    const jsonAluno = JSON.stringify(novoAluno);
    console.log(jsonAluno);

    const response = await fetch("http://localhost:3010/alunos", {
        method: "POST",
        "body": jsonAluno,
        headers: {
            "Content-Type": "application/json"
        }
    });
}

criaAluno;


function preencheFormularioAluno(aluno) {
    document.getElementById("aluno-id").value = aluno.id;
    document.getElementById("aluno-nome").value = aluno.nome;
}




/* ==========================================================================
   CRUD - CURSOS
   ========================================================================== */

// Get- Buscar Cursos
async function getCursos() {
    try {
        const response = await fetch("http://localhost:3010/cursos");
        if (!response.ok) throw new Error("Erro ao buscar cursos");
        return await response.json();
    } catch (error) {
        console.error("Erro:", error);
        return [];
    }
}


// Mostrar Cursos
async function mostraCursos() {
    const cursos = await getCursos();
    const divCursos = document.getElementById("cursos");
    if (!divCursos) return;

    divCursos.innerHTML = "";

    cursos.forEach(curso => {
        const pCurso = document.createElement("p");
        pCurso.textContent = `${curso.nome} `;

        // Botão Apagar
        const bApagar = document.createElement("button");
        bApagar.textContent = "Apagar";
        bApagar.dataset.id = curso.id;
        bApagar.addEventListener("click", apagaCurso);

        // Botão Editar
        const bEditar = document.createElement("button");
        bEditar.textContent = "Editar";
        bEditar.addEventListener("click", () => preencheFormularioCurso(curso));

        pCurso.appendChild(bEditar);
        pCurso.appendChild(bApagar);
        divCursos.appendChild(pCurso);
    });
}


// Create / Update
async function salvaCurso(e) {
    e.preventDefault();

    const idInput = document.getElementById("curso-id").value;
    const nomeInput = document.getElementById("curso-nome").value;

    const cursoData = { nome: nomeInput };

    const url = idInput ? `http://localhost:3010/cursos/${idInput}` : "http://localhost:3010/cursos";
    const method = idInput ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cursoData)
        });

        if (response.ok) {
            e.target.reset();
            document.getElementById("curso-id").value = "";
            mostraCursos();
        } else {
            console.error("Erro ao salvar curso");
        }
    } catch (error) {
        console.error("Erro de rede:", error);
    }
}


// Delete - Apagar curso
async function apagaCurso(e) {
    const cursoId = e.target.dataset.id;
    const url = `http://localhost:3010/cursos/${cursoId}`;

    try {
        const response = await fetch(url, { method: "DELETE" });
        if (response.ok) {
            mostraCursos();
        } else {
            console.error("Erro ao apagar curso");
        }
    } catch (error) {
        console.error("Erro de rede:", error);
    }
}

function preencheFormularioCurso(curso) {
    document.getElementById("curso-id").value = curso.id;
    document.getElementById("curso-nome").value = curso.nome;
}
