// <*><*><*><*><*><*><*><*><*><*><*><*><*><*><*> DEFINE FUNCTIONS AND VARIABLES <*><*><*><*><*><*><*><*><*><*><*><*><*><*><*><*><*><*><*><*>

let currencyLocale = 'NGN';
let loggedInUserData = null;
let exchangeRates = null;

const openMenu = function() {
    document.querySelector("#sidemenu").style.marginLeft = "0%";
};

const closeMenu = function() {
    document.querySelector("#sidemenu").style.marginLeft = "-150%";
};

const addToggleAction = function(evt) {
    console.log("on");
    evt.currentTarget.classList.toggle("on");
};

const createSuggestions = function(pEl, cEl) {
    const createSugItem = function(props) {
        let span0 = createComponent("SPAN", null, ["rows", "sug-item"]);
            let img0 = create("IMG");
            let span01 = createComponent("SPAN", null, ["item-name"]);

        img0.setAttribute('src', props['item-image'][0]);
        img0.setAttribute('alt', '');
        span0.addEventListener("click", function(evt) {
            window.location.href = `/categories/view?query=${window.encodeURIComponent(props.categories[0] || props['item-name'])}`
        });

        span01.innerHTML = props['item-name'];
        span0 = joinComponent(span0, img0, span01);
        cEl.appendChild(span0);
    };

    pEl.style.display = "flex";

    fetch(`/api/goods/all/mostPopular`).then(async response => {
        try {
            let result = await response.json();
            let data = dataValidation(result).data;
            const sugData = [];

            data.forEach((eachItem, index) => {
                if(index === 0){
                    sugData.push(eachItem);
                }else{
                    let isUnique = !sugData.some(item => {
                        return item.categories[0] === eachItem.categories[0] || item['item-name'] === eachItem['item-name'];
                    });
    
                    if(sugData.length < 4 && ((isUnique === true && eachItem['item-image'][0] !== "") || index >= data.length - 4)){
                        sugData.push(eachItem);
                    }
                }
            });

            sugData.forEach(item => {
                createSugItem(item);
            });

            document.querySelectorAll(".sug-item .item-name").forEach(el => {
                $clamp(el, {clamp: 2});
            });
        } catch (error) {
            console.error(error);
        }
    }).catch(error => {
        console.error(error);
    });
};

const generateRandomColor = function () {
    
    let red = (Math.random() * 225) + 1;
    let blue = (Math.random() * 225) + 1;
    let green = (Math.random() * 225) + 1;

    let color = `rgb(${red}, ${green}, ${blue})`;
    return color;
};

const fetchAndCacheData = async (apiUrl, successCallback, errorCallback, options) => {
    errorCallback = errorCallback || function (error) { console.error(error)};
    options = options || { cacheName: 'univers-cache-v2'};

    const fetchAndStoreData = async function (storedResponse) {
        storedResponse = storedResponse || null;
        let response = (storedResponse === null)? await fetch(apiUrl) : storedResponse;
        let clonedResponse = response.clone();
        let result = await response.json();
        successCallback(result);
        return clonedResponse;
    };

    try {
        if('caches' in window){
            caches.open(options.cacheName).then(cache => {
                cache.match(apiUrl).then(async cacheResult => {
                    if(cacheResult === undefined || cacheResult === null){
                        let res = await fetchAndStoreData();
                        return cache.put(apiUrl, res);
                    }else{
                        let result = await cacheResult.json();
                        successCallback(result);
                    }
                }).catch(error => {
                    errorCallback(error);
                });
            }).catch(error => {
                errorCallback(error);
            });
        }
        
        else{
            let response = await fetch(apiUrl);
            let result = await response.json();
            successCallback(result);
        }

        // console.log(result);
    } catch (error) {
        errorCallback(error);
    }
};                                                                                                                              

function formatTime(hours, minutes) {
    const ampm = (hours >= 12)? 'PM' : 'AM';
    const fhours = (hours > 12)? hours - 12 : hours;
    const fmin = (JSON.stringify(minutes).length === 1)? `0${minutes}` : minutes;
    const ftime = `${fhours}:${fmin} ${ampm}`;
    return ftime;
}

function getCookie(name){
    arrayCookie=(document.cookie).split(';');
    for (let index = 0; index < arrayCookie.length; index++) {
        if (arrayCookie[index].indexOf(name)!=-1) {
            return {name : decodeURI(arrayCookie[index].split('=')[0]), value : decodeURI(arrayCookie[index].split('=')[1])};
        }
    }
}

