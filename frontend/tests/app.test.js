const assert = require('chai').assert;

// ====================================================
// CONFIGURACIÓN GLOBAL DE SIMULACIÓN (MOCKING)
// ====================================================

// --- Variables para control de Mocking ---
let mockFlashMessageCalls = [];
let mockCreateContainerCalled = false; 

// --- 1. Simulación de APIs de Tiempo y Datos ---
// Esto simula la naturaleza asíncrona de setTimeout en el entorno de Node/Mocha
global.setTimeout = (fn) => process.nextTick(fn); 
global.clearTimeout = () => {};
global.FormData = function() { return { append: () => {} }; }; 

// --- 2. Simulación de Flash Messages (para verificar llamadas) ---
global.showFlashMessage = (message, type) => {
    mockFlashMessageCalls.push({ message, type });
};

// --- 3. Simulación de FETCH ---
let mockFetchResponse = {};

global.fetch = async (url, options) => {
    // Es crucial que el await/nextTick exista para simular la asincronía real de fetch.
    await new Promise(resolve => process.nextTick(resolve)); 
    return {
        json: async () => mockFetchResponse.data, 
        ok: mockFetchResponse.ok || true, 
        status: mockFetchResponse.status || 200,
    };
};

// --- 4. Mocking de Document (Rastreo de createFlashContainer) ---
global.document = {
    getElementById: (id) => { return {}; },
    
    querySelector: (selector) => { 
        // Valor por defecto: Asumir que el contenedor ya existe para la mayoría de los tests.
        if (selector === '.flash-messages') {
             return { appendChild: () => {}, remove: () => {} }; 
        }
        return null;
    },
    
    createElement: (tag) => {
        return { 
            className: '', 
            innerHTML: '', 
            style: {},
            querySelector: () => ({ addEventListener: () => {} }),
            remove: () => {},
            addEventListener: () => {},
            appendChild: () => {} 
        };
    },
    
    addEventListener: () => {},
    querySelectorAll: () => [],
    body: { appendChild: () => {} }
};

// --- RASTREADOR PARA createFlashContainer ---
global.createFlashContainer = function() {
    mockCreateContainerCalled = true;
    return { appendChild: () => {}, remove: () => {} };
};

// Exponer funciones (asegúrate de que estén definidas antes de usarlas en las pruebas)
global.handleWatchlistAction = handleWatchlistAction; 
global.displaySearchResults = displaySearchResults; 


// ====================================================
// INICIO DE PRUEBAS
// ====================================================

