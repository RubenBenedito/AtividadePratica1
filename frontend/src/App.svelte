<script>
  import { onMount } from 'svelte';

  const api = '';
  let pagina = $state('inicio');
  let alunos = $state([]);
  let cursos = $state([]);
  let loading = $state(true);
  let saving = $state(false);
  let mostrarFormulario = $state(false);
  let modoFormulario = $state('criar');
  let registoEmEdicao = $state(null);
  let error = $state('');
  let successMessage = $state('');
  let successTimeout;
  let formError = $state('');
  let alunoForm = $state({ nome: '', apelido: '', idCurso: '', anoCurricular: '', idade: '' });
  let cursoForm = $state({ nomeDoCurso: '' });

  const idDocumento = (documento) => documento?._id ?? documento?.id;

  const cursoNome = (idCurso) =>
    typeof idCurso === 'object'
      ? idCurso?.nomeDoCurso ?? 'Curso não associado'
      : cursos.find((curso) => String(idDocumento(curso)) === String(idCurso))?.nomeDoCurso ?? 'Curso não associado';

  function mostrarSucesso(mensagem) {
    successMessage = mensagem;
    clearTimeout(successTimeout);
    successTimeout = setTimeout(() => {
      successMessage = '';
    }, 3000);
  }

  async function carregarDados() {
    loading = true;
    error = '';
    try {
      const [alunosResponse, cursosResponse] = await Promise.all([
        fetch(`${api}/alunos`),
        fetch(`${api}/cursos`),
      ]);
      if (!alunosResponse.ok || !cursosResponse.ok) throw new Error('Não foi possível carregar os dados.');
      alunos = (await alunosResponse.json()) ?? [];
      cursos = (await cursosResponse.json()) ?? [];
    } catch (requestError) {
      error = requestError.message;
    } finally {
      loading = false;
    }
  }

  function abrirPagina(nome) {
    pagina = nome;
    mostrarFormulario = false;
    formError = '';
  }

  function abrirFormulario() {
    formError = '';
    modoFormulario = 'criar';
    registoEmEdicao = null;
    if (pagina === 'alunos') alunoForm = { nome: '', apelido: '', idCurso: '', anoCurricular: '', idade: '' };
    else cursoForm = { nomeDoCurso: '' };
    mostrarFormulario = true;
  }

  function editarAluno(aluno) {
    modoFormulario = 'editar';
    registoEmEdicao = idDocumento(aluno);
    alunoForm = {
      nome: aluno.nome ?? '',
      apelido: aluno.apelido ?? '',
      idCurso: typeof aluno.idCurso === 'object' ? aluno.idCurso?._id ?? '' : aluno.idCurso ?? '',
      anoCurricular: aluno.anoCurricular ?? 1,
      idade: aluno.idade ?? '',
    };
    formError = '';
    mostrarFormulario = true;
  }

  function editarCurso(curso) {
    modoFormulario = 'editar';
    registoEmEdicao = idDocumento(curso);
    cursoForm = { nomeDoCurso: curso.nomeDoCurso ?? '' };
    formError = '';
    mostrarFormulario = true;
  }

  async function adicionarAluno() {
    formError = '';
    if (!alunoForm.nome.trim() || !alunoForm.idade || !alunoForm.idCurso) {
      formError = 'Preencha o nome, a idade e o curso.';
      return;
    }

    saving = true;
    try {
      const response = await fetch(`${api}/alunos${modoFormulario === 'editar' ? `/${registoEmEdicao}` : ''}`, {
        method: modoFormulario === 'editar' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: alunoForm.nome.trim(),
          apelido: alunoForm.apelido.trim(),
          idCurso: alunoForm.idCurso,
          anoCurricular: Number(alunoForm.anoCurricular) || 1,
          idade: Number(alunoForm.idade),
        }),
      });
      if (!response.ok) throw new Error(`Não foi possível ${modoFormulario === 'editar' ? 'atualizar' : 'adicionar'} o aluno.`);
      const mensagem = modoFormulario === 'editar' ? 'Aluno atualizado com sucesso.' : 'Aluno adicionado com sucesso.';
      alunoForm = { nome: '', apelido: '', idCurso: '', anoCurricular: '', idade: '' };
      mostrarFormulario = false;
      mostrarSucesso(mensagem);
      await carregarDados();
    } catch (requestError) {
      formError = requestError.message;
    } finally {
      saving = false;
    }
  }

  async function adicionarCurso() {
    formError = '';
    if (!cursoForm.nomeDoCurso.trim()) {
      formError = 'Escreva o nome do curso.';
      return;
    }

    saving = true;
    try {
      const response = await fetch(`${api}/cursos${modoFormulario === 'editar' ? `/${registoEmEdicao}` : ''}`, {
        method: modoFormulario === 'editar' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeDoCurso: cursoForm.nomeDoCurso.trim() }),
      });
      if (!response.ok) throw new Error(`Não foi possível ${modoFormulario === 'editar' ? 'atualizar' : 'adicionar'} o curso.`);
      const mensagem = modoFormulario === 'editar' ? 'Curso atualizado com sucesso.' : 'Curso adicionado com sucesso.';
      cursoForm = { nomeDoCurso: '' };
      mostrarFormulario = false;
      mostrarSucesso(mensagem);
      await carregarDados();
    } catch (requestError) {
      formError = requestError.message;
    } finally {
      saving = false;
    }
  }

  async function remover(registo, tipo) {
    try {
      const response = await fetch(`${api}/${tipo}/${idDocumento(registo)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Não foi possível remover ${tipo === 'alunos' ? 'o aluno' : 'o curso'}.`);
      if (tipo === 'alunos') alunos = alunos.filter((aluno) => idDocumento(aluno) !== idDocumento(registo));
      else cursos = cursos.filter((curso) => idDocumento(curso) !== idDocumento(registo));
      mostrarSucesso(`${tipo === 'alunos' ? 'Aluno' : 'Curso'} removido com sucesso.`);
    } catch (requestError) {
      error = requestError.message;
    }
  }

  onMount(carregarDados);
