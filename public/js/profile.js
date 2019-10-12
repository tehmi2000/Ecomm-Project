window.onload = function () {

    if (get_cookie("username")) {
        
        fetch(`/api/user/${get_cookie("username").value}`).then(async function(response) {
            try {
                let user_data = await response.json();
                // console.log(user_data);
                insertUserData(user_data);

            } catch (err) {
                console.error(err);
            }
        }).catch(function(error) {
            console.error(error);
        });
        // socket.emit("get-user-data", get_cookie("username").value);
    }
};

const insertUserData = function(data) {
    const fields = {
        profile_picture:  document.querySelector("#user-picture"),
        phone: document.querySelector("#telephone"),
        fullname: document.querySelector("#fullname"),
        email: document.querySelector("[name='email']"),
        username: document.querySelector("[name='username']"),
        uID: document.querySelector("#uuid")
    };

    for (const key of Object.keys(data)) {
        if(data[key] !== ""){
            console.log(key);
            switch (key) {
                case "profile_picture":
                    fields[key].src = data[key];
                    break;
                
                case "phone":
                    fields[key].innerHTML = `Tel: ${data[key]}`;
                    break;

                case "fullname":
                    fields[key].innerHTML = data[key];
                    break;

                case "uID":
                    fields[key].innerHTML = data[key];
                    break;

                default:
                    if(fields.hasOwnProperty(key) === true){
                        fields[key].value = data[key];
                    }
                    break;
            }
            // document.querySelector("#sidemenu #user-photo").src = user_data.profile_picture;
        }
    }
};