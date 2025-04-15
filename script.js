document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen DOM ---
    const movieListContainer = document.getElementById('movie-list');
    const videoPlayerContainer = document.getElementById('video-player-container');
    const videoPlayer = document.getElementById('video-player');
    const videoTitle = document.getElementById('video-title');
    const closePlayerBtn = document.getElementById('close-player-btn');
    const searchInput = document.getElementById('search-input');
    const genreFilter = document.getElementById('genre-filter');
    const paginationControls = document.getElementById('pagination-controls');

    // --- Konfigurasi & State ---
    const jsonUrl = 'https://filter.mytopup.my.id/database.json'; // <-- GANTI URL INI!
    let allMoviesData = []; // Menyimpan semua data film asli
    let currentPage = 1;
    const itemsPerPage = 8; // Jumlah film per halaman

    // --- Fungsi Utama ---

    // 1. Ambil Data Film dari JSON
    async function fetchMovies() {
        movieListContainer.innerHTML = '<p>Memuat daftar film...</p>'; // Tampilkan pesan loading
        try {
            const response = await fetch(jsonUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allMoviesData = await response.json();
            populateGenreFilter(allMoviesData); // Isi dropdown genre
            renderPage(); // Tampilkan halaman pertama
        } catch (error) {
            console.error("Tidak dapat mengambil data film:", error);
            movieListContainer.innerHTML = '<p>Gagal memuat daftar film. Silakan coba lagi nanti.</p>';
        }
    }

    // 2. Isi Opsi Filter Genre
    function populateGenreFilter(movies) {
        const genres = new Set(); // Gunakan Set untuk otomatis mendapatkan genre unik
        movies.forEach(movie => {
            movie.genre.forEach(g => genres.add(g));
        });

        // Urutkan genre (opsional)
        const sortedGenres = Array.from(genres).sort();

        sortedGenres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreFilter.appendChild(option);
        });
    }

    // 3. Render Ulang Halaman (Filter, Paginate, Display)
    function renderPage() {
        // a. Dapatkan nilai filter & pencarian saat ini
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedGenre = genreFilter.value;

        // b. Filter data film
        let filteredMovies = allMoviesData.filter(movie => {
            // Filter berdasarkan genre
            const genreMatch = selectedGenre === 'all' || movie.genre.includes(selectedGenre);

            // Filter berdasarkan pencarian (judul atau tag)
            const titleMatch = movie.title.toLowerCase().includes(searchTerm);
            const tagMatch = movie.tag.some(tag => tag.toLowerCase().includes(searchTerm)); // Cek apakah ada tag yang cocok
            const searchMatch = searchTerm === '' || titleMatch || tagMatch;

            return genreMatch && searchMatch;
        });

        // c. Hitung total halaman
        const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
        // Pastikan currentPage valid setelah filter
        if (currentPage > totalPages) {
            currentPage = totalPages > 0 ? totalPages : 1;
        }
        if (currentPage < 1) {
             currentPage = 1;
        }


        // d. Tentukan film untuk halaman saat ini (Pagination)
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedMovies = filteredMovies.slice(startIndex, endIndex);

        // e. Tampilkan film & kontrol pagination
        displayMovies(paginatedMovies); // Tampilkan film untuk halaman ini
        displayPaginationControls(totalPages); // Tampilkan tombol pagination
    }

    // 4. Tampilkan Daftar Film di Halaman
    function displayMovies(moviesToDisplay) {
        movieListContainer.innerHTML = ''; // Kosongkan kontainer

        if (moviesToDisplay.length === 0) {
            movieListContainer.innerHTML = '<p>Tidak ada film yang cocok dengan kriteria Anda.</p>';
            return;
        }

        moviesToDisplay.forEach((movie) => {
            const movieItem = document.createElement('div');
            movieItem.classList.add('movie-item');
            // Tidak perlu index, kita akan oper objek movie langsung

            const thumbnail = document.createElement('img');
            thumbnail.src = movie.thumbnail;
            thumbnail.alt = `Thumbnail ${movie.title}`;
            thumbnail.loading = 'lazy';

            const title = document.createElement('p');
            title.classList.add('title');
            title.textContent = movie.title;

            const genre = document.createElement('p');
            genre.classList.add('genre');
            genre.textContent = `Genre: ${movie.genre.join(', ')}`;

            const tags = document.createElement('p');
            tags.classList.add('tags');
            tags.textContent = `Tag: ${movie.tag.join(', ')}`;

            movieItem.appendChild(thumbnail);
            movieItem.appendChild(title);
            movieItem.appendChild(genre);
            movieItem.appendChild(tags);

            // Modifikasi: Oper objek movie ke playMovie
            movieItem.addEventListener('click', () => {
                playMovie(movie); // Oper seluruh objek movie
            });

            movieListContainer.appendChild(movieItem);
        });
    }

    // 5. Tampilkan Kontrol Pagination
    function displayPaginationControls(totalPages) {
        paginationControls.innerHTML = ''; // Kosongkan kontrol

        if (totalPages <= 1) return; // Jangan tampilkan jika hanya 1 halaman

        // Tombol Sebelumnya
        const prevButton = document.createElement('button');
        prevButton.textContent = '« Seb';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderPage();
                scrollToTop(); // Gulir ke atas setelah ganti halaman
            }
        });
        paginationControls.appendChild(prevButton);

        // Tombol Halaman (Contoh sederhana: hanya tampilkan beberapa nomor)
        // Logika yang lebih kompleks bisa ditambahkan untuk menampilkan [...]
        const maxPageButtons = 5; // Maksimal tombol nomor halaman yang ditampilkan
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        // Adjust startPage if endPage reaches the limit early
         if (endPage === totalPages) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
         }


        if (startPage > 1) {
             const firstButton = createPageButton(1);
             paginationControls.appendChild(firstButton);
             if (startPage > 2) {
                 const ellipsis = document.createElement('span');
                 ellipsis.textContent = '...';
                 ellipsis.style.margin = '0 5px';
                 paginationControls.appendChild(ellipsis);
             }
        }


        for (let i = startPage; i <= endPage; i++) {
            const pageButton = createPageButton(i);
            paginationControls.appendChild(pageButton);
        }


        if (endPage < totalPages) {
             if (endPage < totalPages - 1) {
                 const ellipsis = document.createElement('span');
                 ellipsis.textContent = '...';
                  ellipsis.style.margin = '0 5px';
                 paginationControls.appendChild(ellipsis);
             }
            const lastButton = createPageButton(totalPages);
            paginationControls.appendChild(lastButton);
        }


        // Tombol Berikutnya
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Ber »';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderPage();
                scrollToTop(); // Gulir ke atas setelah ganti halaman
            }
        });
        paginationControls.appendChild(nextButton);
    }

     // Helper function to create a page number button
     function createPageButton(pageNumber) {
         const pageButton = document.createElement('button');
         pageButton.textContent = pageNumber;
         if (pageNumber === currentPage) {
             pageButton.classList.add('active');
             pageButton.disabled = true; // Nonaktifkan tombol halaman saat ini
         }
         pageButton.addEventListener('click', () => {
             currentPage = pageNumber;
             renderPage();
             scrollToTop(); // Gulir ke atas setelah ganti halaman
         });
         return pageButton;
     }


    // 6. Fungsi untuk Memutar Film (Menerima Objek Movie)
    function playMovie(movie) {
        videoTitle.textContent = movie.title;
        videoPlayer.src = movie.video;
        videoPlayerContainer.style.display = 'block';
        videoPlayer.play().catch(e => console.error("Gagal memutar video:", e)); // Tambahkan penanganan error play

        videoPlayerContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 7. Fungsi untuk Menggulir ke Atas (Opsional)
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }


    // --- Event Listeners ---

    // Listener untuk input pencarian (saat pengguna mengetik)
    searchInput.addEventListener('input', () => {
        currentPage = 1; // Reset ke halaman 1 setiap kali search
        renderPage();
    });

    // Listener untuk filter genre
    genreFilter.addEventListener('change', () => {
        currentPage = 1; // Reset ke halaman 1 setiap kali filter berubah
        renderPage();
    });

    // Listener untuk tombol tutup player (sama seperti sebelumnya)
    closePlayerBtn.addEventListener('click', () => {
        videoPlayer.pause();
        videoPlayer.src = "";
        videoPlayerContainer.style.display = 'none';
    });

    // --- Inisialisasi ---
    fetchMovies(); // Mulai ambil data saat halaman dimuat

}); // Akhir dari DOMContentLoaded
