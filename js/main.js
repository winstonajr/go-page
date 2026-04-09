/**
 * GoPage - Main Application Logic
 */

class GoPage {
  constructor() {
    this.STORAGE_KEY = "gopage_links";
    this.SEARCH_ENGINE_KEY = "gopage_search_engine";
    this.indexEdicao = null;
    
    this.initElements();
    this.initEventListeners();
    this.initClock();
    this.loadSearchEngine();
    this.renderLinks();
    this.loadBackground();
  }

  initElements() {
    this.searchForm = document.getElementById("search-form");
    this.searchEngine = document.getElementById("search-engine");
    this.searchInput = document.getElementById("search-input");
    this.linksGrid = document.getElementById("links-grid");
    this.modal = document.getElementById("add-link-modal");
    this.btnOpenModal = document.getElementById("btn-open-modal");
    this.btnCloseModal = document.getElementById("btn-close-modal");
    this.addLinkForm = document.getElementById("add-link-form");
    this.linkNameInput = document.getElementById("link-name");
    this.linkUrlInput = document.getElementById("link-url");
    this.clockElement = document.getElementById("clock");
    this.dateElement = document.getElementById("date");
  }

  initEventListeners() {
    this.searchForm.addEventListener("submit", (e) => this.handleSearch(e));
    this.btnOpenModal.addEventListener("click", () => this.openModal());
    this.btnCloseModal.addEventListener("click", () => this.closeModal());
    this.addLinkForm.addEventListener("submit", (e) => this.handleSaveLink(e));
    this.linksGrid.addEventListener("click", (e) => this.handleLinksClick(e));
    this.searchEngine.addEventListener("change", () => this.saveSearchEngine());
    
    // Close modal on click outside
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) this.closeModal();
    });
  }

  initClock() {
    const updateClock = () => {
      const now = new Date();
      
      const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      this.clockElement.textContent = now.toLocaleTimeString('pt-BR', timeOptions);
      
      const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      this.dateElement.textContent = now.toLocaleDateString('pt-BR', dateOptions);
    };

    updateClock();
    setInterval(updateClock, 1000);
  }

  handleSearch(e) {
    e.preventDefault();
    const query = this.searchInput.value.trim();
    if (!query) return;

    const engineUrl = this.searchEngine.value;
    window.location.href = `${engineUrl}${encodeURIComponent(query)}`;
  }

  saveSearchEngine() {
    localStorage.setItem(this.SEARCH_ENGINE_KEY, this.searchEngine.value);
  }

  loadSearchEngine() {
    const saved = localStorage.getItem(this.SEARCH_ENGINE_KEY);
    if (saved) {
      this.searchEngine.value = saved;
    }
  }

  openModal(index = null) {
    this.indexEdicao = index;
    if (index !== null) {
      const links = this.getLinks();
      const link = links[index];
      this.linkNameInput.value = link.nome;
      this.linkUrlInput.value = link.url;
      document.querySelector("#add-link-modal h2").textContent = "Editar Atalho";
    } else {
      this.addLinkForm.reset();
      document.querySelector("#add-link-modal h2").textContent = "Novo Atalho";
    }
    this.modal.showModal();
    this.linkNameInput.focus();
  }

  closeModal() {
    this.modal.close();
    this.addLinkForm.reset();
    this.indexEdicao = null;
  }

  getLinks() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveLinks(links) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(links));
    this.renderLinks();
  }

  handleSaveLink(e) {
    e.preventDefault();
    const nome = this.linkNameInput.value.trim();
    let url = this.linkUrlInput.value.trim();

    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    if (nome && url) {
      const links = this.getLinks();
      if (this.indexEdicao !== null) {
        links[this.indexEdicao] = { nome, url };
      } else {
        links.push({ nome, url });
      }
      this.saveLinks(links);
      this.closeModal();
    }
  }

  handleLinksClick(e) {
    const btnDelete = e.target.closest(".btn-delete");
    const btnEdit = e.target.closest(".btn-edit");

    if (btnDelete) {
      e.preventDefault();
      const index = btnDelete.dataset.index;
      if (confirm(`Excluir atalho "${this.getLinks()[index].nome}"?`)) {
        const links = this.getLinks();
        links.splice(index, 1);
        this.saveLinks(links);
      }
    }

    if (btnEdit) {
      e.preventDefault();
      this.openModal(parseInt(btnEdit.dataset.index));
    }
  }

  renderLinks() {
    const links = this.getLinks();
    this.linksGrid.innerHTML = "";

    links.forEach((link, index) => {
      let domain = "";
      try {
        domain = new URL(link.url).hostname;
      } catch (e) {
        domain = link.url;
      }

      const container = document.createElement("div");
      container.className = "link-container";
      container.innerHTML = `
        <a href="${link.url}" class="link-item">
          <div class="favicon-wrapper">
            <img src="https://www.google.com/s2/favicons?domain=${domain}&sz=128" 
                 alt="${link.nome}" 
                 onerror="this.src='https://lucide.dev/api/icons/globe'">
          </div>
          <span>${link.nome}</span>
        </a>
        <div class="link-actions">
          <button type="button" class="btn-edit" data-index="${index}" title="Editar">
            <i data-lucide="pencil"></i>
          </button>
          <button type="button" class="btn-delete" data-index="${index}" title="Excluir">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      `;
      this.linksGrid.appendChild(container);
    });

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  async loadBackground() {
    const img = new Image();
    const randomId = Math.floor(Math.random() * 1000);
    const url = `https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80`;
    // Using a nice stable high-quality image from Unsplash as default, or we can stick to random
    // But for better performance, let's use a curated set or just picsum with specific size
    const picsumUrl = `https://picsum.photos/1920/1080?blur=1`;
    
    // Smooth loading
    document.body.style.transition = "background-image 1s ease-in-out";
    
    img.onload = () => {
      document.body.style.backgroundImage = `url('${img.src}')`;
    };
    
    // Prefer Unsplash for better aesthetics
    img.src = `https://source.unsplash.com/random/1920x1080?nature,landscape,minimalist&sig=${randomId}`;
    
    // Fallback if unsplash is slow/down (Source Unsplash is actually deprecated, using Picsum is safer)
    img.src = `https://picsum.photos/1920/1080?random=${randomId}`;
  }
}

// Initialize application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new GoPage();
});