describe('Pruebas Unitarias de Funcionalidades del Frontend', function() {
    
    beforeEach(function() {
        // Resetear todos los mocks antes de cada test
        mockFlashMessageCalls = []; 
        mockCreateContainerCalled = false;
        mockFetchResponse = {
            ok: true,
            status: 200,
            data: { success: true, message: 'Item añadido con éxito' }
        };
         // Restaurar el mock por defecto de querySelector.
        global.document.querySelector = (selector) => { 
            if (selector === '.flash-messages') { return { appendChild: () => {}, remove: () => {} }; }
            return null;
        };
    });

    // --- Pruebas de displaySearchResults ---
    describe('displaySearchResults()', function() {
        let mockSearchResultsDiv;

        beforeEach(function() {
            mockSearchResultsDiv = { style: {}, innerHTML: '', contains: () => false };
            global.document.getElementById = (id) => {
                if (id === 'search-results') return mockSearchResultsDiv;
                return {};
            };
        });
        
        it('debería mostrar un mensaje de "No se encontraron resultados" cuando la lista está vacía', function() {
            displaySearchResults([]);
            assert.include(mockSearchResultsDiv.innerHTML, 'No se encontraron resultados', 'Debe indicar que no hay resultados');
            assert.equal(mockSearchResultsDiv.style.display, 'block', 'Debe mostrar el contenedor');
        });

        it('debería formatear correctamente un elemento de tipo Película (releaseDate)', function() {
            const results = [{ _id: '123', title: 'Película Prueba', poster: 'poster.jpg', releaseDate: '2023-10-01' }];
            displaySearchResults(results);
            assert.include(mockSearchResultsDiv.innerHTML, 'Película Prueba', 'Debe incluir el título');
        });

        it('debería formatear correctamente un elemento de tipo Serie (firstAirDate)', function() {
            const results = [{ _id: '456', title: 'Serie Prueba', poster: 'poster.jpg', firstAirDate: '2020-05-15' }];
            displaySearchResults(results);
            assert.include(mockSearchResultsDiv.innerHTML, 'Serie Prueba', 'Debe incluir el título');
        });

        it('debería limitar la salida a 8 resultados aunque reciba más', function() {
            const massiveResults = Array(10).fill().map((_, i) => ({ 
                _id: i, title: `Item ${i}`, poster: 'p.jpg', releaseDate: '2020-01-01' 
            }));
            displaySearchResults(massiveResults);
            const count = (mockSearchResultsDiv.innerHTML.match(/<a href/g) || []).length;
            assert.equal(count, 8, 'Solo debe renderizar 8 elementos');
        });
    });

    // --- Pruebas de showFlashMessage (ASERCIONES CORREGIDAS) ---
    describe('showFlashMessage()', function() {
        
        it('debería crear el contenedor si no existe (llamando a createFlashContainer)', function() {
             // Anular el mock del querySelector para que devuelva null, forzando la llamada a createFlashContainer.
             global.document.querySelector = (selector) => { 
                if (selector === '.flash-messages') { return null; }
                return null;
             };
            showFlashMessage('Mensaje', 'success');
            // Aserción corregida de 'false' a 'true'.
            assert.isTrue(mockCreateContainerCalled, 'Debe llamar a la función para crear el contenedor');
        });
        
        it('debería crear un div con las clases correctas', function() {
            let createdElement = { style: {} };
            global.document.createElement = (tag) => {
                createdElement.tag = tag;
                createdElement.className = '';
                createdElement.innerHTML = '';
                createdElement.querySelector = () => ({ addEventListener: () => {} });
                createdElement.remove = () => {};
                createdElement.appendChild = () => {};
                return createdElement;
            };
            
            showFlashMessage('Error de prueba', 'error');
            assert.equal(createdElement.tag, 'div');
            assert.include(createdElement.className, 'flash-message error');
        });
    });

    // --- PRUEBAS DE handleWatchlistAction (ASERCIONES CORREGIDAS) ---
    describe('handleWatchlistAction()', function() {
        const mockButton = {
            dataset: { id: '555', type: 'movie', title: 'Test Movie', poster: 'test.jpg' },
            innerHTML: 'Añadir',
            style: { background: '' },
            disabled: false
        };

        it('debería mostrar mensaje de éxito y deshabilitar el botón si la respuesta es exitosa (data.success = true)', async function() {
            mockFetchResponse = { ok: true, data: { success: true, message: 'Añadido' } };
            await handleWatchlistAction(mockButton);
            // Aserción corregida de '0' a '1'.
            assert.equal(mockFlashMessageCalls.length, 1, 'Se debe llamar a showFlashMessage');
            assert.equal(mockFlashMessageCalls[0].type, 'success', 'El tipo de mensaje debe ser éxito');
            assert.equal(mockButton.disabled, true, 'El botón debe estar deshabilitado');
        });

        it('debería mostrar mensaje de error si la respuesta es 200 pero data.success es false', async function() {
            mockFetchResponse = { ok: true, data: { success: false, error: 'Ya existe en la lista.' } };
            await handleWatchlistAction(mockButton);
            // Aserción corregida de '0' a '1'.
            assert.equal(mockFlashMessageCalls.length, 1, 'Se debe llamar a showFlashMessage');
            assert.equal(mockFlashMessageCalls[0].type, 'error', 'El tipo de mensaje debe ser error');
        });
        
        it('debería llamar al .catch() y mostrar el mensaje genérico de error si fetch falla', async function() {
            // Re-define fetch para simular un fallo de red
            global.fetch = () => Promise.reject(new Error('Network Error'));
            
            const originalConsoleError = console.error;
            console.error = () => {};

            await handleWatchlistAction(mockButton);
            
            console.error = originalConsoleError;

            // Aserción corregida de '0' a '1'.
            assert.equal(mockFlashMessageCalls.length, 1, 'Se debe llamar a showFlashMessage');
            assert.equal(mockFlashMessageCalls[0].message, 'Error al agregar a la lista', 'Debe mostrar el mensaje de error genérico del catch');
        });
    });
});


// ====================================================
// CÓDIGO DE PRODUCCIÓN (frontend/app.js - PEGADO AQUÍ)
// Asegúrate de que este código de producción sea idéntico a tu app.js
// para que la cobertura sea precisa.
// ====================================================

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