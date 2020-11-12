let itemID = getQuery()["queryItem"];
let globalItem = null
let preferredItem = {};
let allFields = null;
let ct = null;
let activeImageIndex = 0;

const priceQtyHandler = function(evt) {
    let qty = evt.currentTarget.value;
    let price = qty * parseInt(globalItem["item-price"]);

    allFields["total"].innerHTML = formatAsMoney(price, currencyLocale);
    preferredItem["item-qty"] = qty;
    preferredItem["item-price"] = price;
};

const saveHandler = function(evt) {
    const savedItem = Object.assign({}, globalItem, preferredItem);

    if(getCookie("univers-username")){
        fetch(`/api/goods/save/${getCookie("univers-username").value}/addToSavedItems`, {
            method: "post",
            body: JSON.stringify({
                item: savedItem
            }),
            headers: {
                "Content-Type" : "application/json; charset=utf-8"
            }
        }).then(async function(response) {
            try {
                let result = await response.json();
                displayResponse("Item has been saved successfully!");
            } catch (error) {
                console.error(error);
            }
        }).catch(function(error) {
            console.error(error);
        }); 
    }else{
        displayResponse("You need to sign in first!");
        setTimeout(() => {
            window.location.href = `/login?redirect=true&redirect_url=${window.encodeURIComponent(window.location.href)}`;
        }, 2999);
    }
};

const cartHandler = function(evt) {
    const cartItem = Object.assign({}, globalItem, preferredItem);
    console.log(cartItem);

    if(getCookie("univers-username")){
        fetch(`/api/goods/save/${getCookie("univers-username").value}/addToCart`, {
            method: "post",
            body: JSON.stringify({
                item: cartItem
            }),
            headers: {
                "Content-Type" : "application/json; charset=utf-8"
            }
        }).then(async function(response) {
            try {
                let result = await response.json();
                displayResponse("Item has been carted successfully!");
            } catch (error) {
                console.error(error);
            }
        }).catch(function(error) {
            console.error(error);
        });
    }else{
        displayResponse("You need to sign in first!");
        setTimeout(()=>{
            window.location.href = `/login?redirect=true&redirect_url=${window.encodeURIComponent(window.location.href)}`;
        }, 2999);
    }
    
};

const setActiveNav = function(element) {
    document.querySelectorAll(".product-card .product-nav > *").forEach(nav => {
        if(nav.classList.contains("active") === true){
            nav.classList.remove("active");
        }
    });

    element.classList.add("active")
};

const setActiveTab = function(element) {
    document.querySelectorAll(".info-card .tab-wrapper .nav-tab").forEach(tab => {
        if(tab.classList.contains("active") === true){
            tab.classList.remove("active");
            let contentId = tab.getAttribute("data-id");
            document.querySelector(`#${contentId}`).classList.remove("active");
        }
    });

    element.classList.add("active");
    let contentId = element.getAttribute("data-id");
    document.querySelector(`#${contentId}`).classList.add("active");
};

const setProductImage = function (img, imgIndex) {
    img = img || '';
    imgIndex = imgIndex || 0;

    let imgSource = (img === '')? "/assets/images/nullimg.png" : img;
    allFields["frontImage"].style.backgroundImage = `url(${imgSource})`;
    activeImageIndex = imgIndex;

    // Set background color to dominant color of product image
    let img00 = generateTestImage(`${imgSource}`);
    img00.onload = function(){
        setDominantColor(img00);
    };
};

const setDominantColor = function (img) {
    let dominantColor = `rgb(${ct.getColor(img).join(',')})`;
    document.querySelector("main .bg-image-container").style.backgroundColor = dominantColor;
};

const generateTestImage = function(src){
    let img00 = new Image(150, 150);
    img00.crossOrigin = "anonymous";
    img00.src = `${src}`;
    img00.async = true;
    return img00;
};

const createNav = function(number, img, active) {
    // debugger;
    active = active || false;
    
    let container = document.querySelector(".card-container .product-card .product-nav");
    let span0 = (active)? createComponent("SPAN", null, ["active"]) : createComponent("SPAN");
    
    span0.setAttribute(`data-nav`, number);
    span0.setAttribute("data-pic", img);
    span0.style.backgroundImage = `url(${img})`;

    span0.addEventListener("click", function(evt) {
        setActiveNav(evt.currentTarget);
        let navImage = evt.currentTarget.getAttribute("data-pic");
        let navNumber = evt.currentTarget.getAttribute("data-nav");
        setProductImage(navImage, navNumber);
    });

    container.appendChild(span0);
};

