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
    const activeSection = getQuery().sectid;

    const selector = {
        "1": document.querySelector("#one"),
        "2": document.querySelector("#three"),
        "3": document.querySelector("#three"),
        "4": document.querySelector("#four")
    };

    const subSelection = {
        "1": "",
        "2": "Sell your product(s)",
        "3": "",
        "4": ""
    };

    const functionSelector = {
        "1": getMyCart,
        "2": showPostForm,
        "3": getMyStoreItems,
        "4": getSavedItems
    };

    if(getCookie("univers-username")){
        selector[`${activeSection}`].classList.add("active");
        document.querySelector("#title").innerHTML = selector[`${activeSection}`].getAttribute("data-title");
        document.querySelector("#subtitle").innerHTML = subSelection[`${activeSection}`];

        functionSelector[`${activeSection}`]();
    }else{
        window.location.replace(`/login?redirect=true&redirect_url=${window.encodeURIComponent(window.location.href)}`);
    }

    document.querySelector("#post-box #addToStore-form").addEventListener("submit", formHandler);
    document.querySelectorAll("#post-box [name='item-image']").forEach(element => {
        element.addEventListener("change", imageUploadHandler);
    });
    
});

const displayUploadState = function(statusText, end, status){
    status = status || 200;
    end = end || null;
    const container = document.querySelector("#post-box .gallery .status-bar");
    container.style.display = "block";

    container.innerHTML = statusText;

    if(end && end === true){
        setTimeout(()=>{
            container.style.display = "none";
        }, 5000);
    }

    if(status >= 400){
        container.style.backgroundColor = "rgba(255, 25, 25, 0.85)";
    }else{
        container.style.backgroundColor = "rgba(54, 177, 248, 0.85)";
    }
};

const imageUploadHandler = function(evt){
    const uploadImage = (name, file) => {
        // debugger
        const fd = new FormData();
        fd.append(name, file);

        fetch('/upload', {
            method: "POST",
            body: fd
        }).then(async response => {
            let result = await response.json();
            let [data] = result;

            if(data.status === 200){
                document.querySelector(`#${name}`).setAttribute("data-version", data.version);
                document.querySelector(`label[for='${name}']`).innerHTML = "";
                // console.log(result);
                if(Object.keys(imgUrls).indexOf(name) === Object.keys(imgUrls).length - 1){
                    displayUploadState("Upload Complete!", true);
                }
            }else{
                document.querySelector(`#${name}_upload-action`).classList.toggle("progress", false);
                document.querySelector(`#${name}_upload-action`).classList.toggle("icofont-check", true);
                document.querySelector(`#${name}_upload-action`).classList.toggle("icofont-refresh", false);
                displayUploadState("Upload Failed!", true, data.status);
            }

        }).catch(error => {
            console.log(error);
        });
    };
    
    const reader = new FileReader();
    const elementId = evt.target.id;
    const file = evt.target.files[0];

    if(file){
        reader.readAsDataURL(file);
    }

    reader.onload = function() {
        const previewElement = document.querySelector(`label[for='${elementId}']`);
        previewElement.innerHTML = "";
        previewElement.style.backgroundImage = `url(${reader.result})`;

        let divB = createComponent("DIV", null, ["rows"]);
            let uploadB = createComponent("span", null, ["rows", "icofont-check", "img-action"]);
            let deleteB = createComponent("span", null, ["rows", "icofont-close", "img-action"]);

        divB.setAttribute("id", `${elementId}_action-container`);
        uploadB.setAttribute("id", `${elementId}_upload-action`);
        deleteB.setAttribute("id", `${elementId}_delete-action`);

        uploadB.addEventListener("click", function(evt){
            // debugger
            evt.currentTarget.classList.toggle("progress", true);
            evt.currentTarget.classList.toggle("icofont-check", false);
            evt.currentTarget.classList.toggle("icofont-refresh", true);
            displayUploadState(`Uploading Image (${Object.keys(imgUrls).indexOf(elementId) + 1}/${Object.keys(imgUrls).length})`);
            uploadImage(elementId, file);
        });

        deleteB.addEventListener("click", function(evt) {
            previewElement.style.backgroundImage = `none`;
            previewElement.innerHTML =`Click to insert image<br>(${elementId.split("-")[2]} of 4)`;
            document.querySelector(`#${elementId}`).value = '';
            delete imgUrls[elementId];
            document.querySelector(`#${elementId}`).removeAttribute("disabled");
        });

        divB = joinComponent(divB, uploadB, deleteB);
        previewElement.appendChild(divB);
        document.querySelector(`#${elementId}`).setAttribute("disabled", true);

        imgUrls[elementId] = file.name;
    };
};

