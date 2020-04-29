/* eslint-disable no-array-constructor */
/* eslint-disable no-use-before-define */
const searchAPIUrl = (apiKey, title) => {
  return `https://www.omdbapi.com/?apikey=${apiKey}&s=${title}`;
};
const IDAPIUrl = (apiKey, id) => {
  return `https://www.omdbapi.com/?apikey=${apiKey}&i=${id}`;
};
const apiKey = "31849743";

const sectionContainer = document.querySelector(".section-container");
const sections = document.querySelectorAll(".section");

const sectionHeaderMenu = document.querySelectorAll(".header-menu");
const sectionHeaderSubtitles = document.querySelectorAll(
  ".header__title_subtitle"
);

const sectionContentSearch = document.querySelector("#sectionContentSearch");
const sectionContentSearchIconContainer = document.querySelector(
  ".search__engine_icon-container"
);
const sectionShowSearchHistoryIcon = document.querySelector(
  ".search-history__icon"
);
const sectionShowSearchHistoryButton = document.querySelector(
  ".search-history__button"
);
const sectionSearchHistory = document.querySelector(".history-library__item");

const sectionContentResultMovieContainer = document.querySelector(
  ".content-box__films_result"
);

const sectionContentMyMovies = document.querySelector(
  ".marked-results__my-movies"
);
const modalContainer = document.querySelector(".modal-container");

let typeTimer;
const typeWaitMilliseconds = 2000;

const searchHistory = new Array();
const myMovies = new Array();

const myMoviesProxy = new Proxy(myMovies, {
  set(target, property, value) {
    const base = target;
    base[property] = value;
    if (property === "length") {
      localStorage.myMovies = JSON.stringify(myMoviesProxy);
      updateMyMoviesResult();
    }
    return true;
  }
});

sectionHeaderSubtitles.forEach((element) => {
  element.addEventListener("mousedown", () => {
    sections.forEach(el => {
      el.classList.remove("section-visible");
    });
    document
      .querySelector(`#${element.dataset.sectionTarget}`)
      .classList.add("section-visible");
    modalContainer.innerHTML = "";
  });
});

sectionHeaderMenu.forEach(element => {
  element.addEventListener("click", () => {
    sectionContainer.classList.add("section-container-blurred");
  });
});

sectionContentSearch.addEventListener("keyup", () => {
  clearTimeout(typeTimer);
  typeTimer = setTimeout(() => {
    if (sectionContentSearch.value.trim() !== "") {
      addSearchHistoryItem(sectionContentSearch.value.trim());
      populateSearchResult(sectionContentSearch.value.trim());
    }
  }, typeWaitMilliseconds);
});

sectionContentSearchIconContainer.addEventListener("click", () => {
  sectionContentSearch.value = "";
  sectionContentResultMovieContainer.innerHTML = "";
});

sectionShowSearchHistoryButton.addEventListener("click", () => {
  if (
    sectionSearchHistory.classList.contains("history__visible")
  ) {
    sectionSearchHistory.classList.remove("history__visible");
  } else {
    sectionSearchHistory.classList.add("history__visible");
  }
  if (sectionShowSearchHistoryIcon.classList.contains("fa-caret-down")) {
    sectionShowSearchHistoryIcon.classList.remove("fa-caret-down");
    sectionShowSearchHistoryIcon.classList.add("fa-caret-up");
  } else {
    sectionShowSearchHistoryIcon.classList.add("fa-caret-down");
    sectionShowSearchHistoryIcon.classList.remove("fa-caret-up");
  }
});

function populateSearchResult(search) {
  searchMovie(search).then(result => {
    sectionContentResultMovieContainer.innerHTML = "";
    if (result.Search == null) {
      sectionContentSearchIconContainer.childNodes[0].classList.add(
        "search__engine_icon-visible"
      );
      sectionContentSearchIconContainer.childNodes[1].classList.remove(
        "search__engine_icon-visible"
      );
      return;
    }
      modalContainer.innerHTML = "";

    result.Search.map((element) => {
      getMovieData(element.imdbID).then(data => {
        const movie = new Movie(data);
        sectionContentResultMovieContainer.appendChild(movie.getMovieItem());
      });
      return true;
    });
  });
}

function updateMyMoviesResult() {
  sectionContentMyMovies.innerHTML = "";
  myMoviesProxy.forEach(element => {
    sectionContentMyMovies.appendChild(element.getMovieItem());
  });
}

function addSearchHistoryItem(item) {
  searchHistory.push(item);
  sectionSearchHistory.insertAdjacentHTML(
    "beforeend",
    `<div class="history__item" onclick="populateSearchResult('${item}')">${item}</div>`
  );
}

function searchMovie(title) {
  return new Promise((resolve, reject) => {
    fetch(searchAPIUrl(apiKey, title))
      .then(result => {
        result.json().then(json => {
          resolve(json);
        });
      })
      .catch(error => {
        reject(error);
      });
  });
}

function getMovieData(imdbID) {
  return new Promise((resolve, reject) => {
    fetch(IDAPIUrl(apiKey, imdbID))
      .then(result => {
        result.json().then(json => {
          resolve(json);
        });
      })
      .catch(error => {
        reject(error);
      });
  });
}

