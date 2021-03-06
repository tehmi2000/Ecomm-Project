if(!getCookie("univers-username")){
    window.location.replace(`/login?redirect=true&redirect_url=${window.encodeURIComponent(window.location.href)}`);
};

let flagCountry = false;

document.addEventListener("DOMContentLoaded", function () {

    getUserData(getCookie("univers-username").value);

    try {
        document.querySelector("#copy-id").addEventListener("click", copyToClipboard);
        document.querySelector("[name='country']").addEventListener("click", getCountries);
        document.querySelector("[name='country']").addEventListener("change", getRegion);
        document.querySelector(".name-header .icofont-navigation-menu").addEventListener("click", function(evt) {
            document.querySelector(".main-body .control-head").style.marginLeft = "0px";
        });
        
        document.querySelector(".main-body .control-head #close-control").addEventListener("click", function(evt) {
            document.querySelector(".main-body .control-head").style.marginLeft = "-101vw";
        });

        document.querySelector(".edit-btn").addEventListener("click", function(evt) {
            document.querySelector("#profile-form").style.opacity = 1;
            document.querySelector("#profile-form").style.height = "auto";
            document.querySelector("#records-section").style.opacity = 0;
            document.querySelector("#records-section").style.height = 0;
        });

        document.querySelector("#profile-form #minimize-form-btn").addEventListener("click", function(evt) {
            document.querySelector("#profile-form").style.height = 0;
            document.querySelector("#profile-form").style.opacity = 0;
            document.querySelector("#records-section").style.opacity = 1;
            document.querySelector("#records-section").style.height = "auto";
        });

        document.querySelector("#profile-form").addEventListener("submit", updateHandler);
    } catch (error) {
        console.error(error);
    }
});

const getUserData = function(username){
    fetch(`/api/user/${username}`).then(async function(response) {
        try {
            let userData = await response.json();
            if(userData.uID === "" || userData === undefined){
                window.location.replace(`/login?redirect=true&redirect_url=${window.encodeURIComponent(window.location.href)}`);
            }else{
                insertUserData(userData);
            }
        } catch (err) {
            console.error(err);
        }
    }).catch(function(error) {
        console.error(error);
    });
};

const copyToClipboard = function(ev){
    /* Get the text field */
    var copyText = document.querySelector("#uuid");
    
    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /*For mobile devices*/
    
    /* Copy the text inside the text field */
    document.execCommand("copy");
    
    /* Alert the copied text */
    alert("Copied to clipboard");
}

const insertUserData = function(data) {

    const idDisplay = {
        profile_picture:  document.querySelector("#user-picture"),
        phone: document.querySelector("#telephone"),
        firstname: document.querySelector("#user-fullname"),
        lastname: document.querySelector("#user-fullname"),
        address: document.querySelector("#user-address")
    };

    const fields = {
        uID: document.querySelector("#uuid"),
        phone: document.querySelector("[name='phone']"),
        firstname: document.querySelector("[name='firstname']"),
        lastname: document.querySelector("[name='lastname']"),
        email: document.querySelector("[name='email']"),
        username: document.querySelector("[name='username']")
    };

    for (const key of Object.keys(data)) {
        // debugger;
        if(data[key] !== "" && data[key] !== undefined){

            switch (key) {
                case "profile_picture":
                    try{
                        idDisplay[key].src = data[key];
                    }catch(err){
                        console.error(err);
                    }
                    break;
                
                case "phone":
                    try{
                        idDisplay[key].innerHTML = `Mobile Number: ${data[key]}`;
                        fields[key].value = data[key];
                    }catch(err){
                        console.error(err);
                    }
                    break;

                case "firstname":
                    try{
                        idDisplay[key].innerHTML = data[key];
                        fields[key].value = data[key];
                    }catch(err){
                        console.error(err);
                    }
                    break;

                case "lastname":
                    try{
                        idDisplay[key].innerHTML = idDisplay[key].innerHTML + ` ${data[key]}`;
                        fields[key].value = data[key];
                    }catch(err){
                        console.error(err);
                    }
                    break;

                case "uID":
                    document.querySelector("input[type='submit']").removeAttribute("disabled");
                    fields[key].value = data[key];
                    break;

                default:
                    try{
                        if(fields.hasOwnProperty(key) === true){
                            fields[key].value = data[key];
                        }else if(idDisplay.hasOwnProperty(key) === true){
                            idDisplay[key].innerHTML = data[key];
                        }
                    }catch(err){
                        console.error(err);
                    }
                    
                    break;
            }
            // document.querySelector("#sidemenu #user-photo").src = userData.profile_picture;
        }
    }
};

const createOption = function(container, displayText, value) {
    let option = createComponent("OPTION", displayText);
    option.setAttribute("value", value);
    container.appendChild(option);
};

const removeOption = function(option) {
    option.parentNode.removeChild(option);
};

const getCountries = function(evt) {
    // alert("getting countries");
    if(flagCountry === false){
        fetch(`/api/countries/all`).then(async function(response) {
            try {
                let country_list = await response.json();
                forEach(country_list, function(element) {
                    // debugger;
                    const nullChild = document.querySelector("[name='country'] option[value='null']");
                    if(nullChild){
                        nullChild.parentNode.removeChild(nullChild);
                    }
                    createOption(document.querySelector("[name='country']"), element.name, element.name);
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

            forEach(document.querySelectorAll("[name='state'] > option:not(:first-child)"), function(element) {
                removeOption(element);
            });

            if(regionList.length > 0){
                forEach(regionList, function(element) {

                    const nullChild = document.querySelector("[name='state'] option[value='null']");
                    if(nullChild){
                        nullChild.parentNode.removeChild(nullChild);
                    }
                    createOption(document.querySelector("[name='state']"), element.name, element.name);
                });
            }

        } catch (err) {
            console.error(err);
        }
    }).catch(function(error) {
        console.error(error);
    });
};

const updateHandler = function(evt) {
    evt.preventDefault();
    const submitButton = document.querySelector("#profile-form input[type='submit']");
    submitButton.setAttribute("disabled", true);
    submitButton.value = "Saving...";

    let template = {
        username: document.querySelector("[name='username']").value,
        firstname: document.querySelector("[name='firstname']").value,
        lastname: document.querySelector("[name='lastname']").value,
        phone: document.querySelector("[name='phone']").value,
        telcode: document.querySelector("[name='telcode'").value,
        state: document.querySelector("[name='state']").value,
        country: document.querySelector("[name='country']").value
    };

    fetch(`/myprofile/update`, {
        method: "post",
        body: JSON.stringify(template),
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }).then(async function(response) {
        try {
            let updateResult = await response.json();
            alert("Profile Updated Succesfully!");
            submitButton.removeAttribute("disabled");
            submitButton.value = "Save";
            window.location.reload();
        } catch (err) {
            console.error(err);
        }
    }).catch(function(error) {
        console.error(error);
    });
};