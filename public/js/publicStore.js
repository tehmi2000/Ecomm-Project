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

const getMyStoreItems = function() {
    const fetchItems = function () {
        fetch(`/api/user/${getCookie("username").value}/getStoreItems`).then(async function(response) {
            try {
                let cover = document.querySelector(".vendor-bg-cover");
                let result = await response.json();

                if(result.length > 0 && result[0].error){
                    cover.style.top = "0vh";
                }else{
                    document.querySelector("#subtitle").innerHTML = `${result.length} items`;
                    container.innerHTML = "";
                    result.forEach(item => {
                        createStoreItem(container, item);
                    });
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
                fetchItems();
            }

        } catch (error) {
            console.log(error);
        }
    }).catch(function(error) {
        console.log(error);
    })
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

    let div0 = createComponent("div", null, ["grid","store-item", "list"]);
        const img0 = create("IMG");
        let span1 = createComponent("SPAN", `${object['item-name']}`, ["item-name"]);
        let span2 = createComponent("SPAN", `Quantity: ${object['item-qty']}`, ["item-qty"]);
        let span3 = createComponent("SPAN", `${price}`, ["item-price"]);
        let div1 = createComponent("div", null, ["rows", "mod-controls"]);
            let button10 = createComponent("BUTTON", null, ["icofont-ui-love"]);
            let button11 = createComponent("BUTTON", null, ["icofont-cart"]);

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