const itemList = {};

document.addEventListener("DOMContentLoaded", function() {
    const queryText = window.decodeURIComponent(getQuery().query);
    const displayQueryElement = document.querySelector("#query");

    let formattedQuery = queryText.split("+").join(" ");
    displayQueryElement.innerHTML = ` ${formattedQuery}`;

    if(queryText && queryText !== ""){
        fetchData(queryText, formattedQuery);
    }
});

const displayFilters = () => {
    const element = document.querySelector("#modifiers + #modifiers-content");
    element.style.display = (element.style.display === "flex")? "none" : "flex";
};

const fetchData = (searchQuery, formattedQuery) => {
    const container = document.querySelector("#item-container");
    let apiUrl = `/api/goods/all/search?query=${searchQuery}`;
    
    fetch(apiUrl).then(async function(response) {
        try {
            let result = await response.json();

            container.innerHTML = "";
            if(result.length === 0){
                createNoItemTag(container, formattedQuery);
            }else{
                let adsPosition = 3;
                result.forEach((item, index) => {
                    if(index === adsPosition){
                        placeAds(container);
                        (adsbygoogle = window.adsbygoogle || []).push({});
                        adsPosition += 3;
                    }
                    itemList[`${item["_id"]}`] = item;
                    createItem(container, item);
                });

                document.querySelectorAll(".item .item-name a:first-child").forEach(el => {
                    $clamp(el, {clamp: 2});
                });
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
    container.innerHTML = `<span id='no-item' class='cols'><img src="../assets/images/portfolium-robot.png" alt=""><span>Sorry, we couldn't find any item that matched '${query}'.</span></span>`;
    createSuggestions(document.querySelector(".pane.sug"), document.querySelector(".pane.sug #suggestion-container"));
};

const placeAds = function(container) {

    let adsDiv = createComponent("DIV", null, ["item", "lg-100"]);
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

const createItem = function(container, object){

    const saveHandler = function(evt) {
        const itemID = evt.currentTarget.id.split("_")[1];
    };

    const cartHandler = function(evt) {
        const itemID = evt.currentTarget.id.split("_")[1];

        fetch(`/api/goods/save/${getCookie("univers-username").value}/addToCart`, {
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
        let img0 = createComponent("IMG", null, ["lazyload"]);
        let span0 = createComponent("SPAN", null, ["lg-100", "cols"]);
            let span1 = createComponent("SPAN", null, ["item-name", "cols"]);
                let span10 = createComponent("A", object["item-name"], ["strip-link"]);
                let span11 = createComponent("SPAN", `${object["short-desc"] || 'No summary available'}`);
            let span2 = createComponent("SPAN", null, ["item-control", "rows", "lg-100"]);
                let span20 = createComponent("SPAN", `${price}`, ["item-number"]);
                let span21 = createComponent("SPAN", null, ["rows", "item-buttons"]);
                    let button20 = create("BUTTON");
                    let button21 = create("BUTTON");


    span10.setAttribute("href", `/view/${object._id}`);
    a0.setAttribute("id", object._id);
    a0.setAttribute("data-href", `/view/${object._id}`);
    img0.setAttribute("data-src", `${object["item-image"][0]}`);
    button20.setAttribute("id", `save_${object._id}`);
    button21.setAttribute("id", `cart_${object._id}`);

    button20.addEventListener("click", saveHandler);
    button21.addEventListener("click", cartHandler);
    button20.innerHTML = `Save`;
    button21.innerHTML = `<i class="icofont-cart"></i>`;

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