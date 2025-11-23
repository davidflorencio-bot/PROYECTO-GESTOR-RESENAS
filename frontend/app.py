import os
import requests
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Cliente para comunicarse con el backend
class BackendClient:
    def __init__(self, base_url):
        self.base_url = base_url
        self.headers = {}
    
    def set_token(self, token):
        self.headers['Authorization'] = f'Bearer {token}'
    
    def clear_token(self):
        self.headers.pop('Authorization', None)
    
    def get(self, endpoint, params=None):
        try:
            response = requests.get(
                f"{self.base_url}/{endpoint}",
                params=params,
                headers=self.headers,
                timeout=10
            )
            return response
        except requests.exceptions.RequestException as e:
            print(f"Error en GET {endpoint}: {e}")
            return None
    
    def post(self, endpoint, data=None):
        try:
            response = requests.post(
                f"{self.base_url}/{endpoint}",
                json=data,
                headers=self.headers,
                timeout=10
            )
            return response
        except requests.exceptions.RequestException as e:
            print(f"Error en POST {endpoint}: {e}")
            return None
    
    def put(self, endpoint, data=None):
        try:
            response = requests.put(
                f"{self.base_url}/{endpoint}",
                json=data,
                headers=self.headers,
                timeout=10
            )
            return response
        except requests.exceptions.RequestException as e:
            print(f"Error en PUT {endpoint}: {e}")
            return None
    
    def delete(self, endpoint):
        try:
            response = requests.delete(
                f"{self.base_url}/{endpoint}",
                headers=self.headers,
                timeout=10
            )
            return response
        except requests.exceptions.RequestException as e:
            print(f"Error en DELETE {endpoint}: {e}")
            return None

# Inicializar cliente del backend
backend = BackendClient(app.config['BACKEND_URL'])

# Middleware para verificar autenticación
@app.before_request
def before_request():
    if 'token' in session:
        backend.set_token(session['token'])

# Helper functions
def is_logged_in():
    return 'user' in session

def get_user_data():
    return session.get('user', {})

# Rutas principales
@app.route('/')
def index():
    try:
        # Obtener películas aleatorias para el hero
        movies_response = backend.get('movies/random?limit=5')
        hero_movies = movies_response.json() if movies_response and movies_response.status_code == 200 else []
        
        # Obtener películas populares
        movies_popular = backend.get('movies?sort=rating&limit=12')
        popular_movies = movies_popular.json().get('movies', []) if movies_popular and movies_popular.status_code == 200 else []
        
        # Obtener series populares
        tvshows_popular = backend.get('tvshows?sort=rating&limit=12')
        popular_tvshows = tvshows_popular.json().get('tvshows', []) if tvshows_popular and tvshows_popular.status_code == 200 else []
        
        return render_template('index.html', 
                             hero_movies=hero_movies,
                             popular_movies=popular_movies,
                             popular_tvshows=popular_tvshows,
                             user=get_user_data())
    except Exception as e:
        print(f"Error en index: {e}")
        return render_template('index.html', 
                             hero_movies=[],
                             popular_movies=[],
                             popular_tvshows=[],
                             user=get_user_data())

@app.route('/movie/<id>')
def movie_detail(id):
    try:
        # Obtener detalles de la película
        movie_response = backend.get(f'movies/{id}')
        if not movie_response or movie_response.status_code != 200:
            flash('Película no encontrada', 'error')
            return redirect(url_for('index'))
        
        movie = movie_response.json()
        
        # Obtener reseñas de la película
        reviews_response = backend.get(f'reviews/movie/{id}')
        reviews_data = reviews_response.json() if reviews_response and reviews_response.status_code == 200 else {}
        reviews = reviews_data.get('reviews', [])
        
        return render_template('movie.html', 
                             movie=movie,
                             reviews=reviews,
                             user=get_user_data())
    except Exception as e:
        print(f"Error en movie_detail: {e}")
        flash('Error al cargar la película', 'error')
        return redirect(url_for('index'))

@app.route('/tvshow/<id>')
def tvshow_detail(id):
    try:
        # Obtener detalles de la serie
        tvshow_response = backend.get(f'tvshows/{id}')
        if not tvshow_response or tvshow_response.status_code != 200:
            flash('Serie no encontrada', 'error')
            return redirect(url_for('index'))
        
        tvshow = tvshow_response.json()
        
        # Obtener reseñas de la serie
        reviews_response = backend.get(f'reviews/movie/{id}')
        reviews_data = reviews_response.json() if reviews_response and reviews_response.status_code == 200 else {}
        reviews = reviews_data.get('reviews', [])
        
        return render_template('tvshow.html', 
                             tvshow=tvshow,
                             reviews=reviews,
                             user=get_user_data())
    except Exception as e:
        print(f"Error en tvshow_detail: {e}")
        flash('Error al cargar la serie', 'error')
        return redirect(url_for('index'))