const preFormatInput = function (content) {
    content = `<pre>${content}</pre>`;

    while(content.search("\n") > 0){
        content = content.replace("\n", "<br/>");
    }

    let formattedContent = "",
        startBold = false,
        endBold = false,
        startItalic = false,
        endItalic = false,
        startLink = {
            state: false,
            position: null
        },
        endLink = {
            state: false,
            position: null
        };

    for (let index = 0; index < content.length; index++) {

        if (content.charAt(index) === '*') {
            if (startBold === false) {
                startBold = true;
                content = `${content.substr(0, index)}<b>${content.substr(index + 1)}`;
            } else {
                endBold = true;
                startBold = false;
                content = `${content.substr(0, index)}</b>${content.substr(index + 1)}`;
            }
        }

        if (content.charAt(index) === '_') {
            if (startItalic === false) {
                startItalic = true;
                content = content.substr(0, index) + "<i>" + content.substr(index + 1);
            } else {
                endItalic = true;
                content = content.substr(0, index) + "</i>" + content.substr(index + 1);
                endItalic = false;
                startItalic = false;
            }
        }

        if (content.charAt(index) === '~') {
            try {
                if (startLink.state === false) {
                    startLink.state = true;
                    startLink.position = index;
                } else {

                    endLink.state = true;
                    endLink.position = index;
                    content = content.substr(0, startLink.position) + "<a href=\"https://" + content.substr(startLink.position + 1, endLink.position - startLink.position - 1) + "\">" + content.substr(startLink.position + 1, endLink.position - startLink.position - 1) + "</a>" + content.substr(index + 1);
                    startLink.position = null;
                    endLink.state = false;
                    startLink.state = false;
                }
            } catch (e) { console.error(e); }
        }
    }

    formattedContent = content.replace("<pre>" , "")
                              .replace("</pre>","");
    return formattedContent;
}

function formatName(str){
    let formattedString = (str.charAt(0)).toUpperCase()+(str.substring(1)).toLowerCase();
    return formattedString;
}

function genHex(length){
    length = length || 16;
    let counter = 0;
    let generated_hex = "t";
    let characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    while(counter <= length){
        let rand_index = Math.round((Math.random()*characters.length)+1);
        generated_hex += characters.charAt(rand_index);
        counter += 1;
    }
    return generated_hex;
}

const getQuery = function() {
    const object = {};
    const queryList = window.location.search.substring(1).split('&');

    for (let index = 0; index < queryList.length; index++){
        object[queryList[index].split('=')[0]] = queryList[index].split('=')[1];
    }
    
    return object;
};

function get(selector) {
    return document.getElementById(selector);
}

function forEach(elements, reaction){
    for(let i = 0; i < elements.length; i++){
        (reaction)(elements[i]);
    }
}

const validateSearch = function() {
    if(document.getElementById("searchField").value !== "" && document.getElementById("searchField").value.length >= 3){
        return true;
    }
    return false;
};

const dataValidation = data => {
    // console.log(data);
    const result = {
        valid: false,
        data: null
    };

    if(data.length > 0){
        let [dataOne] = data;
        // console.log(dataOne);
    }else{
        
    }

    result.valid = true;
    result.data = data;
    return result;
};

function create(element) {
    return document.createElement(element);
}

function createText(text) {
    return document.createTextNode(text);
}

function createComponent(type, value, classList) {
    value = value || null;
    classList = classList || null;

    const component = document.createElement(type);
    if (value){
        text = document.createTextNode(value);
        component.appendChild(text);
    }

    if(classList){
        classList.forEach(className => {
            component.classList.add(className);
        });
    }
    return component;
}

function joinComponent(container, ...components) {
    for (let component of components){
        container.appendChild(component);
    }
    return container;
}

function log(output) {
    return console.log(output);
}

const displayResponse = function(response, options) {

    options = options || {
        type: "success"
    };
    console.log(response, options);
    const component = document.querySelector("#response");

    if(options.type){
        component.style.backgroundColor = (options.type === "error")? "#e72e2e" : "green";
    }

    component.innerHTML = response;
    component.style.top = 0;

    setTimeout(function() {
        component.style.opacity = 0;
        component.style.top = "-10rem";
        setTimeout(function() {
            component.style.opacity = 1;
        }, 600);
    }, 3000);
};

