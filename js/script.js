
"use strict";

// ===== 0. HELPERS =====
const storage = {
    get(key, fallback = null) {
        try {
            const value = localStorage.getItem(key);
            return value === null ? fallback : JSON.parse(value);
        } catch (e) {
            return fallback;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {}
    },
};

function createEl(tag, className, text) {
    const el = document.createElement(tag);

    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;

    return el;
}

function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        timeZone: "UTC"
    });
}


// ===== 1. TAB NAVIGATION =====
const TABS = ["about", "projects", "contact"];
const navButtons = document.querySelectorAll(".nav-links .tab-btn");
const tabPages = document.querySelectorAll(".tab-page");

function getTabFromHash() {
    return location.hash.replace(/^#\/?/, "");
}

function showTab(tabId) {
    if (!TABS.includes(tabId)) tabId = "about";

    tabPages.forEach((page) => {
        page.classList.toggle("active-tab", page.id === tabId);
    });

    navButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.target === tabId);
    });
}

document.querySelectorAll("[data-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
        // Updating the hash triggers the hashchange event, which switches the tab.
        location.hash = "/" + btn.dataset.target;
    });
});

window.addEventListener("hashchange", () => {
    showTab(getTabFromHash());
});


// ===== 2. DARK / LIGHT THEME =====
const themeBtn = document.getElementById("theme-toggle");
const root = document.documentElement;

function updateThemeButton() {
    const isDark = root.getAttribute("data-theme") === "dark";
    themeBtn.textContent = isDark ? "☀️ Light" : "🌙 Dark";
}

themeBtn.addEventListener("click", () => {
    const isDark = root.getAttribute("data-theme") === "dark";

    if (isDark) {
        root.removeAttribute("data-theme");
    } else {
        root.setAttribute("data-theme", "dark");
    }

    // The head script reads this value directly as a string, not as JSON.
    try {
        localStorage.setItem("theme", isDark ? "light" : "dark");
    } catch (e) {}

    updateThemeButton();
});


// ===== 3. PROJECTS DATA =====
const PROJECTS = [
    {
        title: "AWS Cloud Notification System",
        description: "Serverless notification service built using AWS Lambda and Amazon SNS.",
        category: "cloud",
        level: "advanced",
        date: "2026-08",
        tags: ["AWS Lambda", "Amazon SNS", "Serverless"],
        image: "assets/images/sns-cloud.webp",
        imageSize: [560, 335],
    },
    {
        title: "UniRide",
        description: "KFUPM carpool web app (SWE 363, Group 10). I built the admin pages of the React front-end.",
        category: "web",
        level: "advanced",
        date: "2026-11",
        tags: ["React", "Team project"],
    },
    {
        title: "Developer Portfolio",
        description: "This website: started as static HTML/CSS, now with tabs, filters, a live API, and saved preferences.",
        category: "web",
        level: "beginner",
        date: "2026-09",
        tags: ["HTML", "CSS", "JavaScript"],
    },
    {
        title: "Star Game",
        description: "Interactive 2D game built with core software engineering principles.",
        category: "game",
        level: "beginner",
        date: "2025-12",
        tags: ["Game", "OOP"],
        image: "assets/images/star-game.webp",
        imageSize: [372, 350],
    },
];

const LEVEL_MESSAGES = {
    all: "Showing everything I've built, from first steps to bigger systems.",
    beginner: "Beginner projects: where I learned the fundamentals, one small project at a time.",
    advanced: "Advanced projects: team work, cloud services, and larger codebases.",
};

const DEFAULT_FILTERS = {
    category: "all",
    level: "all",
    sort: "newest",
    search: ""
};

// Only accept saved filter values that the page actually supports.
const savedFilters = storage.get("projectFilters", {});
const validCategories = ["all", ...new Set(PROJECTS.map((p) => p.category))];
const validLevels = Object.keys(LEVEL_MESSAGES);
const validSortOptions = ["newest", "oldest", "az"];

const filters = {
    category: validCategories.includes(savedFilters?.category)
        ? savedFilters.category
        : DEFAULT_FILTERS.category,

    level: validLevels.includes(savedFilters?.level)
        ? savedFilters.level
        : DEFAULT_FILTERS.level,

    sort: validSortOptions.includes(savedFilters?.sort)
        ? savedFilters.sort
        : DEFAULT_FILTERS.sort,

    search: ""
};