const formHandler = function(evt) {
    const setState = function(state, label) {
        label = label || "Uploading To Store...";
        const submitBtn = document.querySelector(`#post-box input[type="submit"]`);
        if(state === true){
            submitBtn.value = label;
            submitBtn.classList.toggle("saving", true);
            submitBtn.setAttribute("disabled", true);
        }else{
            submitBtn.value = "Add to Store";
            submitBtn.classList.toggle("saving", false);
            submitBtn.removeAttribute("disabled");
        }
    };

    evt.preventDefault();
    const submitForm = function(){
        let categoryField = [];
        let imageField = [];

        forEach(document.querySelectorAll("[name='categories']:checked"), function(field) {
            categoryField.push(field.value);
        });

        // Get all image field element and set content to version
        document.querySelectorAll("[name='item-image']").forEach(function(field) {
            if(field.value !== ''){
                imageField.push(field.getAttribute("data-version") || '');
            }
        });

        // Rewrite the content of each image field
        for (let i = 1; i <= Object.keys(imgUrls).length; i++) {
            imageField[i-1] = `v${imageField[i-1]}/` + imgUrls[`preview-image-${i}`];
        }

        const bodyValue = {
            "item-image": imageField,
            "item-name": document.querySelector("[name='item-name']").value,
            "short-desc": document.querySelector("[name='item-short-desc']").value,
            "item-desc": preFormatInput(document.querySelector("[name='item-desc']").value),
            categories: categoryField,
            sellerID: document.querySelector("[name='sellerID']").value,
            "item-price": document.querySelector("[name='item-price']").value,
            "item-qty": document.querySelector("[name='item-qty']").value
        };

        fetch(`/api/goods/save`, {
            method: "POST",
            body: JSON.stringify(bodyValue),
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        }).then(async function(response) {
            try {
                let result = await response.json();
                if(!result[`error`]){
                    alert("Saved to Store!");
                    setState(false);
                    window.location.href = "/myprofile/orders?sectid=3";
                }else{
                    alert("Something unexpected happened. Try again!");
                    setState(false);
                }
                // alert(result);
            } catch (error) {
                console.error(error);
            }
        }).catch(function(error) {
            console.error(error);
        });
    };

    setState(true);
    fetch(`/api/vendors/${document.querySelector("[name='sellerID']").value}`).then(async function(response){
        try {
            let result = await response.json();
            if(result.length > 0 && result[0].error){
                alert("SellerID is Invalid!");
                setState(false);
            }else{
                submitForm();
            }
        } catch (error) {
            console.error(error);
        }
    }).catch(function(error){
        console.error(error);
    });
};

const createNoItemTag = function(container, text){
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.innerHTML = `<span id='no-item'>${text}</span>`;
};

