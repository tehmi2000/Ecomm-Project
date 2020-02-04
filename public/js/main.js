let mediaX = window.matchMedia("(max-width: 800px)");

const openMenu = function() {
    document.querySelector("#sidemenu").style.marginLeft = "0%";
};

const closeMenu = function() {
    document.querySelector("#sidemenu").style.marginLeft = "-150%";
};

document.addEventListener("DOMContentLoaded", function () {
    try{
        if (getCookie("username") && document.querySelector("#sidemenu")) {
            let apiUrl = `/api/user/${getCookie("username").value}`;
            let div0 = create("DIV");
            let child = "<a href='/myprofile'><img id='user-photo' src='../assets/images/contacts-filled.png' alt='' class='user-picture'></a><a href='/logout' class='link-btn'>Logout</a>";
            div0.innerHTML = child;
            document.querySelector("#sidemenu nav div:first-child").replaceWith(div0);

            fetch(apiUrl).then(function(response) {
                response.json().then( function(user_data) {
                    if(user_data.profile_picture !== ""){
                        document.querySelector("#sidemenu #user-photo").src = user_data.profile_picture;
                    }
                }).catch(function (error) {
                    console.error(error);
                });
            }).catch(function(error) {
                console.error(error);
            });

            document.querySelector("#sidemenu #controls").style.display = "flex";
        }

        let delay;
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

const addToggleAction = function(evt) {
    console.log("on");
    evt.currentTarget.classList.toggle("on");
};

const createSuggestions = function(pEl, cEl) {
    const createSugItem = function(props) {
        // <span class="rows sug-item">
        //     <img src="" alt="">
        //     <span class="item-name"></span>
        // </span>

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
        } catch (error) {
            console.error(error);
        }
    }).catch(error => {
        console.error(error);
    });
};

const readOctet = function(path) {
    fetch(path, {
        mode: 'no-cors'
    }).then(async response => {
        try {
            let result = await response.json();
            console.log(result);
        } catch (error) {
            console.error(error);
        }
    }).catch(error => {
        console.error(error);
    });
};


// if('serviceWorker' in navigator){
//     window.addEventListener('load', ()=>{
//         navigator.serviceWorker.register("/hitmee-sw.js").then(function(reg) {
//             console.log("Service worker is working fine");
            
//             function updateReady(worker) {
//                 let answerToUpdate = confirm("An update to the page is available, do you wish to receive updates now?");
                
//                 if(answerToUpdate != true) return;
//                 worker.postMessage({action : 'skipWaiting'});
//             }
        
//             if(!navigator.serviceWorker.controller) return;
        
//             if(reg.waiting){
//                 updateReady(reg.waiting);
//                 return;
//             }else if(reg.installing){
//                 reg.installing.addEventListener("statechange", function(){
//                     if (this.state == "installed"){
//                         updateReady(reg.installing);
//                     }
//                 });
//                 return;
//             }else{
//                 reg.addEventListener("updatefound", function(){
//                     updateReady(reg.installing);
//                     reg.installing.addEventListener("statechange", function(){
//                         if (this.state == "installed"){
//                             return;
//                         }
//                     });
//                 });
//             }
            
//             navigator.serviceWorker.addEventListener('controllerchange', function(event) {
//                 window.location.reload();
//             });
        
//         }).catch(function(err) {
//             console.log(err.message);
//             console.log("Service worker is not supported");
//         });
//     }); 
// }

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

// Custom helper functions 

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

function getQuery() {
    const object = {};
    const query_list = window.location.search.substring(1).split('&');

    for (let index = 0; index < query_list.length; index++){
        object[query_list[index].split('=')[0]] = query_list[index].split('=')[1];
    }
    
    return object;
}

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

const formatAsMoney = price => {
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

    let formattedPrice = price.toLocaleString(undefined, {
        style: "currency",
        currency: "NGN"
    });

    return formattedPrice;
};

if('serviceWorker' in navigator){
    window.addEventListener('load', ()=>{
        navigator.serviceWorker.register("/serviceWorkers/univers-sw.js").then(function(reg) {
            console.log("Service worker is working fine");
        }).catch(function(err) {
            console.log(err.message);
            console.log("Service worker is not supported");
        });
    });
}
