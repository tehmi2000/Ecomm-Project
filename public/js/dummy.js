const images = ["0a9c147c668744d0afcb9d320afa0b73.jpg", "IMG-20180905-WA0011.jpg", "IMG-20180715-WA0007.jpg", "IMG-20190527-WA0029.jpg"];
let counter = 0;

const nextImage = function(){

    if(counter === images.length-1){
        counter = 0;
    }else{
        counter += 1;
    }

    document.querySelector("#slideshow").style.backgroundImage = `url(../assets/ads/${images[counter]})`;
};

const prevImage = function(){
    if (counter === 0) {
        counter = images.length-1;
    } else {
        counter -= 1;
    }

    document.querySelector("#slideshow").style.backgroundImage = `url(../assets/ads/${images[counter]})`;
};

const createItem = function(container, object){

    // <div class="item cols">
    //     <div class="item-img">
    //         <img src="assets/images/IMG-20180112-WA0009.jpg" alt="Item Image">
    //     </div>
    //     <div class="item-description cols">
    //         <span>Sony Fifa 20 Standard Edition-PS4</span>
    //         <span class="item-price">NGN21,000 <sup class="strike">NGN29,000</sup></span>
    //     </div>
    // </div>

    let div0 = create("DIV");
        let div1 = create("DIV");
            let img0 = create("IMG");
        let div2 = create("DIV");
            let span0 = createComponent("SPAN", "Test example");
            let span1 = createComponent("SPAN", "NGN88,000");
                let sup0 = createComponent("SUP", "NGN88,000 ");

    div0.classList.add("item", "cols");
    div1.classList.add("item-img");
    div2.classList.add("item-description", "cols");

    span1.classList.add("item-price");
    sup0.classList.add("strike");

    img0.setAttribute("src", "assets/images/IMG-20180112-WA0009.jpg");
    img0.setAttribute("alt", "Item Image");

    span1.appendChild(sup0);
    div1 = joinComponent(div1, img0);
    div2 = joinComponent(div2, span0, span1);
    div0 = joinComponent(div0, div1, div2);

    container.appendChild(div0);
};

window.onload = function () {
    setInterval(function() {
        nextImage();
    }, 8000);

    if (get_cookie("username")) {

        let div0 = create("DIV");
        let child = "<a href='/myprofile'><img src='../assets/images/Logo.png' alt='' class='user-picture'></a><a href='/logout'><button>Logout</button></a>";
        div0.innerHTML = child;

        document.querySelector("#sidemenu nav div:first-child").replaceWith(div0);
    }
};