const boxAndHideButton = document.createElement('div');
boxAndHideButton.id = 'box-and-hide';
document.body.appendChild(boxAndHideButton);

const box = document.createElement('div');
box.id = 'box';
boxAndHideButton.appendChild(box);

const form = document.createElement('form');
box.appendChild(form);

const postcodeLabel = document.createElement('label');
postcodeLabel.for = 'postcode';
postcodeLabel.innerText = 'Postcode';
form.appendChild(postcodeLabel);

const postcode = document.createElement('input');
postcode.id = 'postcode';
postcode.type = 'text';
postcodeLabel.appendChild(postcode);

const random = document.createElement('button');
random.id = 'random';
random.type = 'button';
random.innerText = 'Random';
postcodeLabel.appendChild(random);

postcodeLabel.appendChild(document.createElement('br'));

const error = document.createElement('span');
error.classList.add('error')
postcodeLabel.appendChild(error);

const dateLabel = document.createElement('label');
dateLabel.for = 'date';
dateLabel.innerText = 'Date of image';
form.appendChild(dateLabel);

const date = document.createElement('input');
date.id = 'date';
date.type = 'date';
date.min = '2000-01-01';
dateLabel.appendChild(date);

const dimensionsLabel = document.createElement('label');
dimensionsLabel.for = 'dimensions';
dimensionsLabel.innerText = 'Width and height of image in degrees [0.01 - 10]';
form.appendChild(dimensionsLabel);

const dimensions = document.createElement('input');
dimensions.id = 'dimensions';
dimensions.type = 'number';
dimensions.min = 0.01;
dimensions.max = 10;
dimensions.step = 0.01;
dimensions.placeholder = '1';
dimensionsLabel.appendChild(dimensions);

const submit = document.createElement('button');
submit.it = 'submit';
submit.type = 'button';
submit.disabled = true;
submit.innerText = 'Submit';
form.appendChild(submit);

const table = document.createElement('table');
const tableFields = [['Country', 'country'], ['Region', 'region'], ['Parish', 'parish'], ['County', 'admin_county'], ['District', 'admin_district'], ['Ward', 'admin_ward'], ['Latitude', 'latitude'], ['Longitude', 'longitude']];
for (const field of tableFields) {
    const [name, id] = field;
    const row = document.createElement('tr');
    table.appendChild(row);
    const rowName = document.createElement('td');
    rowName.innerText = name;
    row.appendChild(rowName);
    const rowValue = document.createElement('td');
    rowValue.id = id;
    row.appendChild(rowValue);
}

const hide = document.createElement('button');
hide.id = 'hide';
hide.innerText = '⯇'
boxAndHideButton.appendChild(hide);

const image = document.createElement('img');
document.body.appendChild(image);

let [errorMessage, latitude, longitude] = ['', NaN, NaN];

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
    image.src = url;
    // document.body.style = `background-image: url(${url})`;
}

// handle click on hide button, and show or hide the box
function handleClickHide() {
    if (hide.innerText === '⯇') {
        hide.innerText = '⯈';
        box.remove()
    } else {
        hide.innerText = '⯇';
        hide.insertAdjacentElement('beforebegin', box);
    }
}

postcode.addEventListener('blur', () => handleBlurClick(`postcodes/${postcode.value}`));
document.querySelector('#random').addEventListener('click', () => handleBlurClick(`random/postcodes`));
submit.addEventListener('click', handleClick);
hide.addEventListener('click', handleClickHide);
