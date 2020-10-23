if(!getCookie("univers-username")){
    window.location.replace(`/login?redirect=true&redirect_url=${window.encodeURIComponent(window.location.href)}`);
};

const imgUrls = {};
const globals = {
    cart: {
        items: [],
        total: 0,
        netTotal: 0
    },
    saved: {
        items: []
    },
    store: {
        items: []
    },
    imgSpace : 4
};


document.addEventListener("DOMContentLoaded", function() {
    getSavedItems();
});

const createNoItemTag = function(container, text){
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.innerHTML = `<span id='no-item'>${text}</span><a id="go-shopping-btn" href="/">START SHOPPING</a>`;
};

const getSavedItems = function() {
    document.querySelector(".control-body #orders-box").style.display = "flex";

    fetch(`/api/user/${getCookie("univers-username").value}/getSavedItems`).then(async function(response) {
        try {
            let items = await response.json();
            const container = document.querySelector("#orders-box");

            // console.log(items);
            document.querySelector("#subtitle").innerHTML = `${items.length} items`;

            container.innerHTML = "";
            if(items.length > 0){
                let adsPosition = 3;
                items.forEach(function(item, index) {
                    if(index === adsPosition){
                        placeAds(container);
                        (adsbygoogle = window.adsbygoogle || []).push({});
                        adsPosition += 3;
                    }
                    globals.saved.items.push(item);
                    createItems(item, "save");
                });

                document.querySelectorAll(".item .item-name").forEach(el => {
                    $clamp(el, {clamp: 2});
                });
                gsap.from(document.querySelectorAll("#orders-box > *"), 0.6, {x: "100vw", ease: 'Power1.easeOut', stagger: 0.3})

            }else{
                createNoItemTag(container, "No saved item yet");
            }

        } catch (error) {
            console.log(error);
        }
    }).catch(function(error) {
        console.log(error);
    });
};

const placeAds = function(container) {

    let adsDiv = createComponent("DIV", null, ["item"]);
    let script = create('script');
    let ins = createComponent("INS", null, ["adsbygoogle"]);

    script.setAttribute("async", true);
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
    ins.style.display = "block";
    ins.style.width = "100%";
    ins.setAttribute("data-ad-format", "fluid");
    ins.setAttribute("data-ad-layout-key", "-fb+5w+4e-db+86");
    ins.setAttribute("data-ad-client", "ca-pub-6903692907552928");
    ins.setAttribute("data-ad-slot", "9318070099");

    adsDiv = joinComponent(adsDiv, script, ins);
    container.appendChild(adsDiv);
};

const removeItem = function(item_id, type){
    const container = document.querySelector("#orders-box");
    const checkoutBtn = document.querySelector("[data-pay-btn]");
    const apiUrl = (type === "save")? 'removeFromSaved' : 'removeFromCart';

    fetch(`/api/goods/save/${getCookie("univers-username").value}/${apiUrl}`, {
        method: "POST",
        body: JSON.stringify({itemID: item_id}),
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }).then(async response => {
        try {
            let result = await response.json();
            if(result && type === null){
                const element = document.querySelector(`#cartItem_${item_id}`);
                globals.cart.items = globals.cart.items.filter(item => {
                    return item[`_id`] !== item_id;
                });
                calculateCartTotal(globals.cart.items);
                element.parentNode.removeChild(element);
                document.querySelector("#subtitle").innerHTML = `${globals.cart.items.length} items`;
                if(globals.cart.items.length === 0){
                    createNoItemTag(container, "No item in your cart yet");
                    checkoutBtn.style.display = "none";
                }
            }else{
                const element = document.querySelector(`#savedItem_${item_id}`);
                globals.saved.items = globals.saved.items.filter(item => {
                    return item[`_id`] !== item_id;
                });
                element.parentNode.removeChild(element);
                document.querySelector("#subtitle").innerHTML = `${globals.saved.items.length} items`;
                if(globals.saved.items.length === 0){
                    createNoItemTag(container, "No item saved yet");
                }
            }
        } catch (error) {
            console.error(error);
        }
        
    }).catch(error => {
        console.error(error);
    });
};

const createItems = function(items, type) {
    // console.log(items);
    type = type || null;
    const container = document.querySelector("#orders-box");
    // <div class="item">
    //     <img src="/assets/images/IMG-20180120-WA0001.jpg" alt="">
    //     <div class="info cols">
    //         <div class="rows top">
    //             <div class="item-brand">fashion</div>
    //             <button class="strip-btn icofont-close"></button>
    //         </div>
            
    //         <span class="item-name">Sony Fifa 20 Standard Edition-PS4</span>
    //         <span class="item-price">N15,000,000</span>
    //         <span class="item-controls">
    //             <button class="">Save Item</button>
    //         </span>
    //     </div>
    // </div>
    let price = formatAsMoney(parseInt(items['item-price']));

    let div0 = createComponent("div", null, ["item"]);
        const img0 = createComponent("IMG", null, ["lazyload"]);
        let div1 = createComponent("DIV", null, ["info", "cols"]);
            let div10 = createComponent("div", null, ["rows", "top"]);
                let div101 = createComponent("DIV", `${items['item-brand'] || items['categories'][0]}`, ["item-brand"]);
                let button101 = createComponent("BUTTON", null, ["strip-btn", "icofont-close"]);
            let span10 = createComponent("SPAN", `${items['item-name']} (x${items['item-qty']})`, ["item-name"]);
            let span11 = createComponent("SPAN", `${price}`, ["item-price"]);
            let span12 = createComponent("SPAN", null, ["item-controls"]);
                const button120 = createComponent("BUTTON", "Save For Later");

    const mainID = (type === "save")? `savedItem_${items['_id']}`: `cartItem_${items['_id']}`
    div0.setAttribute("id", mainID);
    img0.setAttribute("id", `image_${items['_id']}`);
    img0.setAttribute("alt", `${items['item-name'].toUpperCase()}`);
    img0.setAttribute("data-src", `${items['item-image'][0]}`);
    button101.setAttribute("id", `remove_${items['_id']}`);

    img0.addEventListener("click", function(evt){
        window.location.href = `/view/${evt.currentTarget.id.split("_")[1]}`;
    });

    button101.addEventListener("click", function(evt){
        removeItem(evt.currentTarget.id.split("_")[1], type);
    });

    div10 = joinComponent(div10, div101, button101);
    span12 = joinComponent(span12, button120);

    div1 = joinComponent(div1, div10, span10, span11, span12);
    div0 = joinComponent(div0, img0, div1);
    container.appendChild(div0);

};

const createCheckOption = function(container, option) {
    // <input type="checkbox" name="categories" id="">
    // <label for="">Fasion</label>

    const id = `cat-option-${genHex(4)}`;
    let span0 = create("SPAN");
    const input0 = create("INPUT");
    const label0 = createComponent("LABEL", option.title);

    span0.classList.add("wrapper");
    input0.setAttribute("type", "checkbox");
    input0.setAttribute("name", "categories");
    input0.setAttribute("value", option.title);
    input0.setAttribute("id", id);
    label0.setAttribute("for", id);

    input0.addEventListener("change", function(evt) {
        if(evt.target.checked === true){
            document.querySelector(`[value='${evt.target.value}']+label`).style.color = "orangered";
        }else{
            document.querySelector(`[value='${evt.target.value}']+label`).style.color = "black";
        }
    });

    span0 = joinComponent(span0, input0, label0);
    container.appendChild(span0);
};





