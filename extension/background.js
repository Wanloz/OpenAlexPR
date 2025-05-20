chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
});

// Обработчик сообщений
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getRecommendations") {
        fetch("http://localhost:8000/recommend", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ article_url: request.url })
        })
        .then(response => response.json())
        .then(data => sendResponse(data))
        .catch(error => sendResponse({ error: error.message }));

        return true; // Сообщаем, что ответ будет асинхронным
    }
});