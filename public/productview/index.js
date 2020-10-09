let myDevice = null;
let itemID = getQuery()["queryItem"];
let globalItem = null
let preferredItem = {};
let allFields = null;
let ct = null;

const priceQtyHandler = function(evt) {
    let qty = evt.currentTarget.value;
    let price = qty * parseInt(globalItem["item-price"]);

    allFields["total"].innerHTML = formatAsMoney(price);
    preferredItem["item-qty"] = qty;
    preferredItem["item-price"] = price;
};

const saveHandler = function(evt) {
    const itemID = evt.currentTarget.id.split("_")[1];
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
        setTimeout(()=>{
            window.location.href = `/login?redirect=true&redirect_url=${window.encodeURIComponent(window.location.href)}`;
        }, 2999);
    }
};

const cartHandler = function(evt) {
    const itemID = evt.currentTarget.id.split("_")[1];
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

const setDominantColor = function (img) {
    let dominantColor = `rgb(${ct.getColor(img).join(',')})`;
    document.querySelector("main .bg-image-container").style.backgroundColor = dominantColor;
};

const generateTestImage = function(src){
    let img00 = new Image(150, 150);
    img00.crossOrigin = "anonymous";
    img00.src = `${src}`;
    return img00;
};

const createNav = function(number, img, active) {
    active = active || false; 
    
    let container = document.querySelector(".card-container .product-card .product-nav");
    let span0 = null;
    if(active){
        span0 = createComponent("SPAN", null, ["active"]);
    }else{
        span0 = createComponent("SPAN");
    }
    
    span0.setAttribute(`data-nav-${number}`, true);
    span0.setAttribute("data-pic", img);
    span0.addEventListener("click", function(evt) {
        setActiveNav(evt.currentTarget);
        let navImage = evt.currentTarget.getAttribute("data-pic");
        let imgSource = (navImage === '')? "../assets/images/nullimg.png" : navImage;

        console.log(imgSource);

        allFields["frontImage"].style.backgroundImage = `url(${imgSource})`;
        let img00 = generateTestImage(`${imgSource}`);
        img00.onload = function(ev){
            setDominantColor(img00);
        };
    });

    container.appendChild(span0);
};

const fetchProduct = function () {
    fetch(`/api/goods/${itemID}`).then(async function(response) {
        try {
            let data = await response.json();
            let [item] = data;
            globalItem = item;
    
            if(item.error && item.code === 404){
                alert(item.message);
            }else{
                // console.log(item);
                const saveBtn = allFields["saveBtn"], cartBtn = allFields["cartBtn"], quantity = allFields["quantity"];
    
                saveBtn.setAttribute("id", `save_${globalItem["_id"]}`);
                cartBtn.setAttribute("id", `cart_${globalItem["_id"]}`);
    
                saveBtn.addEventListener("click", saveHandler);
                cartBtn.addEventListener("click", cartHandler);
                quantity.addEventListener("change", priceQtyHandler);
    
                let price = formatAsMoney(parseInt(item["item-price"]));
    
                allFields["price"].innerHTML = price;
                allFields["total"].innerHTML = formatAsMoney(parseInt(item["item-price"]) * quantity.value);;
                preferredItem["item-qty"] = 1;
                
                document.title = `Univers | ${item["item-name"].toUpperCase()}`;
                allFields["title"].innerHTML = item["item-name"];
                allFields["shortDesc"].innerHTML = item["short-desc"] || 'No summary available for this product';
                allFields["longDesc"].innerHTML = item["item-desc"];
                if(item["price-discount"]){
                    allFields["discount"].style.display = "block";
                    allFields["discount"].innerHTML = `-${item["price-discount"]}% off`;
                }
                
                allFields["frontImage"].style.backgroundImage = `url(${item["item-image"][0]})`;

                let img00 = generateTestImage(`${item["item-image"][0]}`);
                img00.onload = function(ev){
                    setDominantColor(img00);
                };

                item["item-image"].forEach((img, index) => {
                    if(index === 0){
                        createNav(index, img, true);
                    }else{
                        createNav(index, img);
                    }
                });

                
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

    // myDevice = function(x) {
    //     if (!x.matches) { // If media query is not true
    //         try {
    //             gsap.from(document.querySelector("main .card-container"), 1.5, {marginLeft: "100vw", ease: "elastic.out(0.3, 0.2)"});
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     }
    // }

    // let x = window.matchMedia("(max-width: 800px)");
    // myDevice(x); // Call listener function at run time
    // x.addListener(myDevice);        

    fetchProduct();
});
