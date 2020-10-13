let images = ["null.png"];
let adsLinks = ["#"];
let counter = 0;

const setImage = function(counter){
    counter = (counter === images.length-1)? 0 : counter + 1;
    if(images[counter] !== null && images[counter] !== undefined){
        document.querySelector("#visit-ad-link").setAttribute("data-src", adsLinks[counter]);
        document.querySelector("#banner").style.backgroundImage = `url(../assets/adverts/${images[counter]})`;
    }else{
        document.querySelector("#visit-ad-link").setAttribute("data-src", "#");
        document.querySelector("#banner").style.backgroundImage = `url(../assets/images/null.png)`;
    }
};

const nextImage = function(){
    counter = (counter === images.length-1)? 0 : counter + 1;
    setImage(counter);
};

const prevImage = function(){
    counter = (counter === 0)? images.length-1 : counter - 1;
    setImage(counter);
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
    const apiUrl = "/api/adverts/all";
    fetch(apiUrl).then(async function(response) {
        try {
            let result = await response.json();
            let data = dataValidation(result).data;
            console.log(data);
            images = data.map(each => {
                return each.image;
            });
            adsLinks = data.map(each => {
                return (each.href === null)? "#" : each.href;
            });

            // Pick any of the ads to show next
            counter = Math.round(Math.random() * images.length);
        } catch (error) {
            console.error(error);
        }
    }).catch(error => {
        console.error(error);
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
    const container = document.querySelector("#recommended-container.pane .slider");
    fetch(`/api/goods/all/recommended`).then(function(response) {

        response.json().then( function(result) {
            // console.log(result);
            let data = dataValidation(result).data;

            // Randomly pick items from the item set to display
            randData = (function(arr) {
                let retArr = [];
                let randIndex = 0;
                let selectedItem = null;

                while (retArr.length < 10){
                    randIndex = Math.ceil((Math.random() * (arr.length - 1)));
                    selectedItem = arr[randIndex];

                    // console.log("length:", arr.length, "randIndex:", randIndex, "sItem:", selectedItem);
                    retArr.push(selectedItem);
                    arr = arr.filter((item) => {
                        return item["_id"] !== selectedItem["_id"];
                    });
                }
                return retArr;
            }(data));

            container.innerHTML = "";
            randData.forEach(object => {
                createItem(container, object);
            });

            document.querySelectorAll(".item .item-description span:first-child").forEach(el => {
                $clamp(el, {clamp: 2});
            });
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

    getMostPopular();
    getRecommended();

    document.querySelector("#visit-ad-link").addEventListener("click", function (ev) {
        window.location.href = ev.currentTarget.getAttribute("data-src");
    });
});

window.onload = function(evt) {
    
    getAds();
    setInterval(function() {
        nextImage();
    }, 8000);
};