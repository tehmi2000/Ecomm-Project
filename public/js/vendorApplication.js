let paymentPortalLoaded = false;
let flagCountry = false;

const createOption = function(container, displayText, value) {
    let option = createComponent("OPTION", displayText);
    option.setAttribute("value", value);
    container.appendChild(option);
};

const removeOption = function(option) {
    option.parentNode.removeChild(option);
};

const getCountries = function(evt) {
    if(flagCountry === false){
        fetch(`/api/countries/all`).then(async function(response) {
            try {
                let country_list = await response.json();
                forEach(country_list, function(element) {
                    createOption(document.querySelector("[name='user-country']"), element.name, element.name);
                });
                flagCountry = true;
    
            } catch (err) {
                console.error(err);
            }
        }).catch(function(error) {
            console.error(error);
        });
    }
};

const getRegion = function(evt) {
    fetch(`/api/countries/all/${evt.currentTarget.value}/getRegions`).then(async function(response) {
        try {
            let regionList = await response.json();
            forEach(document.querySelectorAll("[name='user-region'] > option:not(:first-child)"), function(element) {
                removeOption(element);
            });

            if(regionList.length > 0){
                forEach(regionList, function(element) {
                    createOption(document.querySelector("[name='user-region']"), element.name, element.name);
                });
            }

        } catch (err) {
            console.error(err);
        }
    }).catch(function(error) {
        console.error(error);
    });
};

const addHandlers = function() {
    const form = document.querySelector("#vendor-form");
    const container = document.querySelector("#vendor-form .container");

    const navOne = document.querySelector(`.form-navigation span:nth-child(1)`);
    const navTwo = document.querySelector(`.form-navigation span:nth-child(2)`);
    const navThree = document.querySelector(`.form-navigation span:nth-child(3)`);

    const nextBtnOne = document.querySelector("#vendor-form .step:first-child .btn");
    const nextBtnTwo = document.querySelector("#vendor-form .step:nth-child(2) .btn");

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
            const emailValue = document.querySelector(`[name='user-email']`).value;

            if(paymentPortalLoaded === false){
                setTimeout(() => {
                    loadPortal(emailValue);
                }, 4998);
            }
        }
    };

    navOne.addEventListener("click", stepOne);
    navTwo.addEventListener("click", stepTwo);
    nextBtnOne.addEventListener("click", stepTwo);
    navThree.addEventListener("click", stepThree);
    nextBtnTwo.addEventListener("click", stepThree);

    form.addEventListener("submit", formHandler);
    document.querySelector("[name='user-country']").addEventListener("click", getCountries);
    document.querySelector("[name='user-country']").addEventListener("change", getRegion);
};

document.addEventListener("DOMContentLoaded", function(){
    addHandlers();
});

const submitForm = function(formName){
    document[`${formName}`].submit();
};

const formHandler = (evt) => {
    evt.preventDefault();

    const bodyValue = function() {
        const retValue = {};
        const arrayOfElements = document.querySelectorAll("#vendor-form [name]");
        arrayOfElements.forEach(element => {
            retValue[`${element.name}`] = element.value;
        });
        return retValue;
    }();

    console.log(bodyValue);

    fetch(``, {
        method: "POST",
        body: JSON.stringify(bodyValue),
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }).then(async function(response) {
        try {
            let result = await response.json();
            
        } catch (error) {
            console.error(error);
        }
    }).catch(function(error) {
        console.error(error);
    });
};