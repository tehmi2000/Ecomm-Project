if(!getCookie("univers-username")){
    window.location.replace(`/login?redirect=true&redirect_url=${window.encodeURIComponent(window.location.href)}`);
};

const itemID = getQuery()['itemid'];
// const imgUrls = {};
const globals = {
    // imgSpace : 4
};

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
        imageField = imageField.map((imgVersionNumber, index) => {
            return `v${imgVersionNumber}/` + imgUrls[`preview-image-${index + 1}`];
        });
        // for (let i = 1; i <= Object.keys(imgUrls).length; i++) {
        // imageField[i-1] = `v${imageField[i-1]}/` + imgUrls[`preview-image-${i}`];
        // }

        const bodyValue = {
            "item-image": imageField,
            "item-name": document.querySelector("[name='item-name']").value,
            "short-desc": document.querySelector("[name='item-short-desc']").value,
            "item-desc": preFormatInput(document.querySelector("[name='item-desc']").value),
            categories: categoryField,
            sellerID: document.querySelector("[name='sellerID']").value,
            "item-price": parseFloat(document.querySelector("[name='item-price']").value),
            "item-qty": parseInt(document.querySelector("[name='item-qty']").value)
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
                    window.location.href = "/myprofile/products/my-store/";
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
}

const createCheckOption = function(container, option) {
    // <input type="checkbox" name="categories" id="">
    // <label for="">Fasion</label>

    const id = `cat-option-${genHex(4)}`;
    let span0 = createComponent("SPAN", null, ["wrapper"]);
    const input0 = create("INPUT");
    const label0 = createComponent("LABEL", option.title);

    input0.setAttribute("type", "checkbox");
    input0.setAttribute("name", "categories");
    input0.setAttribute("value", option.title);
    input0.setAttribute("id", id);
    label0.setAttribute("for", id);

    input0.addEventListener("change", function(evt) {
        let categoryOption = document.querySelector(`[value='${evt.target.value}']+label`);
        categoryOption.style.color = (evt.target.checked === true)? "orangered" : "black";
    });

    span0 = joinComponent(span0, input0, label0);
    container.appendChild(span0);
};

const getAllCategories = function() {
    fetch(`/api/categories`).then(async response => {
        try {
            let categoryList = await response.json();
            categoryList.forEach(element => {
                createCheckOption(document.querySelector("#option-box"), element);
            });
        } catch (err) {
            console.error(err);
        }
    }).catch(function(error) {
        console.error(error);
    });
};

const getAllSizes = function() {
    let itemSizesSuccessCallback = function (result) {
        let container = document.querySelector("#props-box #size-tab select");
        globals.itemSizes = result;
        container.innerHTML = "";
        let elementOptions = result.map(item => {
            const opt = createComponent("OPTION", item.name);
            opt.value = item.name;
            return opt;
        });
        container = joinComponent(container, ...elementOptions);
    };

    fetchAndCacheData(`/api/goods/item-sizes`, itemSizesSuccessCallback);
};

const loadNeededApis = function () {
    
    // Load all categories...
    getAllCategories();
    // Load all sizes...
    getAllSizes();
};

const loadElementHandlers = function (productData) {
    // document.querySelector("#post-box #addToStore-form").addEventListener("submit", formHandler);
    // document.querySelectorAll("#post-box [name='item-image']").forEach(element => {
    //     element.addEventListener("change", imageUploadHandler);
    // });

    if(productData !== null){
        let previewImgContainer = document.querySelector("#addToStore-form .preview-pane .slider");
        document.querySelector(".control-body #subtitle").textContent = `Product ID: ${itemID}`;
        
        // Create preview images and assign handlers to each
        let arrayOfImgElement = productData['item-image'].map((imgLink, index) => {
            let imgElement = createComponent("IMG", null, ["preview-img", "lazyload"]);
            imgElement.src = "/assets/images/nullimg.png";
            imgElement.setAttribute("data-src", imgLink);
            imgElement.alt = `${productData["item-name"]} ${index}`;
            return imgElement;
        });
    
        previewImgContainer.innerHTML = '';
        arrayOfImgElement.forEach(el => {
            previewImgContainer.appendChild(el);
        });

        // Make first image the initial display
        // productData['item-image']
        let displayImgContainer = document.querySelector("#addToStore-form #preview-image-1");
        let displayImgInput = document.querySelector("#addToStore-form #changepic");

        displayImgContainer.style.backgroundImage = `url(${productData['item-image'][0]})`;
        // Input data into each field in form
    }
    

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

        // <span class="size-item rows">S</span>
        let selectedObject = globals[`itemSizes`].find(item => {
            return item.name === evt.currentTarget.value;
        });

        let elementOptions = selectedObject.sizes.map(item => {
            const opt = createComponent("SPAN", item, ["size-item", "rows"]);
            return opt;
        });
        container.innerHTML = "";
        container = joinComponent(container, ...elementOptions);
    });    
}

const checkForVendorship = () => {
    // Check for vendorship...
    fetch(`/api/vendors/${getCookie("univers-username").value}`).then(async function(response) {
        try {
            let cover = document.querySelector(".vendor-bg-cover");
            let result = await response.json();

            if(result.length > 0 && result[0].error) {
                cover.style.top = "0vh";
            }else{
                loadNeededApis();
            }

        } catch (error) {
            console.error(error);
        }
    }).catch(error => {
        console.error(error);
    });
};

const getProductDetails = function() {
    // fetch details of the product from the database...
    if(itemID !== null){
        fetch(`/api/goods/${itemID}`).then(async function(response) {
            try {
                let result = await response.json();
                // console.log(result);
                let [product] = result;
                loadElementHandlers(product);
    
            } catch (error) {
                console.error(error);
            }
        }).catch(error => {
            console.error(error);
        });
    }
    
};

const initializeForm = function() {
    // document.title = `${document.title}`;
    document.querySelector(".control-body .body").style.height = "auto";
    checkForVendorship();
    getProductDetails();
};


document.addEventListener("DOMContentLoaded", function() {
    initializeForm();
});