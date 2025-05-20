document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById("search-btn");
    const articleInput = document.getElementById("article-url");
    const resultsDiv = document.getElementById("results");

    function displayError(error) {
        console.error("Произошла ошибка:", error);

        let errorMessage = "Произошла неизвестная ошибка";

        if (typeof error === 'string') {
            errorMessage = error;
        } else if (error?.message) {
            errorMessage = error.message;
        } else if (error?.detail) {
            errorMessage = error.detail;
        } else {
            errorMessage = "Ошибка при обработке запроса";
        }

        resultsDiv.innerHTML = `
            <div class="error">
                <p><strong>Ошибка:</strong> ${errorMessage}</p>
                <p>Проверьте ссылку и попробуйте снова</p>
                <p>Пример правильной ссылки: https://openalex.org/W3042746286</p>
            </div>
        `;
    }

    function showLoading() {
        resultsDiv.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Ищем похожие статьи...</p>
            </div>
        `;
    }

    function normalizeOpenAlexUrl(url) {
        try {
            // Удаляем параметры запроса
            const baseUrl = url.split('?')[0];

            // Извлекаем ID работы
            const parts = baseUrl.split('/');
            let workId = parts[parts.length - 1];

            // Нормализуем ID (w123 → W123)
            if (workId.startsWith('w')) {
                workId = 'W' + workId.slice(1);
            }

            if (!workId.startsWith('W')) {
                throw new Error("Неверный формат ID статьи");
            }

            return `https://openalex.org/${workId}`;
        } catch (e) {
            throw new Error("Неверный формат ссылки на статью");
        }
    }

    async function fetchSimilarArticles(url) {
        try {
            const response = await fetch("http://localhost:8000/recommend", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ article_url: url })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    function displayResults(originalTitle, articles) {
        let html = `
            <h3>Похожие статьи для:</h3>
            <p><strong>${originalTitle}</strong></p>
            <div class="similar-articles">
        `;

        articles.forEach(article => {
            html += `
                <div class="article-card">
                    <h4>${article.title}</h4>
                    <p class="meta">Степень схожести: ${article.distance}</p>
                    <a href="${article.url}" target="_blank" class="article-link">
                        Открыть статью
                    </a>
                </div>
            `;
        });

        resultsDiv.innerHTML = html + "</div>";
    }

    searchBtn.addEventListener("click", async () => {
        try {
            const inputUrl = articleInput.value.trim();

            if (!inputUrl) {
                throw new Error("Введите ссылку на статью");
            }

            showLoading();

            // Нормализуем URL
            const normalizedUrl = normalizeOpenAlexUrl(inputUrl);

            // Получаем данные
            const result = await fetchSimilarArticles(normalizedUrl);

            if (!result.similar_articles || result.similar_articles.length === 0) {
                throw new Error("Похожие статьи не найдены");
            }

            // Отображаем результаты
            displayResults(
                result.original_title || normalizedUrl,
                result.similar_articles
            );

        } catch (error) {
            displayError(error);
        }
    });
});