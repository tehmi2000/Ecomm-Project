let filters = {};

const buildFilterQuery = function (encodedSearchQuery) {
    let apiUrl = `/api/goods/all/with-filter?`;
    let searchQueryUrl = `searchQuery=${encodedSearchQuery}`;
    let tempApiUrl = ''

    Object.keys(filters).forEach( key => {
        let urlVersion = null;
        
        switch(key){
            case "priceRange":
                urlVersion = `${filters[key].min || 0}-${filters[key].max || 999999999999999}`;
                break;

            case "discountRange":
                urlVersion = `${filters[key].min || 0}-${filters[key].max || 999999999999999}`;
                break;

            default:
                urlVersion = `${filters[key]}`;
                break;
        }
        
        tempApiUrl = (urlVersion === null)? tempApiUrl : `${tempApiUrl}&${key}=${urlVersion}`;
    });
    
    apiUrl += searchQueryUrl + tempApiUrl;
    console.log(apiUrl);
    return apiUrl;
};

const filterSearch = (searchQuery, formattedQuery) => {
    const displayQueryElement = document.querySelector("#query");
    const container = document.querySelector("#item-container");
    const filterBtn = document.querySelector("#modifiers-content button[data-apply-btn]");
    let apiUrl = buildFilterQuery(window.encodeURIComponent(searchQuery));

    container.innerHTML = "";
    createDummyItem(container, 6);
    setTimeout(() => {
        displayFilters();
    }, 2000);
    
    fetch(apiUrl).then(async function(response) {
        try {
            let result = await response.json();
            // console.log(result);
            container.innerHTML = "";
            itemList = {};
            filterBtn.textContent = "Apply";
            filterBtn.classList.toggle("animate-filtering", false);
            displayQueryElement.innerHTML = ` ${formattedQuery}`;

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
            console.error(error);
        }
    }).catch(function(error) {
        console.error(error);
    });
};

const loadFilterHandlers = function(){
    let minPriceInput = document.querySelector("#modifiers-content [name='min-price-range']");
    let maxPriceInput = document.querySelector("#modifiers-content [name='max-price-range']");
    let discountOnlyCheck = document.querySelector("#modifiers-content [name='is-discounted']");

    minPriceInput.addEventListener("input", e => {
        if(!filters.priceRange) filters.priceRange = {};
        filters.priceRange.min = (e.currentTarget.value === '')? 0 : parseInt(e.currentTarget.value);
    });

    maxPriceInput.addEventListener("input", e => {
        if(!filters.priceRange) filters.priceRange = {};
        filters.priceRange.max = (e.currentTarget.value === '')? 999999999999999 : parseInt(e.currentTarget.value);
    });

    discountOnlyCheck.addEventListener("change", e => {
        filters.discount = (!filters.discount)? true : !filters.discount;
        console.log(filters);
    });
};

document.addEventListener("DOMContentLoaded", function () {
    let modifiersTab = document.querySelector("#modifiers");
    const queryText = window.decodeURIComponent(getQuery().query);
    const formattedQuery = queryText.split("+").join(" ");

    if(modifiersTab){
        let filterBtn = document.querySelector("#modifiers-content button[data-apply-btn]");
        let clearFilterBtn = document.querySelector("#modifiers-content [data-clear-btn]");
        let filterForm = document.querySelector("form#modifiers-content");

        filterBtn.addEventListener("click", ev => {
            let target = ev.currentTarget;
            target.textContent = "applying filters..."
            target.classList.toggle("animate-filtering");
        });

        clearFilterBtn.addEventListener("click", ev => {
            window.location.reload();
        });
    
        filterForm.addEventListener("submit", ev => {
            ev.preventDefault();
            filterSearch(queryText, `${formattedQuery} (filtered)`);
        });

        loadFilterHandlers();
    }
});
