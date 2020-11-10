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
    getMyStoreItems();
});

const createNoItemTag = function(container, text){
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    if (container.classList.contains("rows")) container.classList.replace("rows", "cols");
    container.innerHTML = `<span id='no-item'>${text}</span><a id="go-shopping-btn" href="/">START SHOPPING</a>`;
};

const getMyStoreItems = function() {
    const fetchItems = function () {
        fetch(`/api/user/${getCookie("univers-username").value}/getStoreItems`).then(async function(response) {
            try {
                // debugger;
                let cover = document.querySelector(".vendor-bg-cover");
                let result = await response.json();

                if(result.length > 0 && result[0].error){
                    cover.style.top = "0vh";
                }else{
                    globals.store.items = result;
                    document.querySelector("#subtitle").innerHTML = `${result.length} items`;
                    container.innerHTML = "";

                    if(result.length > 0){
                        forEach(result, function(item) {
                            createStoreItem(container, item);
                        });

                        // document.querySelectorAll(".store-item .item-name").forEach(el => {
                        //     $clamp(el, {clamp: 2});
                        // });
                    }else{
                        createNoItemTag(container, "Nothing in your store yet");
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }).catch(function(error) {
            console.log(error);
        });
    };

    const container = document.querySelector("#store-box .store-item-container");
    document.querySelector(".control-body #store-box").style.display = "flex";

    // Check if vendor exists first...
    fetch(`/api/vendors/${getCookie("univers-username").value}`).then(async function(response) {
        try {
            let cover = document.querySelector(".vendor-bg-cover");
            let result = await response.json();

            if(result.length > 0 && result[0].error){
                cover.style.top = "0vh";
            }else{
                fetchItems();
            }

        } catch (error) {
            console.log(error);
        }
    }).catch(function(error) {
        console.log(error);
    })
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

const togglePublish = function(evt) {
    const target = evt.currentTarget;
    const itemID = target.id.split("_")[1];
    const state = target.classList.contains('on');
    const apiUrl = `/api/goods/save/${getCookie("univers-username").value}/publish`;

    target.setAttribute("disabled", true);

    fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify({itemID, state}),
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        }
    }).then(async response => {
        try {
            let result = await response.json();
            if(result){
                target.removeAttribute("disabled");
                displayResponse("Published succesfully!");
            }
            
        } catch (error) {
            console.error(error);
            displayResponse("An error occurred", {type: "error"});
        }
    }).catch(error => {
        console.error(error);
        target.removeAttribute("disabled");
        displayResponse("An error occurred", {type: "error"});
        // addToggleAction(evt);
    });
};

const removeStoreItem = function(item_id){
    const container = document.querySelector("#store-box");
    const apiUrl = `/api/goods/save/${getCookie("univers-username").value}/deleteFromStore`;

    fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify({itemID: item_id}),
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }).then(async response => {
        try {
            let result = await response.json();
            console.log(result);

            if(result && result.result.n > 0){
                const element = document.querySelector(`#storeItem_${item_id}`);
                element.parentNode.removeChild(element);
                globals.store.items = globals.store.items.filter(item => {
                    return item[`_id`] !== item_id;
                });
                document.querySelector("#subtitle").innerHTML = `${globals.store.items.length} items`;
                displayResponse("Item has been removed from your store succesfully!")
                if(globals.store.items.length === 0){
                    createNoItemTag(container, "No item in your store yet. Click the [NEW ITEM] button to add one.");
                }
            }else{
                displayResponse("An error occured!", {type: "error"});
            }
        } catch (error) {
            console.error(error);
        }
        
    }).catch(error => {
        console.error(error);
    });
};

const createStoreItem = function(container, object) {
    // <span class="grid store-item gr">
    //     <img src="/assets/images/IMG-20180120-WA0001.jpg" alt="">
    //     <span class="item-name">Sony Fifa 20 Standard Edition-PS4</span>
    //     <span class="item-qty">Quantity: 1</span>
    //     <span class="item-price">NGN 15,000,000</span>
    //     <div class="rows mod-controls">
    //         <button class="icofont-pencil"></button>
    //         <button class="icofont-bin"></button>
    //     </div>
    //     <button class="icofont-globe publish-btn"></button>
    // </span>

    let price = formatAsMoney(parseInt(object['item-price']), currencyLocale);

    let div0 = createComponent("div", null, ["grid","store-item", "gr"]);
        const img0 = createComponent("IMG", null, ["lazyload"]);
        let span1 = createComponent("SPAN", `${object['item-name']}`, ["item-name", "line-clamp", "line-clamp-2"]);
        let span2 = createComponent("SPAN", `Quantity: ${object['item-qty']}`, ["item-qty"]);
        let span3 = createComponent("SPAN", `${price}`, ["item-price"]);
        let div1 = createComponent("div", null, ["rows", "mod-controls"]);
            let button10 = createComponent("BUTTON", null, ["icofont-pencil"]);
            let button11 = createComponent("BUTTON", null, ["icofont-bin"]);
        let button20 = createComponent("BUTTON", null, ["toggle-switch", "publish-btn"]);
            let div2 = createComponent("DIV", null, ["toggle-ball", ]);

    div0.setAttribute("id", `storeItem_${object['_id']}`);
    img0.setAttribute("id", `image_${object['_id']}`);
    img0.setAttribute("data-src", `${object['item-image'][0]}`);
    button11.setAttribute("id", `remove_${object['_id']}`);
    button20.setAttribute("id", `publish_${object['_id']}`);
    button20.setAttribute("title", `Toggle ON/OFF`)
    img0.addEventListener("click", function(evt){
        window.location.href = `/view/${evt.currentTarget.id.split("_")[1]}`;
    });

    button11.addEventListener('click', function(evt){
        let confirmation = confirm("Are you sure you want to delete this item from your store?");
        if(confirmation === true){
            removeStoreItem(evt.currentTarget.id.split("_")[1]);
        }
    });
    button20.addEventListener("click", addToggleAction);
    button20.addEventListener("click", togglePublish);

    if(object.published === true){
        button20.classList.add('on');
    }

    button20 = joinComponent(button20, div2);
    div1 = joinComponent(div1, button10, button11);
    div0 = joinComponent(div0, img0, span1, span2, span3, div1, button20);
    container.appendChild(div0);
};

const gridView = function(){
    document.querySelectorAll("#store-box .store-item-container .store-item.list").forEach(element => {
        if(element.classList.contains("list")){
            element.classList.remove("list");
            element.classList.add("gr");
        }
    });
};

const listView = function(){
    document.querySelectorAll("#store-box .store-item-container .store-item.gr").forEach(element => {
        if(element.classList.contains("gr")){
            element.classList.remove("gr");
            element.classList.add("list");
        }
    });
}

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