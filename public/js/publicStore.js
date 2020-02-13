const imgUrls = {};
const globals = {
};


document.addEventListener("DOMContentLoaded", function() {
    if(getCookie("username")){
        document.querySelector("#three").classList.add("active");
        document.querySelector("#title").innerHTML = document.querySelector("#three").getAttribute("data-title");
        document.querySelector("#subtitle").innerHTML = "Sell your products";

        getMyStoreItems();
    }else{
        window.location.replace("/login");
    }
});

const createNoItemTag = function(container, text){
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.innerHTML = `<span id='no-item'>${text}</span>`;
};

const sortIntoCategories = function (data) {
    // debugger;
    const container = document.querySelector("#store-box .store-item-container");
    const eachCategories = [];
    const storeFormat = [];

    data.forEach((eachItem) => {
        if(eachItem.categories.length === 0){
            eachItem.categories.push("Others");
        }
    });

    data.forEach((eachItem, index) => {
        eachItem.categories.forEach(dataCategory => {
            if(index === 0){
                eachCategories.push(dataCategory);
                storeFormat.push({
                    heading: dataCategory,
                    contents: [eachItem]
                });
            }else{
                let isUnique = !eachCategories.some(category => {
                    return category === dataCategory;
                });

                if(storeFormat.length > 0){
                    let hasFormat = storeFormat.findIndex(format => {
                        return format.heading === dataCategory;
                    });

                    if(hasFormat > -1){
                        storeFormat[hasFormat].contents.push(eachItem);
                    }
                }

                if(isUnique === true){
                    eachCategories.push(dataCategory);
                    storeFormat.push({
                        heading: dataCategory,
                        contents: [eachItem]
                    });
                }
            }
        });
    });

    console.log(storeFormat);
    container.innerHTML = "";
    storeFormat.forEach(format => {
        createStorePanes(container, format);
    });
};

const getMyStoreItems = function() {
    const fetchItems = function (headTitle) {
        fetch(`/api/user/${getCookie("username").value}/getStoreItems?publishedFlag=true`).then(async function(response) {
            try {
                let cover = document.querySelector(".vendor-bg-cover");
                let result = await response.json();

                if(result.length > 0 && result[0].error){
                    cover.style.top = "0vh";
                }else{
                    document.querySelector("#title").innerHTML = headTitle;
                    document.querySelector("#subtitle").innerHTML = `${result.length} items`;
                    sortIntoCategories(result);
                }
    
            } catch (error) {
                console.log(error);
            }
        }).catch(function(error) {
            console.log(error);
        });
    };

    document.querySelector(".control-body #store-box").style.display = "flex";

    // Check if vendor exists first...
    fetch(`/api/vendors/${getCookie("username").value}`).then(async function(response) {
        try {
            let cover = document.querySelector(".vendor-bg-cover");
            let result = await response.json();

            if(result.length > 0 && result[0].error){
                cover.style.top = "0vh";
            }else{
                let vendorName = formatName(result[0].vendorName);
                let pageTitle = `Univers | ${vendorName}'s ${(vendorName.endsWith("Store") === true || vendorName.endsWith("Stores"))? '': "Store"}`;
                document.title = pageTitle;
                fetchItems(`${vendorName}'s ${(vendorName.endsWith("Store") === true || vendorName.endsWith("Stores"))? '': "Store"}`);
            }

        } catch (error) {
            console.log(error);
        }
    }).catch(function(error) {
        console.log(error);
    });
};

const createStorePanes = function (container, format) {
    // <div class="cols pane">
    //     <div class="rows pane-head">
    //         <h3>Fashion Category</h3>
    //         <div></div>
    //     </div>
    //     <div class="rows pane-body">
    //     </div>
    // </div>

    let div0 = createComponent("DIV", null, ["cols", "pane"]);
        let div01 = createComponent("DIV", null, ["rows", "pane-head"]);
            let h3 = createComponent("H3", `${format.heading} CATEGORY`);
            let div010 = createComponent("DIV");
        let div02 = createComponent("DIV", null, ["rows", "pane-body"]);

    div01 = joinComponent(div01, h3, div010);

    format.contents.forEach(item => {
        createStoreItem(div02, item);
    });

    div0 = joinComponent(div0, div01, div02);
    container.appendChild(div0);
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

    // Create store item
    let price = formatAsMoney(parseInt(object['item-price']));

    let div0 = createComponent("div", null, ["grid","store-item", "gr"]);
        const img0 = create("IMG");
        let span1 = createComponent("SPAN", `${object['item-name']}`, ["item-name"]);
        let span2 = createComponent("SPAN", `Quantity: ${object['item-qty']}`, ["item-qty"]);
        let span3 = createComponent("SPAN", `${price}`, ["item-price"]);
        let div1 = createComponent("div", null, ["rows", "mod-controls"]);
            let button10 = createComponent("BUTTON", null, ["icofont-ui-love"]);
            let button11 = createComponent("BUTTON", "BUY");

    div0.setAttribute("id", `storeItem_${object['_id']}`);
    img0.setAttribute("id", `image_${object['_id']}`);
    img0.setAttribute("src", `${object['item-image'][0]}`);
    button11.setAttribute("id", `remove_${object['_id']}`);
    img0.addEventListener("click", function(evt){
        window.location.href = `/view/${evt.currentTarget.id.split("_")[1]}`;
    });

    div1 = joinComponent(div1, button10, button11);
    div0 = joinComponent(div0, img0, span1, span2, span3, div1);
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