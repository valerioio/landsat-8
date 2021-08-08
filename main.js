const date = document.querySelector('#date');
const form = document.querySelector('form');
const table = document.querySelector('table');
table.remove();
const postcode = document.querySelector('#postcode');
const dimensions = document.querySelector('#dimensions');
const error = document.querySelector('.error');
const submit = document.querySelector('#submit');
submit.disabled = true;
const image = document.querySelector('img');
let [errorMessage, latitude, longitude] = ['', NaN, NaN];

const zFill = number => number < 10 ? '0' + number : number;
(function setTodayDate() {
    const today = new Date();
    const yearMonthDate = `${today.getFullYear()}-${zFill(today.getMonth() + 1)}-${zFill(today.getDate())}`;
    date.max = date.value = yearMonthDate;
})();

function removeTable(data) {
    if (document.querySelector('table'))
        table.remove();
}

function createTable(data) {
    removeTable();
    table.querySelectorAll('td:last-child').forEach(element => element.innerText = data[element.id]);
    form.insertAdjacentElement('afterEnd', table);
}

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

async function getImage() {
    const dim = dimensions.value && dimensions.validity.valid ? dimensions.value : 1;
    const response = await fetch(`https://api.nasa.gov/planetary/earth/imagery?lon=${longitude}&lat=${latitude}&dim=${dim}&date=${date.value}&api_key=DEMO_KEY`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

async function handleBlurClick(path) {
    [errorMessage, latitude, longitude] = await getCoordinates(path);
    error.innerText = errorMessage;
    submit.disabled = Boolean(errorMessage);
}

async function handleClick() {
    image.src = await getImage();
}

postcode.addEventListener('blur', () => handleBlurClick(`postcodes/${postcode.value}`));
document.querySelector('#random').addEventListener('click', () => handleBlurClick(`random/postcodes`));
submit.addEventListener('click', handleClick);
