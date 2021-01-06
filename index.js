let map;
let infowindow;

const covidAPI = "https://covid-19-tracking.p.rapidapi.com/v1/";
const countriesAPI = "https://covid-193.p.rapidapi.com/countries";
const apiKey = 'AIzaSyBQK_is9a2Ns0LK8pvfpbqHmM0qESAZ7qY'; 
const apiBaseURL_geoCode='https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/geocode/json';

function genericFetch(endpoint, covidAPIHeader, cb)
{
  fetch(endpoint, covidAPIHeader)
  .then(response=>response.json())
  .then(response=>cb(response))
  .catch(err => {
    $('#map').addClass('hidden');
    $('#js-error-message').removeClass('hidden');
    $('#js-error-message').text(`Something went wrong: ${err.message}`);
  });
}
function fetchCovidData(country)
{
   const covidAPIHeader = {
	"method": "GET",
	"headers": {
		"x-rapidapi-key": "0fd11f4fdcmshae96ddb7b6bc88fp1d0855jsn0943d168025a",
		"x-rapidapi-host": "covid-19-tracking.p.rapidapi.com"
	}};
  genericFetch(covidAPI+country, covidAPIHeader, (data)=>{
    renderCovidData(data);
  })
}

function fetchCountryList()
{
  const countriesAPIHeader = {
	"method": "GET",
	"headers": {
		"x-rapidapi-key": "0fd11f4fdcmshae96ddb7b6bc88fp1d0855jsn0943d168025a",
		"x-rapidapi-host": "covid-193.p.rapidapi.com"
	}
};
  genericFetch(countriesAPI, countriesAPIHeader, (data)=>{
    renderCountryList(data.response);
  })
}

function renderCovidData(data)
{
 generateGeolocation(data);
}

function renderCountryList(data)
{
  $("#root").append(`<form>
   <label for="country">Country:</label>
    <select name="country" id="country">
      <option value = "country">Select Country</option>
    </select></form>`);
  data.forEach(c=>{
      $("#country").append(`<option value= "${c}"> ${c}<option>`);
  });
  getSelectedCountry();
}

function getSelectedCountry()
{
  
  $("#country").change((evt)=>{
    $('#map').removeClass('hidden');
    $('#js-error-message').addClass('hidden');
     $( "#country option:selected" ).each(function() {
      fetchCovidData($( this ).text().trim());
    });
  })
}
function renderHeader()
{
  $("header").append(`    
    <h1 class="slide-left">Covid-19 Latest Data</h1>
  `);
}

function formatQueryParams(params){
  const queryItems=Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

//Google geoCode API
function generateGeolocation(data){
  const params={
    address: data["Country_text"],
    key: apiKey
  }
 const queryString=formatQueryParams(params);
  const url= apiBaseURL_geoCode+'?'+queryString;
  fetch(url)
  .then(response => response.json())
  .then(response => {
    const contentString =
    "<div>" +
    "<p><strong>Country</strong>: "+data["Country_text"]+
    "</p>"+
    "<p><strong>Active Cases</strong>: "+data["Active Cases_text"]+
    "</p>"+
    "<p><strong>Total Deaths</strong>: "+data["Total Deaths_text"]+
    "</p>"+
    "<p><strong>Total Cases</strong>: "+data["Total Cases_text"]+
    "</p>"+
    "<p><strong>Total Recovered</strong>: "+data["Total Recovered_text"]+
    "</p>"+
    "</div>";
    
    setUpMap(response.results[0].geometry.location.lat, 
      response.results[0].geometry.location.lng,
      contentString
      )
  })
  .catch(err => {
    $('#map').addClass('hidden');
    $('#js-error-message').removeClass('hidden');
    $('#js-error-message').text(`Something went wrong: ${err.message}`);
  });
}


////Google Map API
function setUpMap(lat, lng, contentString)
{
  const latLng = new google.maps.LatLng(lat, lng);
  const mapOptions = {
    center: latLng,
    zoom: 4,
  
  };
  let marker = new google.maps.Marker({
    position: latLng,
    title:"Click to see the latest data",
    visible: true
  });
  map = new google.maps.Map(document.getElementById("map"), mapOptions);
  const infowindow = new google.maps.InfoWindow({
    content: contentString
  });
  marker.addListener("click", () => {
    infowindow.open(map, marker);
  });
  marker.setMap(map);
}

function init()
{
  renderHeader();
  fetchCountryList();
}

$(init);