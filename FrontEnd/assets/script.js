document.addEventListener('DOMContentLoaded', async () => {
    const gallery = document.querySelector('.gallery');
    const filtersContainer = document.getElementById('filters');
    let allWorks = [];

    // Affiche works
    function displayWorks(works) {

        gallery.innerHTML = '';
        works.forEach(work => {
            const figure = document.createElement('figure');
            const img = document.createElement('img');
            img.src = work.imageUrl;
            img.alt = work.title;
            const caption = document.createElement('figcaption');
            caption.textContent = work.title;
            figure.classList.add('gallery-figure');
            figure.dataset.workid = work.id;
            figure.appendChild(img);
            figure.appendChild(caption);
            gallery.appendChild(figure);
        });
    }

    // Affiche works dans la modale
    function displayModalGallery(works) {
        const modalTitle = document.getElementById('modal-title');
        const modalGallery = document.getElementById('modal-gallery');
        const addPhotoBtn = document.getElementById('add-photo');
        const addPhotoForm = document.getElementById('add-photo-form');
        const backBtn = document.getElementById('back-to-gallery');

        // Affiche la galerie
        modalTitle.textContent = 'Galerie photo';
        modalGallery.style.display = 'grid';
        addPhotoBtn.style.display = 'block';
        addPhotoForm.style.display = 'none';
        backBtn.style.display = 'none';
        modalGallery.innerHTML = '';
        works.forEach(work => {
            // Crée une figure pour chaque work
            const figure = document.createElement('figure');
            figure.classList.add('modal-figure');

            // Ajoute l'image du work
            const img = document.createElement('img');
            img.src = work.imageUrl;

            // Ajoute l'ID du work à la figure
            figure.dataset.workid = work.id;

            // Icône corbeille (SVG)
            const trash = document.createElement('span');
            trash.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
            trash.classList.add('trash-icon');
            // Suppression du work de la liste affichée
            trash.addEventListener('click', async (event) => {
                event.stopPropagation();
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Vous devez être connecté pour supprimer un projet.');
                    return;
                }
                try {
                    const response = await fetch(`http://localhost:5678/api/works/${work.id}`, {
                        method: 'DELETE',
                        headers: {
                            accept: 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (response.ok) {
                        figure.remove();
                        const workFigure = document.querySelector(`.gallery figure[data-workid="${work.id}"]`);
                        if (workFigure) workFigure.remove();
                        allWorks = allWorks.filter(w => w.id !== work.id);
                    } else {
                        throw new Error('Erreur lors de la suppression du projet.');
                    }
                } catch (error) {
                    alert('Erreur réseau');
                }
            });
            figure.appendChild(img);
            figure.appendChild(trash);
            modalGallery.appendChild(figure);
        });
    }

    // Affiche la modale d'ajout de photo
    function showAddPhotoModal() {
        const modalTitle = document.getElementById('modal-title');
        const modalGallery = document.getElementById('modal-gallery');
        const addPhotoBtn = document.getElementById('add-photo');
        const addPhotoForm = document.getElementById('add-photo-form');
        const backBtn = document.getElementById('back-to-gallery');

        modalTitle.textContent = 'Ajout photo';
        modalGallery.style.display = 'none';
        addPhotoBtn.style.display = 'none';
        addPhotoForm.style.display = 'block';
        backBtn.style.display = 'block';
    }

    // Preview image
    const photoInput = document.getElementById('photo-input');
    const photoPreview = document.getElementById('photo-preview');
    const photoLabel = document.querySelector('.add-photo-label');
    if (photoInput && photoPreview && photoLabel) {
        photoInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (evt) {
                    photoPreview.src = evt.target.result;
                    photoPreview.style.display = 'block';
                    photoLabel.style.display = 'none';
                };
                reader.readAsDataURL(file);
            } else {
                photoPreview.src = '';
                photoPreview.style.display = 'none';
                photoLabel.style.display = 'flex';
            }
        });
        // Si on clique sur la preview, on peut rechoisir une image
        photoPreview.addEventListener('click', function () {
            photoInput.value = '';
            photoPreview.src = '';
            photoPreview.style.display = 'none';
            photoLabel.style.display = 'flex';
        });
    }

    // Récupère les filtres et les catégories pour le formulaire d'ajout
    let categories = [];
    try {
        const response = await fetch('http://localhost:5678/api/categories');
        categories = await response.json();

        const allBtn = document.createElement('p');
        allBtn.className = 'filter-button';
        allBtn.textContent = 'Tous';
        allBtn.dataset.id = 'all';
        filtersContainer.appendChild(allBtn);

        categories.forEach(category => {
            const btn = document.createElement('p');
            btn.className = 'filter-button';
            btn.textContent = category.name;
            btn.dataset.id = category.id;
            filtersContainer.appendChild(btn);
        });

        // Remplit la liste déroulante des catégories dans le formulaire d'ajout
        const categorySelect = document.createElement('select');
        categorySelect.id = 'category-input';
        categorySelect.name = 'category';
        categorySelect.required = true;
        // Option vide sélectionnable par défaut
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '';
        emptyOption.selected = true;
        categorySelect.appendChild(emptyOption);
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
        // Ajoute le select à la suite du #category-title
        const addPhotoForm = document.getElementById('add-photo-form');
        const categoryTitle = document.getElementById('category-title');
        if (addPhotoForm && categoryTitle) {
            addPhotoForm.insertBefore(categorySelect, categoryTitle.nextSibling);
        }
    } catch (error) {
        filtersContainer.innerHTML = '<p>Erreur lors du chargement des filtres.</p>';
    }

    // Récupère les works
    try {
        const response = await fetch('http://localhost:5678/api/works');
        allWorks = await response.json();
        displayWorks(allWorks);
    } catch (error) {
        gallery.innerHTML = '<p>Erreur lors du chargement des projets.</p>';
    }

    // Click filtres
    filtersContainer.addEventListener('click', (e) => {
        // Si le clic est sur un bouton de filtre
        if (e.target.classList.contains('filter-button')) {
            const categoryId = e.target.dataset.id;
            // Si click sur "Tous"
            if (categoryId === 'all') {
                displayWorks(allWorks);
            } else {
                // Affiche works filtrés
                const filteredWorks = allWorks.filter(work => work.categoryId == categoryId);
                displayWorks(filteredWorks);
            }
        }
    });

    // Gère l'état de connexion
    const loginBtn = document.getElementById('login-btn');
    const filters = document.getElementById('filters');
    const editBtn = document.getElementById('edit-btn');
    const editModeText = document.getElementById('edit-mode');

    // Si token présent, affiche mode édition
    if (localStorage.getItem('token')) {
        filters.style.display = 'none';
        editBtn.style.display = 'inline-block';
        editModeText.style.display = 'flex';
        loginBtn.textContent = 'logout';
        loginBtn.href = '#';
        loginBtn.addEventListener('click', function (e) {
            localStorage.removeItem('token');
            filters.style.display = '';
            editBtn.style.display = 'none';
            editModeText.style.display = 'none';
            loginBtn.textContent = 'login';
            loginBtn.href = 'index.html';
        });
    }
    // Sinon, affiche mode visiteur
    else {
        filters.style.display = '';
        editBtn.style.display = 'none';
        editModeText.style.display = 'none';
        loginBtn.textContent = 'login';
        loginBtn.href = 'login.html';
    }

    // Overlay modale
    const modalOverlay = document.getElementById('modal-overlay');
    const addBtn = document.getElementById('add-photo');
    const closeModal = document.getElementById('close-modal');
    const backBtn = document.getElementById('back-to-gallery');

    // Ouvre modale d'ajout
    if (addBtn) {
        addBtn.addEventListener('click', function () {
            showAddPhotoModal();
        });
    }
    if (backBtn) {
        backBtn.addEventListener('click', function () {
            displayModalGallery(allWorks);
        });
    }
    if (editBtn) {
        editBtn.addEventListener('click', function () {
            if (modalOverlay) modalOverlay.style.display = 'block';
            displayModalGallery(allWorks);

        });
    }
    // Fermer la modale en cliquant sur le bouton de fermeture
    if (closeModal) {
        closeModal.addEventListener('click', function () {
            if (modalOverlay) modalOverlay.style.display = 'none';
        });
    }
    // Fermer la modale en cliquant en dehors du contenu
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function (e) {
            if (e.target === modalOverlay) modalOverlay.style.display = 'none';
        });
    }

    // Gestion de l'envoi du formulaire d'ajout de photo
    const addPhotoForm = document.getElementById('add-photo-form');
    if (addPhotoForm) {
        addPhotoForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const photoInput = document.getElementById('photo-input');
            const titleInput = document.getElementById('title-input');
            const categorySelect = document.getElementById('category-input');
            const file = photoInput.files[0];
            const title = titleInput.value.trim();
            const category = categorySelect.value;
            if (!file || !title || !category) {
                alert('Veuillez remplir tous les champs.');
                return;
            }
            const formData = new FormData();
            formData.append('image', file);
            formData.append('title', title);
            formData.append('category', category);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5678/api/works', {
                    method: 'POST',
                    headers: token ? { 'accept': 'application/json', 'Authorization': `Bearer ${token}` } : { 'accept': 'application/json' },
                    body: formData
                });
                if (response.ok) {
                    const newWork = await response.json();
                    allWorks.push(newWork);
                    displayModalGallery(allWorks);
                    displayWorks(allWorks);
                    categorySelect.value = '';
                    titleInput.value = '';
                    photoInput.value = '';
                    const photoPreview = document.getElementById('photo-preview');
                    const photoLabel = document.querySelector('.add-photo-label');
                    if (photoPreview && photoLabel) {
                        photoPreview.src = '';
                        photoPreview.style.display = 'none';
                        photoLabel.style.display = 'flex';
                    }
                } else {
                    alert('Erreur lors de l\'ajout de la photo.');
                }
            } catch (error) {
                alert('Erreur réseau lors de l\'ajout de la photo.');
            }
        });
    }
});