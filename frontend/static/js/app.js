// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
    initializeHeroSlider();
    initializeWatchlistButtons();
    initializeStarRating();
});

// Search with debounce
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    if (!searchInput || !searchResults) return;
    
    let timeoutId;
    
    searchInput.addEventListener('input', function(e) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            const query = e.target.value.trim();
            if (query.length < 2) {
                searchResults.style.display = 'none';
                return;
            }
            
            fetch(`/api/search?q=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(results => {
                    displaySearchResults(results);
                })
                .catch(error => {
                    console.error('Search error:', error);
                });
        }, 300);
    });
    
    // Hide results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('search-results');
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No se encontraron resultados</div>';
        searchResults.style.display = 'block';
        return;
    }
    
    const html = results.slice(0, 8).map(item => `
        <a href="/${'releaseDate' in item ? 'movie' : 'tvshow'}/${item._id}" class="search-result-item">
            <img src="${item.poster}" alt="${item.title}">
            <div class="search-result-info">
                <h4>${item.title}</h4>
                <span>${'releaseDate' in item ? 'Película' : 'Serie'} • ${('releaseDate' in item ? item.releaseDate : item.firstAirDate).substring(0,4)}</span>
            </div>
        </a>
    `).join('');
    
    searchResults.innerHTML = html;
    searchResults.style.display = 'block';
}

// Hero Slider
function initializeHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const prevBtn = document.querySelector('.hero-prev');
    const nextBtn = document.querySelector('.hero-next');
    
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
        currentSlide = index;
    }
    
    function nextSlide() {
        let next = currentSlide + 1;
        if (next >= slides.length) next = 0;
        showSlide(next);
    }
    
    function prevSlide() {
        let prev = currentSlide - 1;
        if (prev < 0) prev = slides.length - 1;
        showSlide(prev);
    }
    
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    
    // Auto-advance slides
    setInterval(nextSlide, 5000);
}

// Watchlist functionality
function initializeWatchlistButtons() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.watchlist-btn')) {
            e.preventDefault();
            const button = e.target.closest('.watchlist-btn');
            handleWatchlistAction(button);
        }
    });
}

function handleWatchlistAction(button) {
    const itemId = button.dataset.id;
    const itemType = button.dataset.type;
    const title = button.dataset.title;
    const poster = button.dataset.poster;
    
    const formData = new FormData();
    formData.append('itemId', itemId);
    formData.append('itemType', itemType);
    formData.append('title', title);
    formData.append('poster', poster);
    
    fetch('/watchlist/add', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showFlashMessage(data.message, 'success');
            // Update button state
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.style.background = 'var(--success)';
            button.disabled = true;
        } else {
            showFlashMessage(data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showFlashMessage('Error al agregar a la lista', 'error');
    });
}

// Star Rating
function initializeStarRating() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.stars label')) {
            const label = e.target.closest('label');
            const input = document.getElementById(label.htmlFor);
            const stars = input.closest('.stars');
            
            // Update visual state
            stars.querySelectorAll('label').forEach(l => {
                l.style.color = '#6b7280';
            });
            
            let current = label;
            while (current) {
                current.style.color = '#ffc107';
                current = current.previousElementSibling;
            }
        }
    });
}

// Flash Messages
function showFlashMessage(message, type) {
    const flashContainer = document.querySelector('.flash-messages') || createFlashContainer();
    
    const flashMessage = document.createElement('div');
    flashMessage.className = `flash-message ${type}`;
    flashMessage.innerHTML = `
        ${message}
        <button class="flash-close">&times;</button>
    `;
    
    flashContainer.appendChild(flashMessage);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (flashMessage.parentElement) {
            flashMessage.remove();
        }
    }, 5000);
    
    // Close button
    flashMessage.querySelector('.flash-close').addEventListener('click', function() {
        flashMessage.remove();
    });
}

function createFlashContainer() {
    const container = document.createElement('div');
    container.className = 'flash-messages';
    document.body.appendChild(container);
    return container;
}

// Utility function for API calls
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}