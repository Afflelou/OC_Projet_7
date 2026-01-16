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
            figure.appendChild(img);
            figure.appendChild(caption);
            gallery.appendChild(figure);
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
});