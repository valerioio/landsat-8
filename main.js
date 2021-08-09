const date = document.querySelector('#date');
const form = document.querySelector('form');
const table = document.querySelector('table');
const postcode = document.querySelector('#postcode');
const dimensions = document.querySelector('#dimensions');
const error = document.querySelector('.error');
const submit = document.querySelector('#submit');
const hide = document.querySelector('#hide');
const box = document.querySelector('#box');
let [errorMessage, latitude, longitude] = ['', NaN, NaN];
table.remove();
submit.disabled = true;

// set today's date as max value and default value for the date input
const zeroFill = number => number < 10 ? '0' + number : number;
(function setTodayDate() {
    const today = new Date();
    const yearMonthDate = `${today.getFullYear()}-${zeroFill(today.getMonth() + 1)}-${zeroFill(today.getDate())}`;
    date.max = date.value = yearMonthDate;
})();

// remove the table from the DOM
function removeTable(data) {
    if (document.querySelector('table'))
        table.remove();
}

// insert the table in the DOM and updates all the values
function createTable(data) {
    removeTable();
    table.querySelectorAll('td:last-child').forEach(element => element.innerText = data[element.id]);
    form.insertAdjacentElement('afterEnd', table);
}

// return an Array of three values: an error (if present else ''), latitude and longitude (if available else NaN)
async function getCoordinates(path) {
    const response = await fetch(`https://api.postcodes.io/${path}`);
    const data = await response.json();
    if (data.status === 200) {
        createTable(data.result);
        postcode.value = data.result.postcode;
        return ['', data.result.latitude, data.result.longitude];
    } else {
        removeTable();
        return [data.error, NaN, NaN];
    }
}

// return an url for the image fetched from the NASA API
async function getImage() {
    const dim = dimensions.value && dimensions.validity.valid ? dimensions.value : 1;
    const response = await fetch(`https://api.nasa.gov/planetary/earth/imagery?lon=${longitude}&lat=${latitude}&dim=${dim}&date=${date.value}&api_key=DEMO_KEY`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    console.log(url);
    return url;
}

// handle blur on the postcode input and click on the random button
async function handleBlurClick(path) {
    [errorMessage, latitude, longitude] = await getCoordinates(path);
    error.innerText = errorMessage;
    submit.disabled = Boolean(errorMessage);
}

// handle click on the submit buttons, and show the image
async function handleClick() {
    const url = await getImage()
    document.body.style = `background-image: url(${url})`;
    // document.querySelector('img').src = url;
}

// handle click on hide button, and show or hide the box
function handleClickHide() {
    if (hide.innerText === '⯇') {
        hide.innerText = '⯈';
        box.remove()
    } else {
        hide.innerText = '⯇';
        document.body.insertBefore(box, hide);
    }
}

postcode.addEventListener('blur', () => handleBlurClick(`postcodes/${postcode.value}`));
document.querySelector('#random').addEventListener('click', () => handleBlurClick(`random/postcodes`));
submit.addEventListener('click', handleClick);
hide.addEventListener('click', handleClickHide);