const formatAsMoney = (price, destinationCurrency) => {
    destinationCurrency = destinationCurrency || "USD";
    const countries = [
        {
            code: "US",
            currency: "USD",
            country: 'United States'
        },
        {
            code: "NG",
            currency: "NGN",
            country: 'Nigeria'
        },
        {
            code: 'KE',
            currency: 'KES',
            country: 'Kenya'
        },
        {
            code: 'UG',
            currency: 'UGX',
            country: 'Uganda'
        },
        {
            code: 'RW',
            currency: 'RWF',
            country: 'Rwanda'
        },
        {
            code: 'TZ',
            currency: 'TZS',
            country: 'Tanzania'
        },
        {
            code: 'ZA',
            currency: 'ZAR',
            country: 'South Africa'
        },
        {
            code: 'CM',
            currency: 'XAF',
            country: 'Cameroon'
        },
        {
            code: 'GH',
            currency: 'GHS',
            country: 'Ghana'
        }
    ];

    price = convertCurrencies(price, destinationCurrency);

    let formattedPrice = price.toLocaleString(undefined, {
        style: "currency",
        currency: currencyLocale
    });

    return formattedPrice;
};

const convertCurrencies = function(price, destinationCurrency){
    let baseCurrency = "USD";
    let rate = 1;
    if (exchangeRates !== null){
        let tempRates = exchangeRates;
        delete tempRates.id;
        delete tempRates.lastModified;
        Object.keys(tempRates).forEach(nameOfCurrency => {
            let seperatedCurrency = nameOfCurrency.substr(3);
            if(seperatedCurrency === destinationCurrency.toUpperCase()){
                rate = exchangeRates[`${nameOfCurrency}`];
            }
        });
        // console.log(rate);
    }
    return price * rate;
}

// <*><*><*><*><*><*><*><*><*><*><*><*><*><*><*> CODE STARTS HERE<*><*><*><*><*><*><*><*><*><*><*><*><*><*><*><*><*><*><*><*>

// INSTALL SERVICE WORKER
if('serviceWorker' in navigator){
    window.addEventListener('load', ()=>{
        navigator.serviceWorker.register("/workers/univers-sw.js").then(function(reg) {
            console.log("Service worker is working fine");
        }).catch(function(err) {
            console.log(err.message);
            console.log("Service worker could not intall");
        });
    });
}                                                                                                                        

document.addEventListener("DOMContentLoaded", function () {
    // GET USER's COUNTRY's CURRENCY
    let exchangeRateApiUrl = "/api/currency/get-exchange-rate";
    let currencySuccessCallback = result => { if (result.id === "ratesdata") exchangeRates = result };

    fetchAndCacheData(exchangeRateApiUrl, currencySuccessCallback);

    try{
        if (getCookie("univers-username")) {
            let apiUrl = `/api/user/${getCookie("univers-username").value}`;
            let sideMenu = document.querySelector("#sidemenu");
            let userIcon = document.querySelector("#user-icon");

            let userdataSuccessCallback = function (userData) {
                // Save user's data
                loggedInUserData = userData;

                // If page has sidemenu modify with user data
                if(sideMenu && userData.profile_picture){
                    let div0 = create("DIV");
                    let child = "<a href='/myprofile'><img id='user-photo' src='../assets/images/contacts-filled.png' alt='' class='user-picture'></a><a href='/logout' class='link-btn'>Logout</a>";
                    div0.innerHTML = child;
                    document.querySelector("#sidemenu nav div:first-child").replaceWith(div0);
                    if(userData.profile_picture !== ""){
                        document.querySelector("#sidemenu #user-photo").src = userData.profile_picture;
                    }
                    document.querySelector("#sidemenu #controls").style.display = "flex";
                }
    
                // If page has user account icon, modify with user data
                if(userIcon){
                    if(userData !== null && userData.firstname){
                        userIcon.classList.toggle("active-user", true);
                        userIcon.classList.toggle("icofont-user-alt-7", false);
                        userIcon.innerHTML = `<span>${userData.firstname.substr(0, 1).toUpperCase()}</span>`;
                        userIcon.title = `Logged in as ${userData.username}`;
                    }
                }
            };

            fetch(apiUrl).then(async response => {
                try {
                    let result = await response.json();
                    userdataSuccessCallback(result);
                } catch (error) {
                   console.error(error); 
                }
            }).catch(error => {
                console.error(error);
            });
        }

        let delay = null;
        const dropMenu = document.querySelector(".drop-container");

        if(dropMenu){
            dropMenu.addEventListener("mouseover", function(evt) {
                if(delay){
                    clearTimeout(delay);
                }

                document.querySelector(".drop-container .drop-content").style.display = "grid";
            });
    
            dropMenu.addEventListener("mouseout", function(evt) {
                delay = setTimeout(function() {
                    document.querySelector(".drop-container .drop-content").style.display = "none";
                }, 1000);
            });
        }
    }catch(e){
        alert(e);
    }
});

