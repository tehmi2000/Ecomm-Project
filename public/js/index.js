let images = ["null.png"];
let counter = 0;

const nextImage = function(){
    counter = (counter === images.length-1)? 0 : counter + 1;
    document.querySelector("#banner").style.backgroundImage = `url(../assets/ads/${images[counter]})`;
};

const prevImage = function(){
    counter = (counter === 0)? images.length-1 : counter - 1;
    document.querySelector("#banner").style.backgroundImage = `url(../assets/ads/${images[counter]})`;
};

const createItem = function(container, object){
    let price = formatAsMoney(parseInt(object["item-price"]));
    let loadedImage = object["item-image"][0];

    let originalPrice = (function(){
        let intPrice = parseInt(object["item-price"]);
        
        if(object[`price-discount`]){
            return `${formatAsMoney(intPrice / (100 - parseInt(object[`price-discount`])))}`
        }else{
            return ``;
        }
    }());


    let a0 = createComponent("A", null, ["strip-link", "item", "cols"]);
        let div1 = createComponent("DIV", null, ["item-img"]);
            let img0 = createComponent("IMG", null, ["lazyload"]);
        let div2 = createComponent("DIV", null, ["item-description", "cols"]);
            let span0 = createComponent("SPAN", object["item-name"].toUpperCase());
            let span1 = createComponent("SPAN", price, ["item-price"]);
                let sup0 = createComponent("SUP", originalPrice, ["strike"]);

    a0.setAttribute("href", `/view/${object._id}`);
    img0.setAttribute("data-src", loadedImage);
    img0.setAttribute("alt", "Item Image");

    span1.appendChild(sup0);
    div1 = joinComponent(div1, img0);
    div2 = joinComponent(div2, span0, span1);
    a0 = joinComponent(a0, div1, div2);

    container.appendChild(a0);
};

const createDummyItem = function(container, length){

    for (let index = 0; index < length; index++) {
        let div0 = createComponent("DIV", null, ["dummy", "item", "cols"]);
        let div1 = createComponent("DIV", null, ["item-img"]);
            let img0 = create("IMG");
        let div2 = createComponent("DIV", null, ["item-description", "cols"]);
            let span0 = createComponent("SPAN", null);
            let span1 = createComponent("SPAN", null, ["item-price"]);

        img0.setAttribute("src", "");
        img0.setAttribute("alt", "");

        div2 = joinComponent(div2, span0, span1);
        div1 = joinComponent(div1, img0);
        div0 = joinComponent(div0, div1, div2);

        container.appendChild(div0);   
    }
};

const getAds = function() {
    const apiUrl = "/api/ads/all";
    fetch(apiUrl).then(async response => {
        try {
            let result = await response.json();
            let data = dataValidation(result).data;
            images = data;
            // Pick any of the ads to show next
            counter = Math.round(Math.random() * images.length);
        } catch (error) {
            console.log(error);
        }
    }).catch(error => {
        console.log(error);
    });
};

const getMostPopular = function() {
    const container = document.querySelector("#most-popular-container.pane .slider");
    
    fetch(`/api/goods/all/mostPopular`).then(async function(response) {

        try {
            let result = await response.json();
            // console.log(result);
            container.innerHTML = "";
            let data = dataValidation(result).data;

            data = data.slice(0, 10);
            data.forEach(object => {
                createItem(container, object);
            });

            document.querySelectorAll(".item .item-description span:first-child").forEach(el => {
                $clamp(el, {clamp: 2});
            });
        } catch (error) {
            console.error(error);
        }

    }).catch(function(error) {
        console.error(error);
    });
};

const getRecommended = function() {
    fetch(`/api/goods/all/recommended`).then(function(response) {

        response.json().then( function(result) {
            let data = dataValidation(result).data;
            
        }).catch(function (error) {
            console.error(error);
        });

    }).catch(function(error) {
        console.error(error);
    });
};

document.addEventListener("DOMContentLoaded", function () {
    createDummyItem(document.querySelector("#most-popular-container.pane .slider"), 5);
    createDummyItem(document.querySelector("#recommended-container.pane .slider"), 5);
    setInterval(function() {
        nextImage();
    }, 8000);
    getMostPopular();
});

window.onload = function(evt) {
    getAds();
};