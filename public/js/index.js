// const socket = io();

const images = ["0a9c147c668744d0afcb9d320afa0b73.jpg", "IMG-20180905-WA0011.jpg", "IMG-20180715-WA0007.jpg", "IMG-20190527-WA0029.jpg"];
let counter = 0;

const nextImage = function(){
    counter = (counter === images.length-1)? 0 : counter + 1;
    document.querySelector("#slideshow").style.backgroundImage = `url(../assets/ads/${images[counter]})`;
};

const prevImage = function(){
    counter = (counter === 0)? images.length-1 : counter - 1;
    document.querySelector("#slideshow").style.backgroundImage = `url(../assets/ads/${images[counter]})`;
};

const createItem = function(container, object){

    // <div class="item cols">
    //     <div class="item-img">
    //         <img src="assets/images/IMG-20180112-WA0009.jpg" alt="Item Image">
    //     </div>
    //     <div class="item-description cols">
    //         <span>Sony Fifa 20 Standard Edition-PS4</span>
    //         <span class="item-price">NGN21,000 <sup class="strike">NGN29,000</sup></span>
    //     </div>
    // </div>

    let price = formatAsMoney(parseInt(object["item-price"]));


    let originalPrice = (function(){
        let intPrice = parseInt(object["item-price"]);
        
        if(object[`price-discount`]){
            return `${formatAsMoney(intPrice / (100 - parseInt(object[`price-discount`])))}`
        }else{
            return ``;
        }
    }());


    let a0 = create("A");
        let div1 = create("DIV");
            let img0 = create("IMG");
        let div2 = create("DIV");
            let span0 = createComponent("SPAN", object["item-name"]);
            let span1 = createComponent("SPAN", price);
                let sup0 = createComponent("SUP", originalPrice);

    a0.classList.add("strip-link", "item", "cols");
    div1.classList.add("item-img");
    div2.classList.add("item-description", "cols");

    span1.classList.add("item-price");
    sup0.classList.add("strike");

    a0.setAttribute("href", `/view/${object._id}`);
    img0.setAttribute("src", object["item-image"][0]);
    img0.setAttribute("alt", "Item Image");

    span1.appendChild(sup0);
    div1 = joinComponent(div1, img0);
    div2 = joinComponent(div2, span0, span1);
    a0 = joinComponent(a0, div1, div2);

    container.appendChild(a0);
};

const getMostPopular = function() {
    const container = document.querySelector("#most-popular-container.pane .slider");
    
    fetch(`/api/goods/all/mostPopular`).then(function(response) {

        response.json().then( function(result) {
            console.log(result);
            container.innerHTML = "";
            let data = dataValidation(result).data;

            data.forEach(object => {
                createItem(container, object);
            });
        }).catch(error => {
            console.error(error);
        });

    }).catch(function(error) {
        console.error(error);
    });
};

const getRecommended = function() {
    fetch(`/api/goods/all/recommended`).then(function(response) {

        response.json().then( function(result) {
            console.log(result);
            let data = dataValidation(result).data;
            
        }).catch(function (error) {
            console.error(error);
        });

    }).catch(function(error) {
        console.error(error);
    });
};

document.addEventListener("DOMContentLoaded", function () {
    setInterval(function() {
        nextImage();
    }, 8000);

    getMostPopular();
    // getRecommended();
});

// socket.on("receive-user-data", function(object) {
//     alert(JSON.stringify(object));
//     // document.querySelector("#sidemenu #user-photo").src = object.pp;
// });