(function () {
  var grid = document.getElementById("inductee-grid");
  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll(".card--inductee"));
  var searchInput = document.getElementById("inductee-search");
  var sortSelect = document.getElementById("inductee-sort");
  var categoryRow = document.getElementById("category-filters");
  var sportRow = document.getElementById("sport-filters");
  var countEl = document.getElementById("inductee-count");
  var emptyEl = document.getElementById("inductee-empty");
  var clearBtn = document.getElementById("clear-filters");

  var state = { search: "", category: "all", sport: null };

  function applyFilters() {
    var visible = 0;
    cards.forEach(function (card) {
      var matchesSearch = !state.search || card.dataset.search.indexOf(state.search) !== -1;
      var matchesCategory = state.category === "all" || card.dataset.category === state.category;
      var matchesSport =
        !state.sport || (" " + card.dataset.sport + " ").indexOf(" " + state.sport + " ") !== -1;
      var show = matchesSearch && matchesCategory && matchesSport;
      card.hidden = !show;
      if (show) visible++;
    });
    if (countEl) countEl.textContent = visible + (visible === 1 ? " inductee" : " inductees");
    if (emptyEl) emptyEl.hidden = visible !== 0;
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      state.search = searchInput.value.trim().toLowerCase();
      applyFilters();
    });
  }

  if (categoryRow) {
    categoryRow.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-filter-category]");
      if (!btn) return;
      state.category = btn.dataset.filterCategory;
      categoryRow.querySelectorAll(".chip").forEach(function (c) {
        c.classList.remove("chip--active");
      });
      btn.classList.add("chip--active");
      applyFilters();
    });
  }

  if (sportRow) {
    sportRow.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-filter-sport]");
      if (!btn) return;
      var slug = btn.dataset.filterSport;
      var isActive = btn.classList.contains("chip--active");
      sportRow.querySelectorAll(".chip").forEach(function (c) {
        c.classList.remove("chip--active");
      });
      if (isActive) {
        state.sport = null;
      } else {
        btn.classList.add("chip--active");
        state.sport = slug;
      }
      applyFilters();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      var mode = sortSelect.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === "name") {
          return a.querySelector(".card__name").textContent.localeCompare(b.querySelector(".card__name").textContent);
        }
        if (mode === "grad-desc") {
          return (parseInt(b.dataset.grad, 10) || 0) - (parseInt(a.dataset.grad, 10) || 0);
        }
        return (parseInt(b.dataset.induction, 10) || 0) - (parseInt(a.dataset.induction, 10) || 0);
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      state = { search: "", category: "all", sport: null };
      if (searchInput) searchInput.value = "";
      if (categoryRow) {
        categoryRow.querySelectorAll(".chip").forEach(function (c) {
          c.classList.remove("chip--active");
        });
        var allBtn = categoryRow.querySelector('[data-filter-category="all"]');
        if (allBtn) allBtn.classList.add("chip--active");
      }
      if (sportRow) {
        sportRow.querySelectorAll(".chip").forEach(function (c) {
          c.classList.remove("chip--active");
        });
      }
      applyFilters();
    });
  }

  applyFilters();
})();
