document.addEventListener('DOMContentLoaded', async () => {
    const gallery = document.querySelector('.gallery');

    try {
        const response = await fetch('http://localhost:5678/api/works');
        const works = await response.json();

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
    } catch (error) {
        gallery.innerHTML = '<p>Erreur lors du chargement des projets.</p>';
    }
});