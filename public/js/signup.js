const matchPasswords = function(evt) {
    // debugger
    const passwordField = document.querySelector("#user-password");
    if(evt.currentTarget.value === passwordField.value){
        evt.currentTarget.style.borderBottom = "3px solid #02b102";
    }else{
        evt.currentTarget.style.borderBottom = "3px solid red";
    }
};

const checkForErrors = function(){
	let queryParams = getQuery();
	if(queryParams && queryParams.error){
		const errorD = document.querySelector("form .error");
		errorD.classList.toggle("serror", true);
		
		switch(queryParams.idn){
			case "userexist":
				errorD.innerHTML = "<i class='icofont-exclamation-circle'></i>&nbsp;A user exist with that username/email!";
				break;
				
			default:
				errorD.innerHTML = "An error occurred!";
				break;
		}
		// alert(queryParams.idn);
	}
};

const checkAgreement = function(evt){
    // e
    console.log(evt.currentTarget.checked);
    if(evt.currentTarget.checked === true){
        document.querySelector("input[type='submit']").removeAttribute("disabled");
    }else{
        document.querySelector("input[type='submit']").setAttribute("disabled", true);
    }
};

document.addEventListener("DOMContentLoaded", function() {
    document.querySelector("#confirm-password").addEventListener("input", matchPasswords);
    document.querySelector("#agreement").addEventListener("change", checkAgreement);
    checkForErrors()
});