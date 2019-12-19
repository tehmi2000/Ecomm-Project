const addHandlers = function() {
    const form = document.querySelector("#vendor-form");
    const cardPurse = document.querySelector("#vendor-form .card-purse");
    const container = document.querySelector("#vendor-form .container");

    const navOne = document.querySelector(`.form-navigation span:nth-child(1)`);
    const navTwo = document.querySelector(`.form-navigation span:nth-child(2)`);
    const navThree = document.querySelector(`.form-navigation span:nth-child(3)`);

    const nextBtnOne = document.querySelector("#vendor-form .step:first-child .btn");
    const nextBtnTwo = document.querySelector("#vendor-form .step:nth-child(2) .btn");
    const submitBtn = document.querySelector("#vendor-form .step:last-child .btn");

    const setActive = function(elementNumber) {
        // document.querySelectorAll(".form-navigation::after")
        document.querySelectorAll(".form-navigation span.on").forEach(element => {
            element.classList.remove("on");
        });

        for (let i = 1; i <= elementNumber; i++){
            document.querySelector(".form-navigation .progress").style.width = `${50 * (i-1)}%`;
            document.querySelector(`.form-navigation span:nth-child(${i})`).classList.add("on");
            document.querySelector(`.form-navigation span:nth-child(${i})`).removeAttribute("disabled");
        }
    };

    const stepOne = function(evt) {
        if(evt.currentTarget.getAttribute("disabled") === null){
            setActive(1);
            container.style.marginLeft = "0%";
        }
    };

    const stepTwo = function(evt) {
        if(evt.currentTarget.getAttribute("disabled") === null){
            setActive(2);
            container.style.marginLeft = "-100%";
        }
    };

    const stepThree = function(evt) {
        if(evt.currentTarget.getAttribute("disabled") === null){
            setActive(3);
            container.style.marginLeft = "-200%";
            form.style.width = "100%";
            cardPurse.style.width = "auto";
            cardPurse.style.height = "25rem";
            cardPurse.style.overflow = "unset";
        }
    };

    navOne.addEventListener("click", stepOne);
    navTwo.addEventListener("click", stepTwo);
    nextBtnOne.addEventListener("click", stepTwo);
    navThree.addEventListener("click", stepThree);
    nextBtnTwo.addEventListener("click", stepThree);

    form.addEventListener("submit", formHandler);
};

document.addEventListener("DOMContentLoaded", function(){
    addHandlers();
});

const formHandler = (evt) => {
    evt.preventDefault();
};