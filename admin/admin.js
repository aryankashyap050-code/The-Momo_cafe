function login(){

    const username =
    document.getElementById("username").value;

    const password =
    document.getElementById("password").value;

    if(username==="manager01" &&
       password==="cafemanager01"){

        window.location.href="dashboard.html";

    }

    else{

        document.getElementById("error").innerHTML=
        "Invalid username or password.";

    }

}