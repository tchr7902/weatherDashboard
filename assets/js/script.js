document.addEventListener('DOMContentLoaded', function () {
    // Select elements
    const form = document.querySelector('form');
    const resultBox = document.getElementById('resultBox');
    const resultContainer = document.querySelector('div:nth-child(2) ul');
    const forecast = document.getElementById('forecast');
    const forecastCardsContainer = document.getElementById('forecastCards');
    const searchHistoryList = document.querySelector('aside ul');

    const apiKey = '58c97eb8e7fcb2a80310642d7350ce4d';

    // Initially hide resultBox and forecast
    resultBox.style.display = 'none';
    forecast.style.display = 'none';

    // Event listener for form submission
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // Get the value from the city input
        const cityInput = document.getElementById('city');
        const cityName = cityInput.value;

        // Clear previous results
        clearResults();

        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=imperial`;

        fetch(currentWeatherUrl)
            .then(response => response.json())
            .then(data => {
                // Data from the API response
                const cityResult = {
                    name: data.name,
                    date: new Date().toLocaleDateString(),
                    forecastIcon: getWeatherIcon(data.weather[0].icon),
                    temperature: `${data.main.temp}°F`,
                    wind: `${data.wind.speed} mph`,
                    humidity: `${data.main.humidity}%`
                };

                // Display the city result
                displayCityResult(cityResult);

                // Save the search to local storage
                saveSearchToLocalStorage(cityName);
                // Display the updated search history
                displaySearchHistory();

                // Show the resultBox
                resultBox.style.display = 'block';
            })
            .catch(error => {
                console.error('Error fetching current weather data:', error);
            });

        // Fetch 5-day forecast data from the API
        const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=imperial`;

        fetch(forecastApiUrl)
            .then(response => response.json())
            .then(data => {
                // Data from the API response
                const forecastData = data.list.filter(entry => entry.dt_txt.includes('12:00:00')); // Get daily forecasts at 12:00 PM
                displayForecastCards(forecastData);

                // Show the forecast section
                forecast.style.display = 'block';
            })
            .catch(error => {
                console.error('Error fetching forecast data:', error);
            });
    });

    // Function to clear previous results
    function clearResults() {
        resultContainer.innerHTML = '';
        forecastCardsContainer.innerHTML = '';
    }

    // Function to display city result
    function displayCityResult(data) {
        resultBox.querySelector('h2').textContent = `${data.name}`;
        resultContainer.innerHTML = `
            <li>${data.date}</li>
            <li>Forecast: <img src="${data.forecastIcon}" alt="Weather Icon"></li>
            <li>Temperature: ${data.temperature}</li>
            <li>Wind: ${data.wind}</li>
            <li>Humidity: ${data.humidity}</li>
        `;
    }

    // Function to display forecast cards
    function displayForecastCards(forecastData) {
        forecastCardsContainer.innerHTML = '';

        forecastData.forEach(entry => {
            const forecastDate = new Date(entry.dt * 1000).toLocaleDateString();
            const forecastIcon = getWeatherIcon(entry.weather[0].icon);
            const forecastTemperature = `${entry.main.temp}°F`;
            const forecastWind = `Wind: ${entry.wind.speed} mph`;
            const forecastHumidity = `Humidity: ${entry.main.humidity}%`;

            const card = document.createElement('div');
            card.classList.add('card');

            // Card content
            card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${forecastDate}</h5>
                <p class="card-text"><img src="${forecastIcon}" alt="Weather Icon"></p>
                <p class="card-text">Temperature: ${forecastTemperature}</p>
                <p class="card-text">${forecastWind}</p>
                <p class="card-text">${forecastHumidity}</p>
            </div>
        `;

            // Append card to container
            forecastCardsContainer.appendChild(card);
        });
    }

    // Function to get weather icon URL based on icon code
    function getWeatherIcon(iconCode) {
        return `http://openweathermap.org/img/w/${iconCode}.png`;
    }

    // Function to save search to local storage
    function saveSearchToLocalStorage(city) {
        let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
        searchHistory.push(city);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }

    // Function to display search history
    function displaySearchHistory() {
        const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
        // Reverse the order and slice to get the last 10 items
        const recentSearches = searchHistory.slice(-10).reverse();
        
        searchHistoryList.innerHTML = '';
    
        recentSearches.forEach(city => {
            const listItem = document.createElement('li');
            listItem.textContent = city;
    
            // Add a click event listener to each search history item
            listItem.addEventListener('click', function () {
                // Set the value of the city input to the clicked search history item
                document.getElementById('city').value = city;
    
                // Trigger form submission programmatically
                form.dispatchEvent(new Event('submit'));
            });
    
            searchHistoryList.appendChild(listItem);
        });
    }

    displaySearchHistory();
});