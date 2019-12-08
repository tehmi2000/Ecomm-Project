const itemList = {};

document.addEventListener("DOMContentLoaded", function() {
    const queryText = window.decodeURI(get_query().query);
    const displayQueryElement = document.getElementById("query");

    console.log(window.location.hash);
    // searchform.addEventListener("submit", searchHandler);
    displayQueryElement.innerHTML = ` ${queryText}`;

    if(queryText && queryText !== ""){
        fetchData(queryText);
    }
});

const displayFilters = () => {
    const element = document.querySelector("#filter + #filter-content");
    element.style.display = (element.style.display === "flex")? "none" : "flex";
};

const fetchData = (searchQuery) => {
    const container = document.querySelector("#item-container");
    fetch(`/api/goods/all/search?query=${searchQuery}`).then(async function(response) {
        try {
            let result = await response.json();
            console.log(result);

            container.innerHTML = "";
            if(result.length === 0){
                createNoItemTag(container, searchQuery);
            }else{
                result.forEach(item => {
                    itemList[`${item._id}`] = item;
                    createItem(container, item);
                });
                console.log(itemList);
            }

        } catch (error) {
            console.log(error);
        }
    }).catch(function(error) {
        console.log(error);
    });
};

const createNoItemTag = function(container, query){
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.innerHTML = `<span id='no-item'>No result found for '${query}'</span>`;
};

const createItem = function(container, object){

    const saveHandler = function(evt) {
        const itemID = evt.currentTarget.id.split("_")[1];
        console.log(itemID.toString("hex"));
    };

    const cartHandler = function(evt) {
        const itemID = evt.currentTarget.id.split("_")[1];
        console.log(itemID);

        fetch(`/api/goods/save/${get_cookie("username").value}/addToCart`, {
            method: "post",
            body: JSON.stringify({
                item: itemList[itemID]
            }),
            headers: {
                "Content-Type" : "application/json; charset=utf-8"
            }
        }).then(async function(response) {
            try {
                console.log(response);
                let result = await response.json();
                console.log(result);
                displayResponse("Item has been carted successfully!");
            } catch (error) {
                console.error(error);
            }
        }).catch(function(error) {
            console.error(error);
        });
    };
    // <a class="item">
    //     <img src="/assets/images/IMG-20180120-WA0001.jpg" alt="">
    //     <span class="item-name cols">
    //          <span>Sony Fifa 20 Standard Edition-PS4</span>
    //          <span>N15,000,000</span>
    //     </span>
    //     <span class="item-number cols">
    //          <span>Qty: 1</span>
    //     </span>
    //     <span class="item-buttons">
    //          <button class="icofont-ui-love"></button>
    //          <button class="icofont-bin"></button>
    //      </span>
    // </a>

    let price = parseInt(object["item-price"]).toLocaleString(undefined, {
        style: "currency",
        currency: "NGN"
    });

    let a0 = createComponent("SPAN", null, ["item"]);
        let img0 = create("IMG");
        let span0 = createComponent("SPAN", null, ["fill-container", "cols"]);
            let span1 = createComponent("SPAN", null, ["item-name", "cols"]);
                let span10 = createComponent("A", object["item-name"], ["strip-link"]);
                let span11 = createComponent("SPAN", `${object["item-desc"]}`);
            let span2 = createComponent("SPAN", null, ["item-control", "rows", "fill-container"]);
                let span20 = createComponent("SPAN", `${price}`, ["item-number"]);
                let span21 = createComponent("SPAN", null, ["item-buttons"]);
                    let button20 = create("BUTTON");
                    let button21 = create("BUTTON");


    span10.setAttribute("href", `/view/${object._id}`);
    a0.setAttribute("id", object._id);
    a0.setAttribute("data-href", `/view/${object._id}`);
    img0.setAttribute("src", `${object["item-image"][1]}`);
    button20.setAttribute("id", `save_${object._id}`);
    button21.setAttribute("id", `cart_${object._id}`);

    button20.addEventListener("click", saveHandler);
    button21.addEventListener("click", cartHandler);
    button20.innerHTML = `<i className="icofont-"></i> Save`;
    button21.innerHTML = `<i class="icofont-cart"></i> CART`;

    span21 = joinComponent(span21, button20, button21);
    span1 = joinComponent(span1, span10, span11);
    span2 = joinComponent(span2, span20, span21);
    span0 = joinComponent(span0, span1, span2);

    a0 = joinComponent(a0, img0, span0);
    a0.addEventListener("click", function(evt) {
        window.location.href = `${evt.currentTarget.getAttribute("data-href")}`;
    });

    container.appendChild(a0);
};

const createDummyItem = function(container, number){

    // <span class="dummy item">
    //     <img src="" alt="">
    //     <span class="item-name cols">
    //         <span></span>
    //         <span></span>
    //     </span>
    //     <span class="item-number cols">
    //         <span></span>
    //     </span>
    //     <span class="item-buttons">
    //         <span></span>
    //         <span></span>
    //     </span>
    // </span>

    for(let n = 0; n < number; n++){
        let a0 = create("SPAN");
        let img0 = create("IMG");
        let span0 = create("SPAN");
            let span1 = create("SPAN");
            let span2 = create("SPAN");
        let span3 = create("SPAN");
            let span4 = create("SPAN");
        let span5 = create("SPAN");
            let span6 = create("SPAN");
            let span7 = create("SPAN");

        a0.classList.add("dummy", "item");
        span0.classList.add("item-name", "cols");
        span3.classList.add("item-number", "cols");
        span5.classList.add("item-buttons");

        img0.setAttribute("src", ``);

        span5 = joinComponent(span5, span6, span7);
        span3 = joinComponent(span3, span4);
        span0 = joinComponent(span0, span1, span2);

        a0 = joinComponent(a0, img0, span0, span3, span5);

        container.appendChild(a0);
    }
};