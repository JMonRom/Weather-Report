let weatherAPIKey = '27cf6ea7d803e00225bc37d5ded1aa6a';

let currentCity;
let priorCity;

// displays city weather values for the day
let weatherCondition = (event) => {
  let city = $('#city-Search').val();
  currentCity = $('#city-Search').val();

  let queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&appid=" + weatherAPIKey;

  fetch(queryURL)
  .then((response) => {
    return response.json();
  })
  .then((response) => {
    console.log(response)
    storeCity(city)

    let iconImg = response.weather[0].icon;
    let icon = "https://openweathermap.org/img/w/" + iconImg + ".png";

    let momentTimeUTC = response.dt;
    let momentTZOffset = response.timezone;
    let momentTZOHours = momentTZOffset / 60 / 60;
    let dateToday = moment.unix(momentTimeUTC).utc().utcOffset(momentTZOHours);
    listCities();
    fiveDayForecast(event);

    $('#city-Name').text(response.name);

    let weatherHTML = `<h3> ${response.name} ${dateToday.format("(MM/DD/YY)")}<img src="${icon}"></h3> <ul class="list-unstyled"> <li>Temp: ${response.main.temp}</li> <li>Wind: ${response.wind.speed}</li> <li> Humidity: ${response.main.humidity} </li> <li> UV Index: </li> </ul>`;

    $('#city-Display').html(weatherHTML);

    // works the UV section of weather report
    let longitude = response.coord.lon;
    let latitude = response.coord.lat;
    let uvStatusLink = "api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&APPID" + weatherAPIKey;

    // gets UV index and displays with color depending on status/quality
    fetch(uvStatusLink)
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        let uvStatus = response.value;
        $('#uvStatus').html(`UV Index: <span id='uvColor'> ${uvStatus}</span>`);
        if (uvStatus >= 0 && uvStatus < 3){
          $('uvColor').attr('class', 'uv-Good');
        } else if (uvStatus >= 3 && uvStatus < 8) {
          $('uvColor').attr('class', 'uv-Moderate');
        } else if (uvStatus >= 8) {
          $('uvColor').attr('class', 'uv-Bad');
        }
      });
  })
}


// Save the city to local storage
let storeCity = (searchedCity) => {
  let cityReal = false;

  for (let i = 0; i < localStorage.length; i++) {
    if (localStorage['cities' + i ] === searchedCity) {
      cityReal = true;
      break
    }
    if (cityReal === false ) {
      localStorage.setItem('cities' + localStorage.length, searchedCity)
    }
  }
}

let fiveDayForecast = (event) => {
  let city = $('#city-Search').val();
  
  let queryURL = "http://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=" + weatherAPIKey;

  fetch(queryURL)
    .then((response) => {
      return response.json()
    })
    .then((response) => {
      //HTML formatting
      let forecastHTML = ` <h2> 5-Day Forecast: </h2> <div class="flex-wrap d-inline-flex" id="five-day-display">`;
  for (let i = 0; i < response.list.length; i++){ 
      //use of UTC and Open Weather Map to display a 5 day forecast
      let timeZoneOffset = response.city.timezone;
      let timeZoneHours = timeZoneOffset / 60 / 60;
      let dayForecast = response.list[i];
      let dayUTC = dayForecast.dt;
      let currentMoment = moment.unix(dayUTC).utc().utcOffset(timeZoneHours);

      let icon = "https://openweathermap.org/img/w/" + dayForecast.weather[0].icon + ".png";

      if(currentMoment.format("HH:mm:ss") === "11:00:00" || currentMoment.format("HH:mm:ss") === "12:00:00" ) {
        forecastHTML += `<div class="card weather-boxes m-3> <ul class="list-unstyled" <li>${currentMoment.format("MM/DD/YY")}</li> <li class="weather-icon"><img src="${icon}"></li> <li>Temp: ${dayForecast.main.temp};</li> <li> Wind: ${dayForecast.wind.speed}</li> <li> Humidity: ${dayForecast.main.humidity}</li> </ul> </div>`;
      }
    }
      forecastHTML += `</div>`;
      $('#five-Days').html(forecastHTML);
    })
}

let listCities = () => {
  $('#city-Return').empty();
  
  // checks local storage and attributes a city value
  if (localStorage.length === 0) {
    if (priorCity) {
      $('#city-Search').attr('value', priorCity);
    } else {
      $('#city-Search').attr('value', '');
    }
  } else {
    let priorCityStored = 'cities' + (localStorage.length - 1);
    priorCity = localStorage.getItem(priorCityStored)

    $('#city-Search').attr('value', priorCity)

    // display cities searched on the page
    for (let i = 0; i < localStorage.length; i++) {
      let city = localStorage.getItem('cities' + i)
      let cityEl;

      if (currentCity === '') {
        currentCity === priorCity;
      }
      if (city === currentCity) {
        cityEl = `<button type="button" class="list-group-item list-group-item-action active"> ${city}</button></li>`;
      } else {
        cityEl = `<button type="button" class="list-group-item list-group-item-action"> ${city}</button></li>`;
      }
      // displays all searched cities 
      $('#city-Return').prepend(cityEl)
    }

    // option to clear searched cities
     if (localStorage.length > 0) {
         $('#search-Delete').html($('<a  id="search-Delete" href="#">Reset</a>'));
       } else {
         $('#search-Delete').html('');
       }
    }
  }

$('#search-Btn').on('click', (event) => {
  event.preventDefault();
  currentCity = $('#city-Search').val();
  weatherCondition(event);
}) 

$('#city-Return').on('click', (event) => {
  event.preventDefault(); 
  $('#city-Search').val(event.target.textContent)
  currentCity = $('#city-Search').val();
  weatherCondition(event);
})

$('#search-Delete').on('click', () => {
  localStorage.clear();
  listCities();
})

listCities();

weatherCondition();