// ===== 4. DOM REFERENCES =====
const searchInput = document.getElementById("project-search");
const levelSelect = document.getElementById("level-select");
const sortSelect = document.getElementById("sort-select");
const categoryChips = document.querySelectorAll(".chip");
const projectsGrid = document.getElementById("projects-grid");
const emptyState = document.getElementById("empty-state");
const resetBtn = document.getElementById("reset-filters");
const levelMessage = document.getElementById("level-message");
const resultsCount = document.getElementById("results-count");


// ===== 5. FILTER AND SORT =====
function getVisibleProjects() {
    const query = filters.search.toLowerCase();

    const filtered = PROJECTS
        .filter((p) => filters.category === "all" || p.category === filters.category)
        .filter((p) => filters.level === "all" || p.level === filters.level)
        .filter((p) => {
            if (!query) return true;

            const text = `${p.title} ${p.description} ${p.tags.join(" ")}`.toLowerCase();
            return text.includes(query);
        });

    return filtered.slice().sort((a, b) => {
        if (filters.sort === "az") return a.title.localeCompare(b.title);
        if (filters.sort === "oldest") return a.date.localeCompare(b.date);
        return b.date.localeCompare(a.date);
    });
}

// Search text is intentionally excluded because it is temporary.
function saveFilters() {
    storage.set("projectFilters", {
        category: filters.category,
        level: filters.level,
        sort: filters.sort
    });
}


// ===== 6. CREATE PROJECT CARDS =====
function createProjectCard(project) {
    const card = createEl("article", "project-card");

    if (project.image) {
        const img = createEl("img");

        img.src = project.image;
        img.alt = `${project.title} screenshot`;
        img.width = project.imageSize[0];
        img.height = project.imageSize[1];
        img.loading = "lazy";
        img.decoding = "async";

        card.append(img);
    } else {
        const initials = project.title
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2);

        const placeholder = createEl("div", "card-placeholder", initials);
        placeholder.setAttribute("aria-hidden", "true");

        card.append(placeholder);
    }

    card.append(createEl("h2", "", project.title));
    card.append(createEl("p", "", project.description));

    const tags = createEl("div", "tags");

    project.tags.forEach((tag) => {
        tags.append(createEl("span", "tag", tag));
    });

    card.append(tags);

    const level = project.level[0].toUpperCase() + project.level.slice(1);

    card.append(
        createEl("p", "meta", `${level} · ${formatDate(project.date + "-01")}`)
    );

    return card;
}


// ===== 7. RENDER PROJECTS =====
function renderProjects() {
    const visible = getVisibleProjects();
    const fragment = document.createDocumentFragment();

    visible.forEach((project) => {
        fragment.append(createProjectCard(project));
    });

    projectsGrid.replaceChildren(fragment);

    levelMessage.textContent = LEVEL_MESSAGES[filters.level];
    resultsCount.textContent = `Showing ${visible.length} of ${PROJECTS.length} projects`;

    emptyState.classList.toggle("hidden", visible.length > 0);

    const isDefault =
        filters.category === "all" &&
        filters.level === "all" &&
        filters.sort === "newest" &&
        !filters.search;

    resetBtn.classList.toggle("hidden", isDefault);

    categoryChips.forEach((chip) => {
        chip.classList.toggle("active", chip.dataset.category === filters.category);
    });

    levelSelect.value = filters.level;
    sortSelect.value = filters.sort;
}


// ===== 8. EVENT LISTENERS =====
categoryChips.forEach((chip) => {
    chip.addEventListener("click", () => {
        filters.category = chip.dataset.category;
        saveFilters();
        renderProjects();
    });
});

levelSelect.addEventListener("change", () => {
    filters.level = levelSelect.value;
    saveFilters();
    renderProjects();
});

sortSelect.addEventListener("change", () => {
    filters.sort = sortSelect.value;
    saveFilters();
    renderProjects();
});

searchInput.addEventListener("input", () => {
    filters.search = searchInput.value.trim();
    renderProjects();
});

resetBtn.addEventListener("click", () => {
    Object.assign(filters, DEFAULT_FILTERS);
    searchInput.value = "";

    saveFilters();
    renderProjects();
});


// ===== 9. QUOTE API =====
const QUOTE_URL = "https://dummyjson.com/quotes/random";
const quoteBox = document.querySelector(".quote-box");
const quoteText = document.getElementById("quote-text");
const quoteAuthor = document.getElementById("quote-author");
const quoteRetry = document.getElementById("quote-retry");

function showQuote(quote) {
    quoteText.textContent = `“${quote.text}”`;
    quoteAuthor.textContent = `— ${quote.author}`;

    quoteBox.classList.remove("error");
    quoteRetry.classList.add("hidden");
}

