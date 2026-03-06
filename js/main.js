const searchForm = document.getElementById("search-form");
const searchEngine = document.getElementById("search-engine");
const searchInput = document.getElementById("search-input");
const linksGrid = document.getElementById("links-grid");
const modal = document.getElementById("add-link-modal");
const btnOpenModal = document.getElementById("btn-open-modal");
const btnCloseModal = document.getElementById("btn-close-modal");
const addLinkForm = document.getElementById("add-link-form");
const linkNameInput = document.getElementById("link-name");
const linkUrlInput = document.getElementById("link-url");

const STORAGE_KEY = "meus_links_salvos";

searchForm.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const termoDeBusca = searchInput.value.trim();
  if (!termoDeBusca) return;

  const urlBaseBuscador = searchEngine.value;
  window.location.href = `${urlBaseBuscador}${encodeURIComponent(termoDeBusca)}`;
});

btnOpenModal.addEventListener("click", () => {
  indexEdicao = null;
  addLinkForm.reset();
  document.querySelector("#add-link-modal h2").textContent = "Novo Atalho";
  modal.showModal();
});

btnCloseModal.addEventListener("click", () => {
  modal.close();
  addLinkForm.reset();
});

let indexEdicao = null;

function obterLinksSalvos() {
  const dados = localStorage.getItem(STORAGE_KEY);
  return dados ? JSON.parse(dados) : [];
}

function renderizarLinks() {
  const links = obterLinksSalvos();
  linksGrid.innerHTML = "";

  links.forEach((link, index) => {
    let dominio = "";
    try {
      dominio = new URL(link.url).hostname;
    } catch (erro) {
      dominio = link.url;
    }

    const divContainer = document.createElement("div");
    divContainer.className = "link-container";

    divContainer.innerHTML = `
      <a href="${link.url}" class="link-item">
        <img src="https://www.google.com/s2/favicons?domain=${dominio}&sz=128" alt="Ícone">
        <span>${link.nome}</span>
      </a>
      <div class="link-actions">
        <button type="button" class="btn-edit" data-index="${index}">
          <i data-lucide="pencil"></i>
        </button>
        <button type="button" class="btn-delete" data-index="${index}">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    `;

    linksGrid.appendChild(divContainer);
  });
  lucide.createIcons();
}

addLinkForm.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const nome = linkNameInput.value.trim();
  let url = linkUrlInput.value.trim();

  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  if (nome && url) {
    const linksAtuais = obterLinksSalvos();

    if (indexEdicao !== null) {
      linksAtuais[indexEdicao] = { nome, url };
    } else {
      linksAtuais.push({ nome, url });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(linksAtuais));

    renderizarLinks();
    addLinkForm.reset();
    modal.close();
  }
});

linksGrid.addEventListener("click", (evento) => {
  const btnDelete = evento.target.closest(".btn-delete");
  const btnEdit = evento.target.closest(".btn-edit");

  if (btnDelete) {
    const index = btnDelete.dataset.index;
    const links = obterLinksSalvos();

    links.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    renderizarLinks();
  }

  if (btnEdit) {
    const index = btnEdit.dataset.index;
    const links = obterLinksSalvos();
    const link = links[index];

    linkNameInput.value = link.nome;
    linkUrlInput.value = link.url;

    document.querySelector("#add-link-modal h2").textContent = "Editar Atalho";
    indexEdicao = index;

    modal.showModal();
  }
});
function carregarImagemFundo() {
  const urlImagem = `https://picsum.photos/1920/1080?random=${Math.random()}`;
  document.body.style.backgroundImage = `url('${urlImagem}')`;
}

renderizarLinks();
carregarImagemFundo();
