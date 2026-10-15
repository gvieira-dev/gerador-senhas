const MINUSCULAS = "abcdefghijklmnopqrstuvwxyz";
const MAIUSCULAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMEROS = "0123456789";
const ESPECIAIS = "!@#$%&*()-_=+[]{};:,.?";

const campoSenha = document.getElementById("senha");
const inputTamanho = document.getElementById("tamanho");
const valorTamanho = document.getElementById("valorTamanho");
const chkMaiusculas = document.getElementById("maiusculas");
const chkEspeciais = document.getElementById("especiais");
const btnGerar = document.getElementById("btnGerar");
const btnCopiar = document.getElementById("btnCopiar");
const msgCopiado = document.getElementById("msgCopiado");

function lerArmazenamento(chave) {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}

function salvarArmazenamento(chave, valor) {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    // O gerador continua funcionando mesmo sem acesso ao armazenamento.
  }
}

function atualizarPreenchimento() {
  const min = Number(inputTamanho.min);
  const max = Number(inputTamanho.max);
  const pct = ((inputTamanho.value - min) / (max - min)) * 100;
  inputTamanho.style.setProperty("--fill", pct + "%");
}

// Número aleatório seguro entre 0 e max-1
function aleatorio(max) {
  const limite = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limite);
  return buffer[0] % max;
}

function sortearDe(conjunto) {
  return conjunto[aleatorio(conjunto.length)];
}

function embaralhar(lista) {
  for (let i = lista.length - 1; i > 0; i--) {
    const j = aleatorio(i + 1);
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
}

function gerarSenha() {
  const tamanho = Number(inputTamanho.value);

  // Minúsculas e números sempre entram
  const grupos = [MINUSCULAS, NUMEROS];
  if (chkMaiusculas.checked) grupos.push(MAIUSCULAS);
  if (chkEspeciais.checked) grupos.push(ESPECIAIS);

  const todos = grupos.join("");
  const senha = [];

  // Garante pelo menos 1 caractere de cada grupo marcado
  grupos.forEach(grupo => senha.push(sortearDe(grupo)));

  // Completa o restante
  while (senha.length < tamanho) {
    senha.push(sortearDe(todos));
  }

  campoSenha.value = embaralhar(senha).join("");
  msgCopiado.classList.add("invisible");
  salvarArmazenamento("senhaGerada", campoSenha.value);
}

function senhaSalvaValida(senha) {
  if (typeof senha !== "string" || senha.length !== Number(inputTamanho.value)) {
    return false;
  }

  const grupos = [MINUSCULAS, NUMEROS];
  if (chkMaiusculas.checked) grupos.push(MAIUSCULAS);
  if (chkEspeciais.checked) grupos.push(ESPECIAIS);

  const permitidos = new Set(grupos.join(""));
  if ([...senha].some(caractere => !permitidos.has(caractere))) {
    return false;
  }

  return grupos.every(grupo => [...senha].some(caractere => grupo.includes(caractere)));
}

async function copiarSenha() {
  if (!campoSenha.value) return;

  try {
    await navigator.clipboard.writeText(campoSenha.value);
  } catch {
    campoSenha.select();
    document.execCommand("copy");
  }

  msgCopiado.classList.remove("invisible");
  setTimeout(() => msgCopiado.classList.add("invisible"), 2000);
}

function inicializarGerador() {
  const tamanhoPadrao = Number(inputTamanho.value);
  const valoresSalvos = {
    senha: lerArmazenamento("senhaGerada"),
    tamanho: lerArmazenamento("tamanhoSenha"),
    maiusculas: lerArmazenamento("usarMaiusculas"),
    especiais: lerArmazenamento("usarEspeciais")
  };
  const tamanhoValidado = valoresSalvos.tamanho !== null && /^\d+$/.test(valoresSalvos.tamanho)
    ? Number(valoresSalvos.tamanho)
    : NaN;
  const min = Number(inputTamanho.min);
  const max = Number(inputTamanho.max);

  inputTamanho.value = Number.isInteger(tamanhoValidado) &&
    tamanhoValidado >= min &&
    tamanhoValidado <= max
    ? String(tamanhoValidado)
    : String(tamanhoPadrao);

  if (valoresSalvos.maiusculas === "true" || valoresSalvos.maiusculas === "false") {
    chkMaiusculas.checked = valoresSalvos.maiusculas === "true";
  }
  if (valoresSalvos.especiais === "true" || valoresSalvos.especiais === "false") {
    chkEspeciais.checked = valoresSalvos.especiais === "true";
  }

  valorTamanho.textContent = inputTamanho.value;
  atualizarPreenchimento();

  if (senhaSalvaValida(valoresSalvos.senha)) {
    campoSenha.value = valoresSalvos.senha;
  } else {
    gerarSenha();
  }
}

inicializarGerador();

inputTamanho.addEventListener("input", () => {
  valorTamanho.textContent = inputTamanho.value;
  atualizarPreenchimento();
  salvarArmazenamento("tamanhoSenha", inputTamanho.value);
  gerarSenha();
});

chkMaiusculas.addEventListener("change", () => {
  salvarArmazenamento("usarMaiusculas", String(chkMaiusculas.checked));
  gerarSenha();
});
chkEspeciais.addEventListener("change", () => {
  salvarArmazenamento("usarEspeciais", String(chkEspeciais.checked));
  gerarSenha();
});
btnGerar.addEventListener("click", gerarSenha);
btnCopiar.addEventListener("click", copiarSenha);


// Background estrelas e estrelas cadentes 

const ceu = document.getElementById("ceu");

function criarEstrelas() {
  const quantidade = Math.min(160, Math.floor((window.innerWidth * window.innerHeight) / 9000));

  for (let i = 0; i < quantidade; i++) {
    const estrela = document.createElement("span");
    const tamanho = Math.random() * 2 + 1;

    estrela.className = "estrela";
    estrela.style.width = tamanho + "px";
    estrela.style.height = tamanho + "px";
    estrela.style.left = Math.random() * 100 + "%";
    estrela.style.top = Math.random() * 100 + "%";
    estrela.style.setProperty("--dur", (Math.random() * 3 + 2) + "s");
    estrela.style.setProperty("--delay", (Math.random() * 4) + "s");

    ceu.appendChild(estrela);
  }
}

function lancarCadente() {
  // Só lança no tema escuro e com a aba visível
  const escuro = document.documentElement.getAttribute("data-theme") === "dark";

  if (escuro && !document.hidden) {
    const cadente = document.createElement("span");
    cadente.className = "cadente";
    cadente.style.left = Math.random() * 70 + "%";
    cadente.style.top = Math.random() * 40 + "%";
    cadente.addEventListener("animationend", () => cadente.remove());
    ceu.appendChild(cadente);
  }

  // Próxima entre 3 e 8 segundos
  setTimeout(lancarCadente, 3000 + Math.random() * 5000);
}

criarEstrelas();
setTimeout(lancarCadente, 2000);


  // Troca de tema 
const btnTema = document.getElementById("btnTema");

function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);
  btnTema.textContent = tema === "dark" ? "☀️" : "🌙";
  salvarArmazenamento("tema", tema);
}

btnTema.addEventListener("click", () => {
  const atual = document.documentElement.getAttribute("data-theme");
  aplicarTema(atual === "dark" ? "light" : "dark");
});

// Tema inicial: o salvo, ou o do sistema
let temaInicial = lerArmazenamento("tema");
if (!temaInicial) {
  temaInicial = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
aplicarTema(temaInicial);