</script>

<svelte:head>
  <title>Gestão Académica</title>
</svelte:head>

<div class="min-h-screen bg-slate-950 text-slate-100">
  <header class="border-b border-white/10 bg-slate-950/90">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
      <button class="text-left" onclick={() => abrirPagina('inicio')}>
        <p class="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">SIR · API</p>
        <h1 class="mt-1 text-2xl font-bold tracking-tight">Gestão Académica</h1>
      </button>
      {#if pagina !== 'inicio'}
        <button class="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400 hover:text-white" onclick={() => abrirPagina('inicio')}>← Início</button>
      {/if}
    </div>
  </header>

  <main class="mx-auto max-w-7xl px-6 py-10">
    {#if error}
      <div class="mb-6 flex items-center justify-between rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-red-200">
        <span>{error}</span>
        <button class="font-semibold underline" onclick={carregarDados}>Tentar novamente</button>
      </div>
    {/if}

    {#if pagina === 'inicio'}
      <section class="mx-auto max-w-4xl py-10">
        <p class="text-sm font-medium uppercase tracking-[0.25em] text-cyan-400">Área de gestão</p>
        <h2 class="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">O que pretende consultar?</h2>
        <p class="mt-4 max-w-xl text-lg text-slate-400">Escolha uma área para consultar os registos existentes ou criar um novo.</p>
        <div class="mt-12 grid gap-5 sm:grid-cols-2">
          <button class="group rounded-3xl border border-white/10 bg-white/5 p-7 text-left transition hover:-translate-y-1 hover:border-cyan-400/60 hover:bg-cyan-400/10" onclick={() => abrirPagina('alunos')}>
            <span class="text-4xl">👥</span>
            <span class="mt-8 block text-2xl font-bold">Alunos</span>
            <span class="mt-2 block text-slate-400">{alunos.length} alunos registados</span>
            <span class="mt-8 block text-sm font-semibold text-cyan-400 group-hover:text-cyan-300">Ver alunos →</span>
          </button>
          <button class="group rounded-3xl border border-white/10 bg-white/5 p-7 text-left transition hover:-translate-y-1 hover:border-indigo-400/60 hover:bg-indigo-400/10" onclick={() => abrirPagina('cursos')}>
            <span class="text-4xl">🎓</span>
            <span class="mt-8 block text-2xl font-bold">Cursos</span>
            <span class="mt-2 block text-slate-400">{cursos.length} cursos registados</span>
            <span class="mt-8 block text-sm font-semibold text-cyan-400 group-hover:text-cyan-300">Ver cursos →</span>
          </button>
        </div>
      </section>
    {:else if pagina === 'alunos'}
      <section>
        <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><p class="text-sm font-medium text-cyan-400">Registos</p><h2 class="mt-1 text-4xl font-bold">Alunos</h2></div>
          <button class="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300" onclick={abrirFormulario}>+ Criar novo aluno</button>
        </div>
        {#if loading}<p class="text-slate-400">A carregar alunos...</p>
        {:else if alunos.length === 0}<div class="rounded-2xl border border-dashed border-white/20 p-10 text-center text-slate-400">Ainda não existem alunos.</div>
        {:else}<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{#each alunos as aluno (idDocumento(aluno))}
          <article class="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5"><div class="flex justify-between gap-3"><div><h3 class="text-lg font-semibold">{aluno.nome} {aluno.apelido ?? ''}</h3><p class="mt-1 text-sm text-slate-400">{cursoNome(aluno.idCurso)}</p></div></div><div class="mt-6"><div class="mb-2 flex justify-between text-xs text-slate-400"><span>Idade</span><strong class="text-slate-200">{aluno.idade} anos</strong></div><meter class="age-meter h-3 w-full" min="17" max="60" value={aluno.idade}></meter></div><p class="mt-4 text-xs text-slate-500">{aluno.anoCurricular ?? 1}º ano curricular</p><div class="mt-5 flex gap-2 border-t border-white/10 pt-4"><button class="flex-1 rounded-lg bg-cyan-400 px-3 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300" onclick={() => editarAluno(aluno)}>Atualizar</button><button class="flex-1 rounded-lg border border-red-400/40 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-400/10" onclick={() => remover(aluno, 'alunos')}>Remover</button></div></article>
        {/each}</div>{/if}
      </section>
    {:else}
      <section>
        <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><p class="text-sm font-medium text-indigo-300">Registos</p><h2 class="mt-1 text-4xl font-bold">Cursos</h2></div>
          <button class="rounded-xl bg-indigo-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-indigo-300" onclick={abrirFormulario}>+ Criar novo curso</button>
        </div>
        {#if loading}<p class="text-slate-400">A carregar cursos...</p>
        {:else if cursos.length === 0}<div class="rounded-2xl border border-dashed border-white/20 p-10 text-center text-slate-400">Ainda não existem cursos.</div>
        {:else}<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{#each cursos as curso (idDocumento(curso))}
          <article class="flex min-h-36 flex-col rounded-2xl border border-white/10 bg-white/5 p-5"><div class="flex justify-between gap-3"><h3 class="text-lg font-semibold">{curso.nomeDoCurso}</h3></div><p class="mt-6 text-sm text-slate-500">{alunos.filter((aluno) => typeof aluno.idCurso === 'object' ? String(idDocumento(aluno.idCurso)) === String(idDocumento(curso)) : String(aluno.idCurso) === String(idDocumento(curso))).length} alunos inscritos</p><div class="mt-5 flex gap-2 border-t border-white/10 pt-4"><button class="flex-1 rounded-lg bg-indigo-400 px-3 py-2 text-sm font-bold text-slate-950 hover:bg-indigo-300" onclick={() => editarCurso(curso)}>Atualizar</button><button class="flex-1 rounded-lg border border-red-400/40 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-400/10" onclick={() => remover(curso, 'cursos')}>Remover</button></div></article>
        {/each}</div>{/if}
      </section>
    {/if}
  </main>

  {#if successMessage}
    <div class="fixed right-5 top-5 z-[60] flex w-fit max-w-sm items-center gap-4 rounded-xl border border-emerald-400/30 bg-emerald-950/95 px-4 py-3 text-sm text-emerald-200 shadow-xl shadow-black/30" role="status">
      <span>✓ {successMessage}</span>
      <button class="text-lg leading-none text-emerald-300 hover:text-white" aria-label="Fechar mensagem" onclick={() => successMessage = ''}>×</button>
    </div>
  {/if}

  {#if mostrarFormulario}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" role="presentation" onclick={(event) => event.target === event.currentTarget && (mostrarFormulario = false)}>
      <div class="w-full max-w-2xl rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl shadow-black/50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {#if pagina === 'alunos'}
          <form onsubmit={(event) => { event.preventDefault(); adicionarAluno(); }}>
            <div class="mb-6 flex items-center justify-between">
              <div><p class="text-sm font-medium text-cyan-400">{modoFormulario === 'editar' ? 'Editar registo' : 'Novo registo'}</p><h2 id="modal-title" class="mt-1 text-2xl font-bold">{modoFormulario === 'editar' ? 'Atualizar aluno' : 'Criar aluno'}</h2></div>
              <button type="button" class="rounded-lg px-3 py-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Fechar modal" onclick={() => mostrarFormulario = false}>✕</button>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
              <label class="text-sm text-slate-300">Nome<input class="form-input" bind:value={alunoForm.nome} placeholder="Nome" /></label>
              <label class="text-sm text-slate-300">Apelido<input class="form-input" bind:value={alunoForm.apelido} placeholder="Apelido" /></label>
              <label class="text-sm text-slate-300">Curso<select class="form-input" bind:value={alunoForm.idCurso}><option value="">Selecionar curso</option>{#each cursos as curso}<option value={idDocumento(curso)}>{curso.nomeDoCurso}</option>{/each}</select></label>
              <label class="text-sm text-slate-300">Idade<input class="form-input" type="number" min="1" max="120" bind:value={alunoForm.idade} placeholder="21" /></label>
              <label class="text-sm text-slate-300">Ano curricular<input class="form-input" type="number" min="1" max="6" bind:value={alunoForm.anoCurricular} placeholder="1" /></label>
            </div>
            {#if formError}<p class="mt-4 text-sm text-red-300">{formError}</p>{/if}
            <div class="mt-7 flex justify-end gap-3"><button type="button" class="w-36 rounded-xl bg-cyan-400 px-5 py-2.5 font-bold text-slate-950 transition hover:bg-cyan-300" onclick={() => mostrarFormulario = false}>Cancelar</button><button class="w-36 rounded-xl bg-cyan-400 px-5 py-2.5 font-bold text-slate-950 disabled:opacity-50" disabled={saving}>{saving ? 'A guardar...' : modoFormulario === 'editar' ? 'Atualizar' : 'Adicionar aluno'}</button></div>
          </form>
        {:else}
          <form onsubmit={(event) => { event.preventDefault(); adicionarCurso(); }}>
            <div class="mb-6 flex items-center justify-between">
              <div><p class="text-sm font-medium text-indigo-300">{modoFormulario === 'editar' ? 'Editar registo' : 'Novo registo'}</p><h2 id="modal-title" class="mt-1 text-2xl font-bold">{modoFormulario === 'editar' ? 'Atualizar curso' : 'Criar curso'}</h2></div>
              <button type="button" class="rounded-lg px-3 py-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Fechar modal" onclick={() => mostrarFormulario = false}>✕</button>
            </div>
            <label class="text-sm text-slate-300">Nome do curso<input class="form-input" bind:value={cursoForm.nomeDoCurso} placeholder="Ex.: Engenharia Informática" /></label>
            {#if formError}<p class="mt-4 text-sm text-red-300">{formError}</p>{/if}
            <div class="mt-7 flex justify-end gap-3"><button type="button" class="w-36 rounded-xl bg-indigo-400 px-5 py-2.5 font-bold text-slate-950 transition hover:bg-indigo-300" onclick={() => mostrarFormulario = false}>Cancelar</button><button class="w-36 rounded-xl bg-indigo-400 px-5 py-2.5 font-bold text-slate-950 disabled:opacity-50" disabled={saving}>{saving ? 'A guardar...' : modoFormulario === 'editar' ? 'Atualizar' : 'Adicionar curso'}</button></div>
          </form>
        {/if}
      </div>
    </div>
  {/if}
</div>
