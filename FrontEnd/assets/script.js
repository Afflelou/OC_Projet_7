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
        const modalGallery = document.getElementById('modal-gallery');
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
                        // Supprime la figure de la modale
                        const workId = figure.dataset.workid;
                        figure.remove();
                        const workFigure = document.querySelector(`.gallery figure[data-workid="${workId}"]`);
                        workFigure.remove();
                    }
                    else {
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

    // Récupère les filtres
    try {
        const response = await fetch('http://localhost:5678/api/categories');
        const categories = await response.json();

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
        editModeText.style.display = 'block';
        loginBtn.textContent = 'logout';
        loginBtn.href = '#';
        loginBtn.addEventListener('click', function (e) {
            localStorage.removeItem('token');
            filters.style.display = 'inline-block';
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
    const closeModal = document.getElementById('close-modal');

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
});