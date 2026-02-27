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
        const separator = document.querySelector('.separator');

        // Affiche la galerie
        modalTitle.textContent = 'Galerie photo';
        modalGallery.style.display = 'grid';
        addPhotoBtn.style.display = 'flex';
        addPhotoForm.style.display = 'none';
        backBtn.style.display = 'none';
        separator.style.display = 'flex';
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
            trash.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="12" width="12" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="rgb(255, 255, 255)" d="M232.7 69.9C237.1 56.8 249.3 48 263.1 48L377 48C390.8 48 403 56.8 407.4 69.9L416 96L512 96C529.7 96 544 110.3 544 128C544 145.7 529.7 160 512 160L128 160C110.3 160 96 145.7 96 128C96 110.3 110.3 96 128 96L224 96L232.7 69.9zM128 208L512 208L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 208zM216 272C202.7 272 192 282.7 192 296L192 488C192 501.3 202.7 512 216 512C229.3 512 240 501.3 240 488L240 296C240 282.7 229.3 272 216 272zM320 272C306.7 272 296 282.7 296 296L296 488C296 501.3 306.7 512 320 512C333.3 512 344 501.3 344 488L344 296C344 282.7 333.3 272 320 272zM424 272C410.7 272 400 282.7 400 296L400 488C400 501.3 410.7 512 424 512C437.3 512 448 501.3 448 488L448 296C448 282.7 437.3 272 424 272z"/></svg>`;
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
        const separator = document.querySelector('.separator');

        modalTitle.textContent = 'Ajout photo';
        modalGallery.style.display = 'none';
        addPhotoBtn.style.display = 'none';
        addPhotoForm.style.display = 'flex';
        backBtn.style.display = 'flex';
        separator.style.display = 'none';
    }

    // Preview image
    const photoInput = document.getElementById('photo-input');
    const photoPreview = document.getElementById('photo-preview');
    const photoLabel = document.querySelector('.add-photo-label');
    const fileFormatInfo = document.getElementById('file-format');
    if (photoInput && photoPreview && photoLabel) {
        photoInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (evt) {
                    photoPreview.src = evt.target.result;
                    photoPreview.style.display = 'flex';
                    fileFormatInfo.style.display = 'none';
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
            fileFormatInfo.style.display = 'block';
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
        editBtn.style.display = 'flex';
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
            if (modalOverlay) modalOverlay.style.display = 'flex';
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
            const submitBtn = document.getElementById('submit-add-photo');
            const file = photoInput.files[0];
            const title = titleInput.value.trim();
            const category = categorySelect.value;
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
                    submitBtn.style.backgroundColor = '#A7A7A7';
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

    // Active le bouton Valider si tous les champs sont remplis
    const titleInput = document.getElementById('title-input');
    const categorySelect = document.getElementById('category-input');
    const submitBtn = document.getElementById('submit-add-photo');
    function checkFormValidity() {
        if (photoInput.files.length > 0 && titleInput.value.trim() !== '' && categorySelect.value !== '') {
            submitBtn.disabled = false;
            submitBtn.style.backgroundColor = '#1D6154';
        } else {
            submitBtn.disabled = true;
            submitBtn.style.backgroundColor = '#A7A7A7';
        }
    }
    titleInput.addEventListener('input', checkFormValidity);
    categorySelect.addEventListener('change', checkFormValidity);
    photoInput.addEventListener('change', checkFormValidity);
});