# Autenticación
@app.route('/login', methods=['GET', 'POST'])
def login():
    if is_logged_in():
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        response = backend.post('auth/login', {
            'email': email,
            'password': password
        })
        
        if response and response.status_code == 200:
            data = response.json()
            session['token'] = data['token']
            session['user'] = data['data']['user']
            flash('¡Inicio de sesión exitoso!', 'success')
            return redirect(url_for('index'))
        else:
            error_msg = 'Credenciales incorrectas'
            if response and response.status_code == 401:
                error_msg = response.json().get('error', 'Credenciales incorrectas')
            flash(error_msg, 'error')
    
    return render_template('login.html', user=get_user_data())

@app.route('/register', methods=['GET', 'POST'])
def register():
    if is_logged_in():
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        password_confirm = request.form.get('password_confirm')
        
        response = backend.post('auth/register', {
            'username': username,
            'email': email,
            'password': password,
            'passwordConfirm': password_confirm
        })
        
        if response and response.status_code == 201:
            data = response.json()
            session['token'] = data['token']
            session['user'] = data['data']['user']
            flash('¡Registro exitoso! Bienvenido/a', 'success')
            return redirect(url_for('index'))
        else:
            error_msg = 'Error en el registro'
            if response and response.status_code == 400:
                error_msg = response.json().get('error', 'Error en el registro')
            flash(error_msg, 'error')
    
    return render_template('register.html', user=get_user_data())

@app.route('/logout')
def logout():
    session.clear()
    backend.clear_token()
    flash('¡Sesión cerrada correctamente!', 'success')
    return redirect(url_for('index'))

# Perfil de usuario
@app.route('/profile')
def profile():
    if not is_logged_in():
        return redirect(url_for('login'))
    
    try:
        # Obtener reseñas del usuario
        reviews_response = backend.get('reviews/user/my-reviews')
        reviews_data = reviews_response.json() if reviews_response and reviews_response.status_code == 200 else {}
        reviews = reviews_data.get('reviews', [])
        
        # Obtener watchlist
        watchlist_response = backend.get('auth/watchlist')
        watchlist_data = watchlist_response.json() if watchlist_response and watchlist_response.status_code == 200 else {}
        watchlist = watchlist_data.get('data', {}).get('watchlist', [])
        
        return render_template('profile.html', 
                             user=get_user_data(),
                             reviews=reviews,
                             watchlist=watchlist)
    except Exception as e:
        print(f"Error en profile: {e}")
        return render_template('profile.html', 
                             user=get_user_data(),
                             reviews=[],
                             watchlist=[])

@app.route('/account', methods=['GET', 'POST'])
def account():
    if not is_logged_in():
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        username = request.form.get('username')
        avatar = request.form.get('avatar')
        
        response = backend.patch('auth/updateMe', {
            'username': username,
            'avatar': avatar
        })
        
        if response and response.status_code == 200:
            data = response.json()
            session['user'] = data['data']['user']
            flash('¡Perfil actualizado correctamente!', 'success')
            return redirect(url_for('profile'))
        else:
            flash('Error al actualizar el perfil', 'error')
    
    return render_template('account.html', user=get_user_data())

# Reseñas
@app.route('/review/add', methods=['POST'])
def add_review():
    if not is_logged_in():
        return jsonify({'error': 'Debes iniciar sesión'}), 401
    
    movie_id = request.form.get('movieId')
    item_type = request.form.get('itemType')
    text = request.form.get('text')
    rating = request.form.get('rating')
    
    response = backend.post('reviews', {
        'movieId': movie_id,
        'itemType': item_type,
        'text': text,
        'rating': int(rating)
    })
    
    if response and response.status_code == 201:
        flash('¡Reseña agregada correctamente!', 'success')
    else:
        error_msg = 'Error al agregar reseña'
        if response:
            error_msg = response.json().get('error', error_msg)
        flash(error_msg, 'error')
    
    if item_type == 'Movie':
        return redirect(url_for('movie_detail', id=movie_id))
    else:
        return redirect(url_for('tvshow_detail', id=movie_id))

@app.route('/review/delete/<id>', methods=['POST'])
def delete_review(id):
    if not is_logged_in():
        return jsonify({'error': 'Debes iniciar sesión'}), 401
    
    response = backend.delete(f'reviews/{id}')
    
    if response and response.status_code == 200:
        flash('Reseña eliminada correctamente', 'success')
    else:
        flash('Error al eliminar la reseña', 'error')
    
    return redirect(url_for('profile'))