function showQuoteError() {
    quoteText.textContent = "Couldn't load today's quote. Check your connection and try again.";
    quoteAuthor.textContent = "";

    quoteBox.classList.add("error");
    quoteRetry.classList.remove("hidden");
}

async function loadQuote() {
    const today = new Date().toDateString();
    const saved = storage.get("quoteOfTheDay");

    // Reuse today's quote to avoid unnecessary API requests.
    if (
        saved &&
        saved.date === today &&
        typeof saved.text === "string" &&
        typeof saved.author === "string"
    ) {
        showQuote(saved);
        return;
    }

    quoteText.textContent = "Loading today's quote…";
    quoteAuthor.textContent = "";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
        const response = await fetch(QUOTE_URL, {
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.quote || !data.author) {
            throw new Error("Unexpected response");
        }

        const quote = {
            text: data.quote,
            author: data.author,
            date: today
        };

        storage.set("quoteOfTheDay", quote);
        showQuote(quote);

    } catch (error) {
        showQuoteError();
    } finally {
        clearTimeout(timeout);
    }
}

quoteRetry.addEventListener("click", loadQuote);


// ===== 10. CONTACT FORM =====
const contactForm = document.getElementById("contact-form");
const feedback = document.getElementById("form-feedback");
const submitBtn = document.getElementById("submit-btn");
const messageCount = document.getElementById("message-count");

const MESSAGE_MIN = 20;
const MESSAGE_MAX = 500;

const fieldRules = {
    "user-name": (value) => {
        if (!value) return "Please enter your name.";
        if (value.length < 2) return "Name must be at least 2 characters.";
        return "";
    },

    "user-email": (value) => {
        if (!value) return "Please enter your email.";

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
            return "Please enter a valid email, like name@example.com.";
        }

        return "";
    },

    "user-message": (value) => {
        if (!value) return "Please write a message.";

        if (value.length < MESSAGE_MIN) {
            return `Message must be at least ${MESSAGE_MIN} characters (${value.length} so far).`;
        }

        return "";
    },
};

const errorIds = {
    "user-name": "name-error",
    "user-email": "email-error",
    "user-message": "message-error",
};

function validateField(input) {
    const error = fieldRules[input.id](input.value.trim());

    document.getElementById(errorIds[input.id]).textContent = error;
    input.setAttribute("aria-invalid", error ? "true" : "false");

    return error === "";
}

Object.keys(fieldRules).forEach((id) => {
    const input = document.getElementById(id);

    input.addEventListener("blur", () => {
        if (input.value.trim()) {
            validateField(input);
        }
    });

    input.addEventListener("input", () => {
        if (input.getAttribute("aria-invalid") === "true") {
            validateField(input);
        }

        feedback.textContent = "";
    });
});

document.getElementById("user-message").addEventListener("input", (e) => {
    messageCount.textContent = `${e.target.value.length} / ${MESSAGE_MAX}`;
});

contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const inputs = Object.keys(fieldRules).map((id) => {
        return document.getElementById(id);
    });

    const results = inputs.map(validateField);
    const firstInvalid = inputs[results.indexOf(false)];

    if (firstInvalid) {
        feedback.className = "form-feedback error";
        feedback.textContent = "Please fix the highlighted fields.";

        firstInvalid.focus();
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Checking…";
    feedback.textContent = "";

    setTimeout(() => {
        const name = inputs[0].value.trim();

        feedback.className = "form-feedback success";
        feedback.textContent =
            `Thanks ${name}! Demo only: your message passed validation, but it was not sent.`;

        contactForm.reset();
        messageCount.textContent = `0 / ${MESSAGE_MAX}`;

        inputs.forEach((input) => {
            input.removeAttribute("aria-invalid");
        });

        submitBtn.disabled = false;
        submitBtn.textContent = "Validate Message";
    }, 500);
});


// ===== 11. VISIT TIMER =====
const timerEl = document.getElementById("visit-timer");
const startTime = Date.now();

function updateTimer() {
    const totalSeconds = Math.floor((Date.now() - startTime) / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    timerEl.textContent = hours > 0
        ? `${hours}:${minutes}:${seconds}`
        : `${minutes}:${seconds}`;
}

updateTimer();
setInterval(updateTimer, 1000);


// ===== 12. INIT =====
function init() {
    showTab(getTabFromHash());
    updateThemeButton();
    renderProjects();
    loadQuote();
}

init();
