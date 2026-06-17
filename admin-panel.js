(() => {
  const API = window.NEXALOR_API_BASE || localStorage.getItem("nexalor_api_base") || "/api";
  const TOKEN_KEY = "nexalor_admin_token";
  const SESSION_KEY = "nexalor_admin_session";

  const DEFAULT_SETTINGS = {
    preset: "violet",
    logoText: "NEXALOR",
    footerText: "BY YOUNSOUGLUOU",
    colorPrimary: "#6a0dad",
    colorSecondary: "#a34dff",
    colorBgMain: "#08070d",
    colorBgSoft: "#11101a",
  };

  const PRESETS = {
    violet: { colorPrimary: "#6a0dad", colorSecondary: "#a34dff", colorBgMain: "#08070d", colorBgSoft: "#11101a" },
    crimson: { colorPrimary: "#b3123f", colorSecondary: "#ff4f7f", colorBgMain: "#0c0709", colorBgSoft: "#1b0d14" },
    ocean: { colorPrimary: "#1166cc", colorSecondary: "#31c0ff", colorBgMain: "#070c14", colorBgSoft: "#0f1a2a" },
    emerald: { colorPrimary: "#0d9c74", colorSecondary: "#35d0a5", colorBgMain: "#060f0c", colorBgSoft: "#0d1f19" },
  };

  const token = () => {
    try {
      const u = JSON.parse(localStorage.getItem("nexalor_user") || "{}");
      return u.token || localStorage.getItem(TOKEN_KEY) || "";
    } catch {
      return localStorage.getItem(TOKEN_KEY) || "";
    }
  };
  const isConnected = () => {
    try {
      const u = JSON.parse(localStorage.getItem("nexalor_user") || "{}");
      if (u.role === "admin") return true;
      return localStorage.getItem(SESSION_KEY) === "1";
    } catch {
      return localStorage.getItem(SESSION_KEY) === "1";
    }
  };
  const setConnected = (v) => {
    if (!v) {
      localStorage.removeItem("nexalor_user");
    }
    localStorage.setItem(SESSION_KEY, v ? "1" : "0");
  };

  async function api(path, options = {}) {
    try {
      const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
      if (token()) headers.Authorization = `Bearer ${token()}`;
      const res = await fetch(`${API}${path}`, { ...options, headers });
      if (!res.ok) return { error: await res.text(), status: res.status };
      const ct = res.headers.get("content-type") || "";
      return ct.includes("application/json") ? await res.json() : {};
    } catch {
      return { error: "network_error" };
    }
  }

  async function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const els = {
    login: document.getElementById("adminLogin"),
    panel: document.getElementById("adminPanel"),
    loginForm: document.getElementById("loginForm"),
    user: document.getElementById("adminUsername"),
    pass: document.getElementById("adminPassword"),
    loginError: document.getElementById("loginError"),
    logout: document.getElementById("logoutBtn"),
    status: document.getElementById("adminStatus"),
    stats: document.getElementById("adminStats"),
    publishForm: document.getElementById("publishForm"),
    videosList: document.getElementById("adminVideosList"),
    categorySelect: document.getElementById("categorySelect"),
    editCategory: document.getElementById("editCategory"),
    editForm: document.getElementById("editForm"),
    editHint: document.getElementById("editHint"),
    cancelEditBtn: document.getElementById("cancelEditBtn"),
    categoryForm: document.getElementById("categoryForm"),
    newCategoryInput: document.getElementById("newCategoryInput"),
    categoriesAdminList: document.getElementById("categoriesAdminList"),
    themeForm: document.getElementById("themeForm"),
    presetSelect: document.getElementById("presetSelect"),
    logoTextInput: document.getElementById("logoTextInput"),
    footerTextInput: document.getElementById("footerTextInput"),
    colorPrimary: document.getElementById("colorPrimary"),
    colorSecondary: document.getElementById("colorSecondary"),
    colorBgMain: document.getElementById("colorBgMain"),
    colorBgSoft: document.getElementById("colorBgSoft"),
  };

  let videos = [];
  let categories = [];
  let settings = { ...DEFAULT_SETTINGS };

  function msg(text, isError = false) {
    if (!els.status) return;
    els.status.textContent = text;
    els.status.style.color = isError ? "#ff8fa2" : "";
  }

  function toggleViews() {
    const on = isConnected();
    els.login?.classList.toggle("hidden", on);
    els.panel?.classList.toggle("hidden", !on);
    els.logout?.classList.toggle("hidden", !on);
  }

  function fillCategorySelects() {
    const options = categories.length ? categories : ["General"];
    [els.categorySelect, els.editCategory].forEach((s) => {
      if (!s) return;
      s.innerHTML = `<option value="" disabled selected>Choisir une categorie</option>` + options.map((c) => `<option value="${c}">${c}</option>`).join("");
    });
  }

  function renderStats() {
    if (!els.stats) return;
    const totalViews = videos.reduce((a, v) => a + Number(v.views || 0), 0);
    els.stats.innerHTML = `
      <span class="meta">${videos.length} videos</span>
      <span class="meta">${categories.length} categories</span>
      <span class="meta">${totalViews} vues totales</span>
    `;
  }

  function renderVideoList() {
    if (!els.videosList) return;
    els.videosList.innerHTML = "";
    if (!videos.length) {
      els.videosList.innerHTML = `<p class="meta">Aucune video publiee.</p>`;
      return;
    }

    videos.forEach((v) => {
      const row = document.createElement("div");
      row.className = "admin-row";
      row.innerHTML = `
        <img src="${v.thumbnail}" alt="${v.title}" />
        <div>
          <strong>${v.title}</strong>
          <p class="meta">${v.category} • ${v.views} vues • ${v.likes} likes</p>
        </div>
        <div class="admin-actions">
          <button class="btn edit-btn">Modifier</button>
          <button class="btn danger delete-btn">Supprimer</button>
        </div>
      `;
      row.querySelector(".edit-btn")?.addEventListener("click", () => openEdit(v));
      row.querySelector(".delete-btn")?.addEventListener("click", () => deleteVideo(v.id, v.title));
      els.videosList.appendChild(row);
    });
  }

  function renderCategoriesAdmin() {
    if (!els.categoriesAdminList) return;
    els.categoriesAdminList.innerHTML = "";
    categories.forEach((name) => {
      const row = document.createElement("div");
      row.className = "admin-row";
      row.innerHTML = `
        <div><strong>${name}</strong></div>
        <div class="admin-actions">
          <button class="btn edit-cat">Renommer</button>
          <button class="btn danger del-cat">Supprimer</button>
        </div>
      `;
      row.querySelector(".edit-cat")?.addEventListener("click", () => renameCategory(name));
      row.querySelector(".del-cat")?.addEventListener("click", () => removeCategory(name));
      els.categoriesAdminList.appendChild(row);
    });
  }

  function applyThemeInputs() {
    if (!els.presetSelect) return;
    els.presetSelect.value = settings.preset || "violet";
    els.logoTextInput.value = settings.logoText || "NEXALOR";
    els.footerTextInput.value = settings.footerText || "BY YOUNSOUGLUOU";
    els.colorPrimary.value = settings.colorPrimary || DEFAULT_SETTINGS.colorPrimary;
    els.colorSecondary.value = settings.colorSecondary || DEFAULT_SETTINGS.colorSecondary;
    els.colorBgMain.value = settings.colorBgMain || DEFAULT_SETTINGS.colorBgMain;
    els.colorBgSoft.value = settings.colorBgSoft || DEFAULT_SETTINGS.colorBgSoft;
  }

  async function refreshAll() {
    const [vr, cr, sr] = await Promise.all([api("/videos"), api("/categories"), api("/settings")]);
    videos = vr && Array.isArray(vr.videos) ? vr.videos : [];
    categories = cr && Array.isArray(cr.categories) ? cr.categories : [];
    settings = sr && sr.settings ? { ...DEFAULT_SETTINGS, ...sr.settings } : { ...DEFAULT_SETTINGS };
    fillCategorySelects();
    renderStats();
    renderVideoList();
    renderCategoriesAdmin();
    applyThemeInputs();
  }

  async function deleteVideo(id, title) {
    if (!confirm(`Supprimer "${title}" ?`)) return;
    const r = await api(`/videos/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (r?.error) return msg("Suppression impossible.", true);
    await refreshAll();
    msg("Video supprimee.");
  }

  function openEdit(v) {
    if (!els.editForm) return;
    els.editForm.classList.remove("hidden");
    els.editHint?.classList.add("hidden");
    document.getElementById("editId").value = v.id;
    document.getElementById("editTitle").value = v.title;
    document.getElementById("editDescription").value = v.description;
    document.getElementById("editCategory").value = v.category;
    document.getElementById("editVideoUrl").value = v.videoUrl;
    document.getElementById("editThumbnail").value = v.thumbnail;
  }

  async function renameCategory(oldName) {
    const newName = prompt("Nouveau nom de categorie:", oldName);
    if (!newName || newName.trim() === oldName) return;
    const r = await api(`/categories/${encodeURIComponent(oldName)}`, {
      method: "PUT",
      body: JSON.stringify({ newName: newName.trim() }),
    });
    if (r?.error) return msg("Renommage impossible.", true);
    await refreshAll();
    msg("Categorie renommee.");
  }

  async function removeCategory(name) {
    if (!confirm(`Supprimer categorie "${name}" ? Les videos basculeront en General.`)) return;
    const r = await api(`/categories/${encodeURIComponent(name)}`, { method: "DELETE" });
    if (r?.error) return msg("Suppression categorie impossible.", true);
    await refreshAll();
    msg("Categorie supprimee.");
  }

  function bindEvents() {
    // GESTION DU LOGIN AVEC MOT DE PASSE : lvttr2010
    els.loginForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = els.user.value.trim();
      const password = els.pass.value.trim();

      const res = await api("/admin/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });

      if (res.token) {
        localStorage.setItem(TOKEN_KEY, res.token);
        setConnected(true);
        els.loginError?.classList.add("hidden");
        els.user.value = "";
        els.pass.value = "";
        toggleViews();
        await refreshAll();
        msg("Accès autorisé.");
      } else {
        els.loginError?.classList.remove("hidden");
        msg("Identifiants incorrects.", true);
      }
    });

    els.pass?.addEventListener("input", () => els.loginError?.classList.add("hidden"));
    els.logout?.addEventListener("click", () => {
      localStorage.removeItem(TOKEN_KEY);
      setConnected(false);
      toggleViews();
      msg("Déconnecté.");
    });

    els.publishForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("titleInput").value.trim();
      const description = document.getElementById("descriptionInput").value.trim();
      const category = els.categorySelect.value;
      let videoUrl = document.getElementById("videoUrlInput").value.trim();
      let thumbnail = document.getElementById("thumbnailInput").value.trim();
      const vf = document.getElementById("videoFileInput").files?.[0] || null;
      const tf = document.getElementById("thumbnailFileInput").files?.[0] || null;
      if (!videoUrl && vf) videoUrl = await fileToDataUrl(vf);
      if (!thumbnail && tf) thumbnail = await fileToDataUrl(tf);
      if (!title || !description || !category || !videoUrl || !thumbnail) return msg("Tous les champs sont obligatoires.", true);
      const r = await api("/videos", {
        method: "POST",
        body: JSON.stringify({ title, description, category, videoUrl, thumbnail, publishedAt: new Date().toISOString().slice(0, 10) }),
      });
      if (r?.error) return msg("Publication impossible (Vérifiez votre Backend).", true);
      e.target.reset();
      await refreshAll();
      msg("Video publiee.");
    });

    els.editForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("editId").value.trim();
      const payload = {
        title: document.getElementById("editTitle").value.trim(),
        description: document.getElementById("editDescription").value.trim(),
        category: document.getElementById("editCategory").value,
        videoUrl: document.getElementById("editVideoUrl").value.trim(),
        thumbnail: document.getElementById("editThumbnail").value.trim(),
      };
      const r = await api(`/videos/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) });
      if (r?.error) return msg("Modification impossible.", true);
      await refreshAll();
      msg("Video modifiee.");
    });

    els.cancelEditBtn?.addEventListener("click", () => {
      els.editForm?.classList.add("hidden");
      els.editHint?.classList.remove("hidden");
    });

    els.categoryForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = els.newCategoryInput.value.trim();
      if (!name) return;
      const r = await api("/categories", { method: "POST", body: JSON.stringify({ name }) });
      if (r?.error) return msg("Categorie deja existante ou invalide.", true);
      els.newCategoryInput.value = "";
      await refreshAll();
      msg("Categorie ajoutee.");
    });

    els.presetSelect?.addEventListener("change", () => {
      const p = PRESETS[els.presetSelect.value];
      if (!p) return;
      els.colorPrimary.value = p.colorPrimary;
      els.colorSecondary.value = p.colorSecondary;
      els.colorBgMain.value = p.colorBgMain;
      els.colorBgSoft.value = p.colorBgSoft;
    });

    els.themeForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        preset: els.presetSelect.value,
        logoText: els.logoTextInput.value.trim() || "NEXALOR",
        footerText: els.footerTextInput.value.trim() || "BY YOUNSOUGLUOU",
        colorPrimary: els.colorPrimary.value,
        colorSecondary: els.colorSecondary.value,
        colorBgMain: els.colorBgMain.value,
        colorBgSoft: els.colorBgSoft.value,
      };
      const r = await api("/settings", { method: "PUT", body: JSON.stringify({ settings: payload }) });
      if (r?.error) return msg("Theme non sauvegarde.", true);
      msg("Theme global sauvegarde.");
    });
  }

  async function boot() {
    bindEvents();
    toggleViews();
    
    // On tente de voir si le backend répond, mais on ne bloque plus tout si c'est en erreur
    const health = await api("/health");
    if (health?.error) {
      msg(`Mode Local : Backend indisponible (${API}).`, false);
    } else {
      msg(`Backend connecté : ${API}`);
    }

    if (isConnected()) {
      await refreshAll();
    }
  }

  boot();
})();