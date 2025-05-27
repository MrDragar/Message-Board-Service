document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(searchForm);
            const params = new URLSearchParams();
            
            for (const [key, value] of formData.entries()) {
                if (value) params.append(key, value);
            }
            
            try {
                const response = await fetch(`/search?${params.toString()}`);
                const ads = await response.json();
                
                const resultsContainer = document.getElementById('search-results');
                resultsContainer.innerHTML = '';
                
                if (ads.length === 0) {
                    resultsContainer.innerHTML = '<p>Ничего не найдено</p>';
                    return;
                }
                
                ads.forEach(ad => {
                    const adElement = document.createElement('div');
                    adElement.className = 'bg-white p-4 rounded shadow mb-4';
                    adElement.innerHTML = `
                        <h3 class="text-xl font-semibold">${ad.title}</h3>
                        <p>${ad.content}</p>
                        <p><strong>Статус:</strong> ${ad.status}</p>
                        <a href="/advertisement/${ad.id}" class="text-blue-600 hover:underline">Подробнее</a>
                    `;
                    resultsContainer.appendChild(adElement);
                });
            } catch (error) {
                console.error('Ошибка поиска:', error);
            }
        });
    }
});