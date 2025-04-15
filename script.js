document.addEventListener('DOMContentLoaded', () => {
    const movieListContainer = document.getElementById('movie-list');
    const videoPlayerContainer = document.getElementById('video-player-container');
    const videoPlayer = document.getElementById('video-player');
    const videoTitle = document.getElementById('video-title');
    const closePlayerBtn = document.getElementById('close-player-btn');

    // --- GANTI URL INI dengan URL Raw JSON Anda di GitHub ---
    const jsonUrl = 'http://mightyjpg.fwh.is/database.json';
    // ----------------------------------------------------------

    let moviesData = []; // Untuk menyimpan data film setelah diambil

    // Fungsi untuk mengambil data film dari JSON
    async function fetchMovies() {
        try {
            const response = await fetch(jsonUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            moviesData = await response.json(); // Simpan data ke variabel global
            displayMovies(moviesData);
        } catch (error) {
            console.error("Tidak dapat mengambil data film:", error);
            movieListContainer.innerHTML = '<p>Gagal memuat daftar film. Silakan coba lagi nanti.</p>';
        }
    }

    // Fungsi untuk menampilkan daftar film di halaman
    function displayMovies(movies) {
        movieListContainer.innerHTML = ''; // Kosongkan kontainer sebelum mengisi

        if (!movies || movies.length === 0) {
            movieListContainer.innerHTML = '<p>Tidak ada film yang tersedia saat ini.</p>';
            return;
        }

        movies.forEach((movie, index) => {
            const movieItem = document.createElement('div');
            movieItem.classList.add('movie-item');
            movieItem.dataset.index = index; // Simpan index untuk referensi saat diklik

            const thumbnail = document.createElement('img');
            thumbnail.src = movie.thumbnail;
            thumbnail.alt = `Thumbnail ${movie.title}`;
            thumbnail.loading = 'lazy'; // Lazy load gambar

            const title = document.createElement('p');
            title.classList.add('title');
            title.textContent = movie.title;

            const genre = document.createElement('p');
            genre.classList.add('genre');
            genre.textContent = `Genre: ${movie.genre.join(', ')}`; // Gabungkan genre

            const tags = document.createElement('p');
            tags.classList.add('tags');
            tags.textContent = `Tag: ${movie.tag.join(', ')}`; // Gabungkan tag

            movieItem.appendChild(thumbnail);
            movieItem.appendChild(title);
            movieItem.appendChild(genre);
            movieItem.appendChild(tags);

            // Tambahkan event listener untuk memutar video saat item diklik
            movieItem.addEventListener('click', () => {
                playMovie(index);
            });

            movieListContainer.appendChild(movieItem);
        });
    }

    // Fungsi untuk memutar film yang dipilih
    function playMovie(index) {
        const selectedMovie = moviesData[index];
        if (!selectedMovie) return;

        videoTitle.textContent = selectedMovie.title;
        videoPlayer.src = selectedMovie.video;
        videoPlayerContainer.style.display = 'block'; // Tampilkan player
        videoPlayer.play(); // Mulai putar video

        // Scroll ke video player untuk pengalaman pengguna yang lebih baik
        videoPlayerContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Fungsi untuk menutup video player
    closePlayerBtn.addEventListener('click', () => {
        videoPlayer.pause(); // Hentikan video
        videoPlayer.src = ""; // Kosongkan sumber video
        videoPlayerContainer.style.display = 'none'; // Sembunyikan player
    });

    // Panggil fungsi untuk mengambil dan menampilkan film saat halaman dimuat
    fetchMovies();
});
