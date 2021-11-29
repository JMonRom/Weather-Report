let weatherAPIKey = 'e5901a30495724dd9712d90e4a742f27';

let currentCity;
let priorCity;

let handleErrors = (response) => {
  if(!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

// displays city weather values for the day
let weatherCondition = (event) => {
  let city = $('#city-Search').val();
  currentCity = $('#city-Search').val();
  // variable set to use fetch to return weather search data from API
  let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + weatherAPIKey;
  fetch(queryURL)
  .then(handleErrors)
  .then((response) => {
    return response.json();
  })
  .then((response) => {
    storeCity(city)
    $('#invalid-Search').text('')

    let iconImg = response.weather[0].icon;
    let icon = "https://openweathermap.org/img/w/" + iconImg + ".png";

    let momentTimeUTC = response.dt;
    let momentTZOffset = response.timezone;
    let momentTZOHours = momentTZOffset / 60 / 60;
    let dateToday = moment.unix(momentTimeUTC).utc().utcOffset(momentTZOHours);
    listCities();
    fiveDayForecast(event);

    $('#city-Name').text(response.name);

    let weatherHTML = `
    <h3> ${response.name} ${dateToday.format("(MM/DD/YY)")}<img src="${icon}"></h3> 
    <ul class="list-unstyled"> 
      <li>Temp: ${response.main.temp} &#8457;</li> 
      <li>Wind: ${response.wind.speed} mph</li> 
      <li> Humidity: ${response.main.humidity} %</li> 
      <li id="uvStatus"> UV Index: </li> 
    </ul>`;

    $('#city-Display').html(weatherHTML);

    // // works the UV section of weather report
    let longitude = response.coord.lon;
    let latitude = response.coord.lat;
    let uvLink = "api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&APPID=" + weatherAPIKey;
    // gets UV index and displays with color depending on status/quality
    fetch(uvLink)
      .then(handleErrors)
      .then((response) => {
        console.log(response);
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

let fiveDayForecast = (event) => {
  let city = $('#city-Search').val();
  // API set up for forecast search
  let queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&APPID=" + weatherAPIKey;
  // fetch request from API
  fetch(queryURL)
    .then(handleErrors)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      //HTML formatting
      let forecastHTML = `<h2> 5-Day Forecast:</h2> <div class="flex-wrap d-inline-flex" id="fiveDaysDisplay">`;
  for (let i = 0; i < response.list.length; i++){ 
      //use of UTC and Open Weather Map to display a 5 day forecast
      let dayForecast = response.list[i];
      let timeZoneOffset = response.city.timezone;
      let timeZoneHours = timeZoneOffset / 60 / 60;
      let dayUTC = dayForecast.dt;
      let thisMoment = moment.unix(dayUTC).utc().utcOffset(timeZoneHours);

      let icon = "https://openweathermap.org/img/w/" + dayForecast.weather[0].icon + ".png";

      if(thisMoment.format("HH:mm:ss") === "11:00:00" || thisMoment.format("HH:mm:ss") === "12:00:00" || thisMoment.format("HH:mm:ss") === "13:00:00") {
        forecastHTML += `
        <div class="card weather-boxes p0 m-2> 
        <ul class="list-unstyled p-3 " 
          <li>${thisMoment.format("MM/DD/YY")}</li> 
          <li> <img src="${icon}"> </li> 
          <li>Temp: ${dayForecast.main.temp} &#8457; </li> 
          <li> Wind: ${dayForecast.wind.speed} mph </li>
          <li> Humidity: ${dayForecast.main.humidity} %</li> 
        </ul> 
        </div>`;
      }
    }
      forecastHTML += `</div>`;
      $('#five-day-display').html(forecastHTML);
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

let listCities = () => {
  $('#city-Return').empty();

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
      let city = localStorage.getItem('cities' + i);
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
  $('#city-Search').val(event.target.textContent);
  currentCity = $('#city-Search').val();
  weatherCondition(event);
})

$('#search-Delete').on('click', (event) => {
  localStorage.clear();
  listCities();
});

listCities();

weatherCondition();