# Watchlist
@app.route('/watchlist/add', methods=['POST'])
def add_to_watchlist():
    if not is_logged_in():
        return jsonify({'error': 'Debes iniciar sesión'}), 401
    
    item_id = request.form.get('itemId')
    item_type = request.form.get('itemType')
    title = request.form.get('title')
    poster = request.form.get('poster')
    
    response = backend.post('auth/watchlist', {
        'itemId': item_id,
        'itemType': item_type,
        'title': title,
        'poster': poster
    })
    
    if response and response.status_code == 200:
        return jsonify({'success': True, 'message': 'Agregado a tu lista'})
    else:
        error_msg = 'Error al agregar a la lista'
        if response:
            error_msg = response.json().get('error', error_msg)
        return jsonify({'success': False, 'error': error_msg})

@app.route('/watchlist/remove', methods=['POST'])
def remove_from_watchlist():
    if not is_logged_in():
        return jsonify({'error': 'Debes iniciar sesión'}), 401
    
    item_id = request.form.get('itemId')
    item_type = request.form.get('itemType')
    
    response = backend.delete('auth/watchlist', {
        'itemId': item_id,
        'itemType': item_type
    })
    
    if response and response.status_code == 200:
        return jsonify({'success': True, 'message': 'Removido de tu lista'})
    else:
        return jsonify({'success': False, 'error': 'Error al remover'})

# Búsqueda y filtros
@app.route('/search')
def search():
    query = request.args.get('q', '')
    content_type = request.args.get('type', 'all')
    
    results = []
    if query:
        try:
            if content_type in ['all', 'movies']:
                movies_response = backend.get('movies', {'search': query, 'limit': 20})
                if movies_response and movies_response.status_code == 200:
                    results.extend(movies_response.json().get('movies', []))
            
            if content_type in ['all', 'tvshows']:
                tvshows_response = backend.get('tvshows', {'search': query, 'limit': 20})
                if tvshows_response and tvshows_response.status_code == 200:
                    results.extend(tvshows_response.json().get('tvshows', []))
        except Exception as e:
            print(f"Error en búsqueda: {e}")
    
    return render_template('view_all.html', 
                         items=results,
                         title=f"Resultados para: {query}",
                         user=get_user_data())

@app.route('/movies')
def view_movies():
    genre = request.args.get('genre', '')
    platform = request.args.get('platform', '')
    sort = request.args.get('sort', 'release_date')
    year = request.args.get('year', '')
    
    params = {'limit': 40}
    if genre: params['genre'] = genre
    if platform: params['platform'] = platform
    if sort: params['sort'] = sort
    if year: params['year'] = year
    
    movies_response = backend.get('movies', params)
    movies = movies_response.json().get('movies', []) if movies_response and movies_response.status_code == 200 else []
    
    # Obtener géneros para los filtros
    genres_response = backend.get('movies/genres')
    genres = genres_response.json() if genres_response and genres_response.status_code == 200 else []
    
    return render_template('view_all.html',
                         items=movies,
                         title="Todas las Películas",
                         genres=genres,
                         user=get_user_data())

@app.route('/tvshows')
def view_tvshows():
    genre = request.args.get('genre', '')
    platform = request.args.get('platform', '')
    sort = request.args.get('sort', 'release_date')
    year = request.args.get('year', '')
    
    params = {'limit': 40}
    if genre: params['genre'] = genre
    if platform: params['platform'] = platform
    if sort: params['sort'] = sort
    if year: params['year'] = year
    
    tvshows_response = backend.get('tvshows', params)
    tvshows = tvshows_response.json().get('tvshows', []) if tvshows_response and tvshows_response.status_code == 200 else []
    
    # Obtener géneros para los filtros
    genres_response = backend.get('tvshows/genres')
    genres = genres_response.json() if genres_response and genres_response.status_code == 200 else []
    
    return render_template('view_all.html',
                         items=tvshows,
                         title="Todas las Series",
                         genres=genres,
                         user=get_user_data())

# API helpers para AJAX
@app.route('/api/search')
def api_search():
    query = request.args.get('q', '')
    results = []
    
    if query:
        try:
            movies_response = backend.get('movies', {'search': query, 'limit': 5})
            if movies_response and movies_response.status_code == 200:
                results.extend(movies_response.json().get('movies', []))
            
            tvshows_response = backend.get('tvshows', {'search': query, 'limit': 5})
            if tvshows_response and tvshows_response.status_code == 200:
                results.extend(tvshows_response.json().get('tvshows', []))
        except Exception as e:
            print(f"Error en búsqueda API: {e}")
    
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=app.config['DEBUG'], port=3000)