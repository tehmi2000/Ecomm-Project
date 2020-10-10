const imgUrls = {};
const globals = {
    cart: {
        items: [],
        total: 0,
        netTotal: 0,
        vouchers: []
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
    if(getCookie("univers-username")){
        loadHandlers();
        getMyCart();
    }else{
        window.location.replace(`/login?redirect=true&redirect_url=${window.encodeURIComponent(window.location.href)}`);
    }
});

const loadHandlers = function () {
    let paymentBtn = document.querySelector("#confirm-payment-btn");
    let promoApplyBtn = document.querySelector("#promo-apply-btn");

    paymentBtn.addEventListener("click", function (ev) {
        let target = ev.currentTarget;
        if(!target.classList.contains("clicked")){
            target.classList.add("clicked");
            target.textContent = "Loading payment gateway...";
            getPaymentParams();
        }
    });

    promoApplyBtn.addEventListener("click", createPromo);
};

const createNoItemTag = function(container, text){
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.innerHTML = `<span id='no-item'>${text}</span>`;
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

const calculateTotalBill = function(vouchers = []){
    let data = {
        shipping: 600,
        cart: globals.cart.total,
        vat: (7.5/100)*globals.cart.total
    };

    return {
        ...data,
        total: (data.shipping + data.cart + data.vat) - vouchers.reduce((total, nextVoucher) => {
            return total + nextVoucher.voucherValue;
        }, 0)
    };
};

const getMyCart = function() {
    const checkoutBtn = document.querySelector("[data-pay-btn]");
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

const calculateVoucherValue = function ({voucherType, voucherValue}) {
    if(voucherType === "percent"){
        return globals.cart.total * (voucherValue/100);
    }

    return voucherValue;
};

const getPaymentParams = function () {
    let voucher = (document.querySelector(`[name="promo-code"]`).value === '')? null : document.querySelector(`[name="promo-code"]`).value;
    let modeOfDelivery = document.querySelector(`[name="mode-of-delivery"]`).value;
    let deliveryLocation = (document.querySelector(`[name="delivery-location"]`).value === '')? null : document.querySelector(`[name="delivery-location"]`).value;

    let paymentParams = {
        netTotal: globals.cart.netTotal,
        promocode: voucher,
        modeOfDelivery,
        deliveryLocation
    };

    console.log(paymentParams);
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

const removePromo = function(promoId){
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

const createPromo = function(ev) {
    // <div class="lg-100 rows promo-item">
    //     <span>BF-JULY120</span>
    //     <span class="rows">
    //         <span>- NGN 0.00</span>
    //         <button class=" " style=""></button>
    //     </span>
    // </div>

    let voucherInput = document.querySelector(`[name="promo-code"]`);
    let voucherInputValue = voucherInput.value;

    const createPromoElement = function (data) {
        const container = document.querySelector("#promo-container");
        let price = formatAsMoney(data.voucherValue);

        let div0 = createComponent("DIV", null, ["lg-100", "rows", "promo-item"]);
        let span0 = createComponent("SPAN", `${data.voucherName}`);
        let span1 = createComponent("SPAN", null, ["rows"]);
        let span10 = createComponent("SPAN", `- ${price}`);
        let button10 = createComponent("BUTTON", null, ["strip-btn", "icofont-close"]);

        span1 = joinComponent(span1, span10, button10);
        div0 = joinComponent(div0, span0, span1);

        container.appendChild(div0);
    };

    const validateVoucher = function (userVoucherName) {
        let apiUrl = `/api/vouchers/${getCookie("univers-username").value}/confirmVoucher`;
        userVoucherName = userVoucherName.trim();

        fetch(apiUrl, {
            method: "POST",
            body: JSON.stringify({voucherName: userVoucherName}),
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            }
        }).then(async response => {
            try {
                let result = await response.json();
                console.log(result);

                if(result !== null && result.isValid === true){
                    let { voucherName } = result;
                    let voucherValue = calculateVoucherValue(result);
                    let data = {
                        voucherValue,
                        voucherName
                    };
                    const voucherIsUsed = globals.cart.vouchers.findIndex(eachVoucher => {
                        return eachVoucher.voucherName === voucherName;
                    });

                    // If voucher is not currently being used by client...
                    if(voucherIsUsed < 0){

                        globals.cart.vouchers.push(Object.assign({}, result, {...data}));
                        console.log(globals.cart.vouchers);
                        globals.cart.netTotal = calculateTotalBill(globals.cart.vouchers).total;
                        createPromoElement(data);
                        document.querySelector("#total-bill").innerHTML = formatAsMoney(globals.cart.netTotal);
                    }
                }else{

                }
                
            } catch (error) {
                console.error(error);
            }
        }).catch(error => {
            console.error(error);
        });
    };
    
    if(voucherInputValue.length > 2){
        validateVoucher(voucherInputValue);
        voucherInput.value = '';l
    }
};






