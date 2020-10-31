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
    let price = formatAsMoney(parseInt(object["item-price"]), currencyLocale);
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
        let div0 = createComponent("DIV", `-${object[`price-discount`] || '0'}%`, ["item-discount"]);
        let div1 = createComponent("DIV", null, ["item-img"]);
            let img0 = createComponent("IMG", null, ["lazyload"]);
        let div2 = createComponent("DIV", null, ["item-description", "cols"]);
            let span0 = createComponent("SPAN", object["item-name"]);
            let span1 = createComponent("SPAN", price, ["item-price"]);
                let sup0 = createComponent("SUP", originalPrice, ["strike"]);
        let div3 = createComponent("DIV", null, ["rows"]);
            let imgaa = createComponent("IMG", null, ["item-delivery-method"]);
            let spanaa = createComponent("SPAN", null, ["rows", "item-location", "icofont-airplane-alt"]);

    a0.setAttribute("href", `/view/${object._id}`);
    // div1.setAttribute("data-expand", '-20');
    img0.setAttribute("data-src", loadedImage);
    img0.setAttribute("alt", `${object["item-name"].toLowerCase()}`);

    imgaa.setAttribute("src", `/assets/images/express.png`);
    if(object[`price-discount`]){
        div0.style.opacity = 1;
    }

    if(object[`item-location`]){
        // If location of item is not in local region, indicate it...
        if(object[`item-location`] !== loggedInUserData){
            spanaa.style.opacity = 1;
        }
    }

    imgaa.setAttribute("style", `opacity: 0.7;height: 2rem;width: auto;object-fit: contain;`);
    div3.style.alignItems = "flex-end";

    span1.appendChild(sup0);
    div1 = joinComponent(div1, img0);
    div2 = joinComponent(div2, span0, span1);
    div3 = joinComponent(div3, imgaa, spanaa);
    a0 = joinComponent(a0, div0, div1, div2, div3);

    container.appendChild(a0);
};

const createCategoryItem = function(container, listOfobjects){
    let bgColors = ["orange", "dodgerblue", "brown", "crimson"];
    listOfobjects = listOfobjects.slice(0, 6);

    container.innerHTML = "";
    listOfobjects.forEach((category, index) => {
        let a0 = createComponent("a", null, ["catitem", "cols"]);
        let div1 = createComponent("DIV", null, ["rows", "item-img", `${category['image']}`]);
        let div2 = createComponent("DIV", category['title'], ["item-name"]);

        a0 = joinComponent(a0, div1, div2);
        a0.style.backgroundColor = bgColors[index] || generateRandomColor();
        a0.setAttribute("href", `/categories/view?query=${window.encodeURIComponent(category['title'].toLowerCase())}`);

        container.appendChild(a0);
    });
};

const getAds = function() {
    const apiUrl = "/api/adverts/all";
    fetch(apiUrl).then(async function(response) {
        try {
            let result = await response.json();
            let data = dataValidation(result).data;
            // console.log(data);
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
                    // Assign a random index to randIndex
                    randIndex = Math.ceil((Math.random() * (arr.length - 1)));
                    // Use random index to select a random item
                    selectedItem = arr[randIndex];

                    // Store selected item in retArr(returned array)
                    retArr.push(selectedItem);
                    // Remove the selected item from the main array to avoid duplicates
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

const getDiscountedProducts = function () {
    const container = document.querySelector("#discounted-container.pane .slider");
    let apiUrl = `/api/goods/all/with-filter/?discount=true`;

    fetch(apiUrl).then(async response => {

        try {
            let result = await response.json();
            let data = dataValidation(result).data;
            if(data.length > 0){
                container.innerHTML = "";
                data.forEach(object => {
                    createItem(container, object);
                });

                document.querySelectorAll(".item .item-description span:first-child").forEach(el => {
                    $clamp(el, {clamp: 2});
                });
            }
            
            else {
                container.style.justifyContent = 'center';
                container.style.alignItems = 'center';
                container.style.color = "#999";
                container.style.fontSize = "1.3rem";
                container.style.padding = "3rem";
                container.innerHTML = "<i>No discounted product available at the moment!</i>";
            }

            // console.log(data);
            
        } catch (error) {
            console.error(error);
        }

    }).catch(function(error) {
        console.error(error);
    });
};

const getCategories = function() {
    const container = document.querySelector("#categories-container .slider");
    fetch(`/api/categories`).then(async response => {
        try {
            let result = await response.json();
            let data = dataValidation(result).data;

            createCategoryItem(container, data);
        } catch (error) {
            console.error(error);
        }
    }).catch(function(error) {
        console.error(error);
    });
};

document.addEventListener("DOMContentLoaded", function () {
    // createDummyItem(document.querySelector("#most-popular-container.pane .slider"), 5);
    // createDummyItem(document.querySelector("#recommended-container.pane .slider"), 5);

    getMostPopular();
    getCategories();
    getDiscountedProducts();
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