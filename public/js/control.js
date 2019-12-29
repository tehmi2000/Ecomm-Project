const imgUrls = {};
const globals = {};


document.addEventListener("DOMContentLoaded", function() {
    const activeSection = get_query().sectid;

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

    if(get_cookie("username")){
        selector[`${activeSection}`].classList.add("active");
        document.querySelector("#title").innerHTML = selector[`${activeSection}`].getAttribute("data-title");
        document.querySelector("#subtitle").innerHTML = subSelection[`${activeSection}`];

        functionSelector[`${activeSection}`]();
    }else{
        window.location.replace("/login");
    }

    document.querySelector("#post-box #addToStore-form").addEventListener("submit", formHandler);
    document.querySelectorAll("#post-box [name='item-image']").forEach(element => {
        element.addEventListener("change", imageUploadHandler);
    });
    
});

const displayUploadState = function(statusText, end){
    end = end || null;
    const container = document.querySelector("#post-box .gallery .status-bar");
    // if(container.style.display === "none"){
        container.style.display = "block";
    // }

    container.innerHTML = statusText;

    if(end && end === true){
        setTimeout(()=>{
            container.style.display = "none";
        }, 5000);
    }
};

const imageUploadHandler = function(evt){
    const uploadImage = (name, file) => {
        const fd = new FormData();
        fd.append(name, file);

        fetch('/upload', {
            method: "POST",
            body: fd
        }).then(async response => {
            let result = await response.json();
            console.log(result);
            if(Object.keys(imgUrls).indexOf(name) === Object.keys(imgUrls).length - 1){
                displayUploadState("Upload Complete!", true);
            }
        }).catch(error => {
            console.log(error);
        });
    };
    
    const reader = new FileReader();
    const elementId = evt.target.id;
    const file = evt.target.files[0];

    reader.readAsDataURL(file);
    reader.onload = function() {
        const previewElement = document.querySelector(`label[for='${elementId}']`);
        previewElement.innerHTML = "";
        previewElement.style.backgroundImage = `url(${reader.result})`;
        imgUrls[elementId] = file.name;
        setTimeout(() => {
            displayUploadState(`Uploading Image (${Object.keys(imgUrls).indexOf(elementId) + 1}/${Object.keys(imgUrls).length})`);
            uploadImage(elementId, file);
        }, 8000);
    };
};

const formHandler = function(evt) {
    evt.preventDefault();
    // debugger;
    let categoryField = [];
    let imageField = [];

    forEach(document.querySelectorAll("[name='categories']:checked"), function(field) {
        categoryField.push(field.value);
    });

    forEach(document.querySelectorAll("[name='item-image']"), function(field) {
        imageField.push('');
    });

    for (let i = 1; i <= Object.keys(imgUrls).length; i++) {
        imageField[i-1] = imgUrls[`preview-image-${i}`];
    }

    const bodyValue = {
        "item-image": imageField,
        "item-name": document.querySelector("[name='item-name']").value,
        "item-desc": document.querySelector("[name='item-desc']").value,
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
                window.location.href = "/myprofile/orders?sectid=3";
            }else{
                alert("Something unexpected happened. Try again!");
            }
            // alert(result);
        } catch (error) {
            console.error(error);
        }
    }).catch(function(error) {
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

    getAllCategories();
    getAllSizes();

    fetch(`/api/vendors/${get_cookie("username").value}`).then(async function(response) {
        try {
            let cover = document.querySelector(".vendor-bg-cover");
            let result = await response.json();

            if(result.length > 0 && result[0].error){
                // cover.style.top = "0vh";
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
        fetch(`/api/user/${get_cookie("username").value}/getStoreItems`).then(async function(response) {
            try {
                let cover = document.querySelector(".vendor-bg-cover");
                let result = await response.json();
    
                if(result.length > 0 && result[0].error){
                    cover.style.top = "0vh";
                }else{
                    document.querySelector(".control-body #post-box").style.flexDirection = "row";
                    document.querySelector("#subtitle").innerHTML = `${result.length} items`;
                }
    
            } catch (error) {
                console.log(error);
            }
        }).catch(function(error) {
            console.log(error);
        });
    };

    document.title = `${document.title} || Manage Your Posts`;
    const container =  document.querySelector(".control-body #store-box");
    container.style.display = "flex";

    fetch(`/api/vendors/${get_cookie("username").value}`).then(async function(response) {
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
    });  
};

const getSavedItems = function() {
    document.title = `${document.title} || Saved Items`;
    document.querySelector(".control-body #orders-box").style.display = "flex";

    fetch(`/api/user/${get_cookie("username").value}/getSavedItems`).then(async function(response) {
        try {
            let items = await response.json();
            const container = document.querySelector("#orders-box");

            // console.log(items);
            document.querySelector("#subtitle").innerHTML = `${items.length} items`;

            container.innerHTML = "";
            if(items.length > 0){
                forEach(items, function(item) {
                    createItems(item);
                });

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

const getMyCart = function() {
    const checkoutBtn = document.querySelector("[data-pay-btn]");
    document.title = `${document.title} || View Cart`;
    document.querySelector(".control-body #orders-box").style.display = "flex";
    fetch(`/api/user/${get_cookie("username").value}/getCart`).then(async function(response) {
        try {
            let items = await response.json();
            const container = document.querySelector("#orders-box");
            document.querySelector("#subtitle").innerHTML = `${items.length} items`;
            // console.log(items);

            container.innerHTML = "";
            if(items.length > 0){
                globals['cartTotal'] = formatAsMoney(items.reduce((total, current) => {
                    const price = current["item-price"];
                    const qty = current["item-qty"];

                    total += parseInt(price) * qty;
                    return total;
                }, 0));

                checkoutBtn.style.display = "block";
                checkoutBtn.innerHTML = `Checkout Now`;
                forEach(items, function(item) {
                    createItems(item);
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

const createItems = function(items) {
    // console.log(items);
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
        const img0 = create("IMG");
        let div1 = createComponent("DIV", null, ["info", "cols"]);
            let div10 = createComponent("div", null, ["rows", "top"]);
                let div101 = createComponent("DIV", `${items['item-brand'] || items['categories'][0]}`, ["item-brand"]);
                let button101 = createComponent("BUTTON", null, ["strip-btn", "icofont-close"]);
            let span10 = createComponent("SPAN", `${items['item-name']} (x${items['item-qty']})`, ["item-name"]);
            let span11 = createComponent("SPAN", `${price}`, ["item-price"]);
            let span12 = createComponent("SPAN", null, ["item-controls"]);
                const button120 = createComponent("BUTTON", "Save For Later");

    img0.setAttribute("id", `image_${items['_id']}`);
    img0.setAttribute("src", `${items['item-image'][0]}`);
    button101.setAttribute("id", `remove_${items['_id']}`);

    img0.addEventListener("click", function(evt){
        window.location.href = `/view/${evt.currentTarget.id.split("_")[1]}`;
    });

    button101.addEventListener("click", function(evt){
        console.log(`Removed Item: ${evt.currentTarget.id.split("_")[1]}`);
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

    const id = "";
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
                // debugger;
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






