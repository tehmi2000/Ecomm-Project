const openMenu = function() {
    document.querySelector("#sidemenu").style.marginLeft = "0%";
};

const closeMenu = function() {
    document.querySelector("#sidemenu").style.marginLeft = "-70%";
};

// if('serviceWorker' in navigator){
//     window.addEventListener('load', ()=>{
//         navigator.serviceWorker.register("/hitmee-sw.js").then(function(reg) {
//             console.log("Service worker is working fine");
            
//             function updateReady(worker) {
//                 var answerToUpdate = confirm("An update to the page is available, do you wish to receive updates now?");
                
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

// socket.emit('update socketID', get_cookie("hitmee-username").value);

// socket.on('reconnect', function() {
//     if(get_cookie("hitmee-username")){
//         socket.emit('update socketID', get_cookie("hitmee-username").value);
//         if(get_cookie("chattingWith")){
//             socket.emit('get presence', get_cookie("chattingWith").value);
//         }
//     }
// });

// socket.on('connectedTo', function(data) {
//     document.cookie="chattingWith="+data+";";
// });


function formatTime(hours, minutes) {
    const ampm = (hours>=12)? 'PM' : 'AM';
    const fhours = (hours>12)? hours-12 : hours;
    const fmin = (JSON.stringify(minutes).length==1)? '0'+minutes : minutes;
    const ftime = fhours+':'+fmin+' '+ampm;
    return ftime;
}

function get_cookie(name){
    arrayCookie=(document.cookie).split(';');
    for (let index = 0; index < arrayCookie.length; index++) {
        if (arrayCookie[index].indexOf(name)!=-1) {
            return {name : decodeURI(arrayCookie[index].split('=')[0]), value : decodeURI(arrayCookie[index].split('=')[1])};
        }
    }
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
    console.log(generated_hex);
    return generated_hex;
}

function get_query() {
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


function create(element) {
    return document.createElement(element);
}

function createText(text) {
    return document.createTextNode(text);
}

function createComponent(type, value) {
    value = value || null;
    const component = document.createElement(type);
    if (value){
        text = document.createTextNode(value);
        component.appendChild(text);
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