const showPostForm = function() {
    const getAllSizes = function() {
        const createSizeOption = function(container, options) {
            let elementOptions = options.map(item => {
                const opt = create("OPTION");
                opt.value = item.name;
                opt.innerHTML = item.name;
                return opt;
            });
            container = joinComponent(container, ...elementOptions);
        };

        fetch(`/api/goods/item-sizes`).then(async response => {
            try {
                const container = document.querySelector("#props-box #size-tab select");
                let result = await response.json();
                globals.itemSizes = result;

                container.innerHTML = "";
                createSizeOption(container, result);
            } catch (err) {
                console.error(err);
            }
        }).catch(function(error) {
            console.error(error);
        });
    };

    const displaySizeOption = function(container, object){
        // <span class="size-item rows">S</span>
        let elementOptions = object.sizes.map(item => {
            const opt = createComponent("SPAN", item, ["size-item", "rows"]);
            return opt;
        });
        container.innerHTML = "";
        container = joinComponent(container, ...elementOptions);
    };

    document.title = `${document.title} || Sell Item`;
    document.querySelector(".control-body .body").style.height = "auto";
    document.querySelector(".control-body #post-box").style.display = "flex";

    document.querySelectorAll(`#post-box .tab-controls > *`).forEach(element => {
        element.addEventListener("click", function(evt){
            let tabID = evt.currentTarget.getAttribute("data-id");
            document.querySelector(`#${tabID}`).style.display = "flex";
            document.querySelector(`.tab-controls [data-id='${tabID}']`).style.display = "none";
        });
    });

    document.querySelectorAll("#props-box [id$='-tab'] .heading > *:last-child").forEach(element => {
        element.addEventListener("click", function(evt){
            let propPaneID = evt.currentTarget.getAttribute("data-id");
            document.querySelector(`#${propPaneID}`).style.display = "none";
            document.querySelector(`.tab-controls [data-id='${propPaneID}']`).style.display = "block";
        });
    });

    document.querySelector("#props-box #size-tab select").addEventListener("change", function(evt){
        const container = document.querySelector("#props-box #size-tab #size-props");

        displaySizeOption(container, globals[`itemSizes`].find(item => {
            return item.name === evt.currentTarget.value;
        }));
    });

    // Load all categories...
    getAllCategories();
    // Load all sizes...
    getAllSizes();

    // Check for vendorship...
    fetch(`/api/vendors/${getCookie("univers-username").value}`).then(async function(response) {
        try {
            let cover = document.querySelector(".vendor-bg-cover");
            let result = await response.json();

            if(result.length > 0 && result[0].error){
                cover.style.top = "0vh";
            }

        } catch (error) {
            console.log(error);
        }
    }).catch(function(error) {
        console.log(error);
    });
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

                        document.querySelectorAll(".store-item .item-name").forEach(el => {
                            $clamp(el, {clamp: 2});
                        });
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

    document.title = `${document.title} || Manage Your Store`;
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

const getSavedItems = function() {
    document.title = `${document.title} || Saved Items`;
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

const calculateCartTotal = function(items){
    globals.cart.total = items.reduce((total, current) => {
        const price = current["item-price"];
        const qty = current["item-qty"];

        total += parseInt(price) * qty;
        return total;
    }, 0);
};

const calculateTotalBill = function(){
    let data = {
        shipping: 600,
        cart: globals.cart.total,
        vat: (7.5/100)*globals.cart.total
    };
    return {
        ...data,
        total: data.shipping + data.cart + data.vat
    };
}

const getMyCart = function() {
    const checkoutBtn = document.querySelector("[data-pay-btn]");
    document.title = `${document.title} || View Cart`;
    document.querySelector(".control-body #orders-box").style.display = "flex";

    fetch(`/api/user/${getCookie("univers-username").value}/getCart`).then(async function(response) {
        try {
            let items = await response.json();
            const container = document.querySelector("#orders-box");
            let cover = document.querySelector(".payment-bg-cover");
            let coverClose = document.querySelector(".payment-bg-cover .close-btn");

            document.querySelector("#subtitle").innerHTML = `${items.length} items`;
            // console.log(items);

            container.innerHTML = "";
            if(items.length > 0){
                calculateCartTotal(items);

                checkoutBtn.style.display = "block";
                checkoutBtn.innerHTML = `Checkout Now`;
                checkoutBtn.addEventListener("click", function(){
                    let bills = calculateTotalBill();
                    globals.cart.netTotal = bills.total;
                    document.querySelector("#ship-fee").innerHTML = `+ ${formatAsMoney(bills.shipping)}`;
                    document.querySelector("#cart-total").innerHTML = formatAsMoney(bills.cart);
                    document.querySelector("#vat-fee").innerHTML = `+ ${formatAsMoney(bills.vat)}`;
                    document.querySelector("#total-bill").innerHTML = formatAsMoney(bills.total);

                    cover.style.top = "0vh";
                });

                coverClose.addEventListener("click", function(evt) {
                    cover.style.top = "-120vh";
                })

                forEach(items, function(item) {
                    globals.cart.items.push(item);
                    createItems(item);
                });

                document.querySelectorAll(".item .item-name").forEach(el => {
                    $clamp(el, {clamp: 2});
                });

                // Animate items
                gsap.from(document.querySelectorAll("#orders-box > *"), 0.6, {x: "100vw", ease: 'Power1.easeOut', stagger: 0.3})

            }else{
                createNoItemTag(container, "No item in your cart yet");
            }

        } catch (error) {
            console.log(error);
        }
    }).catch(function(error) {
        console.log(error);
    });
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

    let price = formatAsMoney(parseInt(object['item-price']));

    let div0 = createComponent("div", null, ["grid","store-item", "gr"]);
        const img0 = createComponent("IMG", null, ["lazyload"]);
        let span1 = createComponent("SPAN", `${object['item-name']}`, ["item-name"]);
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

const getAllCategories = function() {
    fetch(`/api/categories`).then(async function(response) {
        try {
            let category_list = await response.json();
            forEach(category_list, function(element) {
                createCheckOption(document.querySelector("#option-box"), element);
            });

        } catch (err) {
            console.error(err);
        }
    }).catch(function(error) {
        console.error(error);
    });
};

const createVendorNotifier = function() {
    
};