class Movie {
  constructor(movie) {
    this.Title = movie.Title;
    this.Year = movie.Year;
    this.Rated = movie.Rated;
    this.Released = movie.Released;
    this.Runtime = movie.Runtime;
    this.Genre = movie.Genre;
    this.Director = movie.Director;
    this.Writer = movie.Writer;
    this.Actors = movie.Actors;
    this.Plot = movie.Plot;
    this.Language = movie.Language;
    this.Country = movie.Country;
    this.Awards = movie.Awards;
    this.Poster = movie.Poster;
    this.Ratings = movie.Ratings;
    this.Metascore = movie.Metascore;
    this.imdbRating = movie.imdbRating;
    this.imdbVotes = movie.imdbVotes;
    this.imdbID = movie.imdbID;
    this.Type = movie.Type;
    this.DVD = movie.DVD;
    this.BoxOffice = movie.BoxOffice;
    this.Production = movie.Production;
    this.Website = movie.Website;
    this.Response = movie.Response;
  }

  getMovieItem() {
    const movieItem = document.createElement("div");
    movieItem.classList = "movie-item";
    movieItem.innerHTML = `<div class="movie-item__poster" style="background-image:url(${
      this.Poster !== "N/A"
        ? this.Poster
        : "https://renderman.pixar.com/assets/camaleon_cms/image-not-found-4a963b95bf081c3ea02923dceaeb3f8085e1a654fc54840aac61a57a60903fef.png"
    })">
                <!--div class="movie-item__heart ${
                  myMoviesProxy.includes(this) ? "movie-item__heart_visible" : ""
                }"><i class="fa fa-heart" aria-hidden="true"></i></div-->
            </div>
            <div class="movie-item__title">${this.Title}</div>
            <div class="movie-item__year">${this.Year}</div>
            <div class="movie-modal__rating-item">
            <div class="movie-modal__rating-item_icon" style="background-image: url(https://cdn4.iconfinder.com/data/icons/socialmediaicons_v120/16/imdb.png);"></div>
            <div class="movie-modal__rating-item_score">${
              this.Ratings[0] != null
                ? this.Ratings[0].Value
                : "N/A"
            }</div>`;

    movieItem.addEventListener("click", () => {
      sectionContainer.classList.add("section-container-blurred");
      modalContainer.appendChild(this.getMovieModal());
    });

    this.movieItem = movieItem;
    return movieItem;
  }

  getMovieModal() {
    const movieModal = document.createElement("div");
    movieModal.classList = "movie-modal__detail content-wrapper";
    movieModal.innerHTML = `<div class="movie-modal__poster" style="background-image:url(${
      this.Poster !== "N/A"
        ? this.Poster
        : "https://renderman.pixar.com/assets/camaleon_cms/image-not-found-4a963b95bf081c3ea02923dceaeb3f8085e1a654fc54840aac61a57a60903fef.png"
    })">
                <div class="movie-modal__close"><i class="fa fa-arrow-left" aria-hidden="true"></i></div>
                <div class="movie-modal__heart"><i class="fa ${
                  myMoviesProxy.find(element => {
                    return element.imdbID === this.imdbID;
                  }) !== undefined
                    ? "fa-heart"
                    : "fa-heart-o"
                }" aria-hidden="true"></i></div>
            </div>
            <div class="movie-modal__body">
                <div class="movie-modal__title">${this.Title}</div>
                <div class="movie-modal__year">${this.Year}</div>
                <div class="movie-modal__director">${this.Director}</div>
                <div class="movie-modal__rating-container">
                    <div class="movie-modal__rating-item">
                        <div class="movie-modal__rating-item_icon" style="background-image: url(https://staticv2-4.rottentomatoes.com/static/images/icons/CF_16x16.png);"></div>
                        <div class="movie-modal__rating-item_score">${
                          this.Ratings[1] != null
                            ? this.Ratings[1].Value
                            : "N/A"
                        }</div>
                    </div>
                    <div class="movie-modal__rating-item">
                        <div class="movie-modal__rating-item_icon" style="background-image: url(https://cdn4.iconfinder.com/data/icons/socialmediaicons_v120/16/imdb.png);"></div>
                        <div class="movie-modal__rating-item_score">${
                          this.Ratings[0] != null
                            ? this.Ratings[0].Value
                            : "N/A"
                        }</div>
                    </div>
                </div>
                <div class="movie-modal__plot">${this.Plot}</div>
            </div>`;
    movieModal
      .querySelector(".movie-modal__close")
      .addEventListener("click", () => {
        modalContainer.innerHTML = "";
        sectionContainer.classList.remove("section-container-blurred");
      });
    movieModal
      .querySelector(".movie-modal__heart")
      .addEventListener("click", event => {
        this.changeMyMovieItem(event, this, this.movieItem);
      });
    return movieModal;
  }

  changeMyMovieItem(event, movie, movieItem) {
    this.movieItemHeart = movieItem.querySelector(".movie-item__heart");
    if (!myMoviesProxy.includes(movie)) {
      myMoviesProxy.push(movie);
      event.target.classList.remove("fa-heart-o");
      event.target.classList.add("fa-heart");
    } else {
      myMoviesProxy.splice(myMovies.indexOf(movie), 1);
      event.target.classList.add("fa-heart-o");
      event.target.classList.remove("fa-heart");
    }
  }
}

if (localStorage.myMovies !== undefined) {
  if (localStorage.myMovies.length > 0) {
    JSON.parse(localStorage.myMovies).forEach(element => {
      myMoviesProxy.push(new Movie(element));
    });
    updateMyMoviesResult();
  }
}