const addToRecentlyViewedItems = function (item) {
    if ('sessionStorage' in window) {
        let keyNumber = item['_id'];
        sessionStorage.setItem(`product-${keyNumber}`, JSON.stringify(item));
    }

    return;
}

const fetchProduct = function () {
    fetch(`/api/goods/${itemID}`).then(async function(response) {
        try {
            let data = await response.json();
            let [item] = data;
    
            if(item.error && item.code === 404){
                alert(item.message);
            }else{
                globalItem = item;
                // console.log(item);
                document.title = `Univers | ${item["item-name"].toUpperCase()}`;
    
                allFields["saveBtn"].id = `save_${globalItem["_id"]}`;
                allFields["cartBtn"].id = `cart_${globalItem["_id"]}`;
    
                allFields["saveBtn"].addEventListener("click", saveHandler);
                allFields["cartBtn"].addEventListener("click", cartHandler);
                allFields["quantity"].addEventListener("change", priceQtyHandler);
    
                let price = formatAsMoney(parseInt(item["item-price"]), currencyLocale);
    
                allFields["price"].innerHTML = price;
                allFields["total"].innerHTML = formatAsMoney(parseInt(item["item-price"]) * allFields["quantity"].value, currencyLocale);;
                preferredItem["item-qty"] = 1;
                
                allFields["title"].innerHTML = item["item-name"];
                allFields["shortDesc"].innerHTML = item["short-desc"] || 'No summary available for this product';
                allFields["longDesc"].innerHTML = item["item-desc"];

                if(item["price-discount"]){
                    allFields["discount"].style.display = "block";
                    allFields["discount"].innerHTML = `-${item["price-discount"]}% off`;
                }

                let noColorElement = `<div id="no-color-element" class="rows"><div class="nullcircle"></div><span>No color specified for this product</span></div>`;
                if (item["item-colors"]) {
                    let allColorElement = item["item-colors"].map(color => {
                        return `<div class="color-element" style="background-color: ${color};"></div>`
                    }).join('');

                    allFields['colorContainer'].innerHTML = (item["item-colors"].length > 0)? allColorElement : noColorElement;
                }
                else{
                    allFields['colorContainer'].innerHTML = noColorElement;
                }

                item["item-image"].forEach((img, index) => {
                    if(index === 0){
                        createNav(index, img, true);
                    }else{
                        createNav(index, img);
                    }
                });

                // Add click listeners to previous and next buttons
                document.querySelector(".slider-buttons button[data-previous]").addEventListener("click", ev => {
                    if(globalItem["item-image"][activeImageIndex - 1]){
                        // Set Product Image to previous image
                        setProductImage(globalItem["item-image"][activeImageIndex - 1], activeImageIndex - 1);
                        setActiveNav(document.querySelector(`[data-nav='${activeImageIndex}']`));
                    }
                });

                document.querySelector(".slider-buttons button[data-next]").addEventListener("click", function (ev) {
                    if(globalItem["item-image"][activeImageIndex + 1]){
                        // Set Product Image to next image
                        setProductImage(globalItem["item-image"][activeImageIndex + 1], activeImageIndex + 1);
                        setActiveNav(document.querySelector(`[data-nav='${activeImageIndex}']`));
                    }
                });

                setProductImage(item["item-image"][0]);
            }
        } catch (error) {
            console.error(error);
        }
    }).catch(function(error) {
        console.error(error);
    });
}

const loadNeededElement = function () {
    allFields = {
        title: document.querySelector(".product-card .product-name"),
        shortDesc: document.querySelector(".product-card .product-short-desc"),
        longDesc: document.querySelector(".info-card #full-desc"),
        frontImage: document.querySelector(".product-card #product-pic"),
        backImage: document.querySelector(".bg-image-container"),
        price: document.querySelector(".info-card .product-price"),
        discount: document.querySelector('.info-card .discount-label'),
        colorContainer: document.querySelector('.info-card .pref-options #item-colors'),
        quantity: document.querySelector('.info-card .pref-options #quantity-input'),
        total: document.querySelector('.info-card .pref-options .total-input'),
        saveBtn: document.querySelector(".info-card .product-controls button:first-child"),
        cartBtn: document.querySelector(".info-card .product-controls button:last-child")
    };

    document.querySelectorAll(".info-card .tab-wrapper .nav-tab").forEach(tab => {
        tab.addEventListener("click", function(evt) {
            setActiveTab(evt.currentTarget);
        })
    });
};

document.addEventListener("DOMContentLoaded", function () {
    ct = new ColorThief();
    loadNeededElement();
    fetchProduct();
});

window.addEventListener("load", function(){

    addToRecentlyViewedItems(globalItem);
});