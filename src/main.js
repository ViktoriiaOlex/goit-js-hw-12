import axios from "axios";

// Описаний у документації
import SimpleLightbox from "simplelightbox";
// Додатковий імпорт стилів
import "simplelightbox/dist/simple-lightbox.min.css";

// Описаний у документації
import iziToast from "izitoast";
// Додатковий імпорт стилів
import "izitoast/dist/css/iziToast.min.css";

const refs = {
    form: document.querySelector('.search-form'),
    input: document.querySelector('.search-inp'),
    searchBtn: document.querySelector('.search-btn'),
    gallery: document.querySelector('.gallery'),
    loadMoreBtn: document.querySelector('.load-btn'),
    loader: document.querySelector('.loader-container'),
  };
  
  axios.defaults.baseURL = 'https://pixabay.com/api';
  const API_KEY = '42030436-f44bf17f2fc4b636ae2b8b7a9';
  
  const hiddenClass = 'is-hidden';
  let page = 1;
  let query = '';
  let maxPage = 0;

  const simplyGallery = new SimpleLightbox('.gallery-item a', {
    captionsData: 'alt',
    captionDelay: 250,
  });
  
  refs.form.addEventListener('submit', onSearch);
  
  async function onSearch(event) {
    event.preventDefault();
    refs.gallery.innerHTML = '';
      page = 1;
  
    refs.loadMoreBtn.classList.add(hiddenClass);
    query = refs.form.query.value.trim();
  
    if (!query) {
        showToastMessage(
        `The search field can't be empty! Please, enter your request!`
      );
      return;
    }
    try {
      const { hits, totalHits } = await getImages(query);
      maxPage = Math.ceil(totalHits / 15);
      createMarkup(hits, refs.gallery);
  
      if (hits.length > 0) {
        refs.loadMoreBtn.classList.remove(hiddenClass);
        refs.loadMoreBtn.addEventListener('click', onLoadMore);
      } else {
        refs.loadMoreBtn.classList.add(hiddenClass);
        showToastMessage(
          `Sorry, there are no images matching your search query. Please, try again!`
        );
      }
      showLoader(false);
    } catch (error) {
      console.log(error);
    } finally {
      refs.form.reset();
      if (page === maxPage) {
        refs.loadMoreBtn.classList.add(hiddenClass);
        showToastMessage(
          "We're sorry, but you've reached the end of search results!"
        );
      }
    }
  }
  
  async function onLoadMore() {
    page += 1;
    try {
      showLoader(true);
      refs.loadMoreBtn.classList.add(hiddenClass);
      const { hits } = await getImages(query, page);
      createMarkup(hits, refs.gallery);
      showLoader(false);
  
      scrollImg();
  
      refs.loadMoreBtn.classList.remove(hiddenClass);
    } catch (error) {
      console.log(error);
    } finally {
      if (page === maxPage) {
        refs.loadMoreBtn.classList.add(hiddenClass);
        showToastMessage(
          "We're sorry, but you've reached the end of search results!"
        );
      }
    }
  }
  

async function getImages(query, page = 1) {
    showLoader(true);
    try {
      const response = await axios.get('/', {
        params: {
          key: API_KEY,
          q: query,
          image_type: 'photo',
          orientation: 'horizontal',
          safesearch: true,
          per_page: 15,
          page,
        },
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      showLoader(false);
    }
  }
  
  function createMarkup(hits) {
    const markup = hits
      .map(
        ({
          webformatURL,
          largeImageURL,
          tags,
          likes,
          views,
          comments,
          downloads,
        }) =>
          `
          <li class="gallery-item">
    <a class="gallery-link" href="${largeImageURL}">
      <img
        class="gallery-image"
        src="${webformatURL}"
        alt="${tags}"
      />
      <p class="gallery-descr">likes: <span class="descr-span">${likes}</span> views: <span class="descr-span">${views}</span> comments: <span class="descr-span">${comments}</span> downloads: <span class="descr-span">${downloads}</span></p>
    </a>
  </li>`
      )
      .join('');
    refs.gallery.insertAdjacentHTML('beforeend', markup);
    simplyGallery.refresh();
  }
  
  function showToastMessage(message) {
    iziToast.show({
      class: 'error-svg',
      position: 'topRight',
      icon: 'error-svg',
      message: message,
      maxWidth: '432',
      messageColor: '#fff',
      messageSize: '16px',
      backgroundColor: '#EF4040',
      close: false,
      closeOnClick: true,
    });
  }
  
  function showLoader(state = true) {
    refs.loader.style.display = !state ? 'none' : 'inline-block';
  }
  
  function scrollImg() {
    const rect = document.querySelector('.gallery-link').getBoundingClientRect();
    window.scrollBy({ top: rect.height * 2, left: 0, behavior: 'smooth' });
  }