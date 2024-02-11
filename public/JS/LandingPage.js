//const { response } = require("express");

console.log("Inside HTML");

var domParser = new DOMParser();

const platformDIv = document.getElementById("platformMainDiv")

/*fetch("/loginPage", {
    method: 'GET',
   
  })
  .then(response => response.json())
  .then(data => {
    console.log(data)

   // var template = Handlebars.compile("<b>{{doesWhat}}</b>");
   var template = Handlebars.compile(data ? data.html : '');
    //platformDIv.innerHTML = domParser.parseFromString(data ? data.html : '','text/html').body.innerHTML;
    platformDIv.innerHTML = template({
        doesWhat : "OK"
    });
  })
  .catch(error => console.error(error))*/


  /*fetch("/register", {
    method: 'GET',
  })
  .then(response => response.json())
  .then(data => {
    console.log(data)

   // var template = Handlebars.compile("<b>{{doesWhat}}</b>");
   var template = Handlebars.compile(data ? data.html : '');
    //platformDIv.innerHTML = domParser.parseFromString(data ? data.html : '','text/html').body.innerHTML;
    platformDIv.innerHTML = template({
        doesWhat : "OK"
    });
  })
  .catch(error => console.error(error))*/
let loginId = document.getElementById("loginId");
if(loginId){


loginId.addEventListener("click",function(){
  var credentialObj = new Object();
  let userName = document.getElementById("userNameId");


  let userPassword = document.getElementById("passwordId");

  credentialObj['userName'] = userName.value;

  credentialObj['password'] = userPassword.value;
  
  fetch("/users",{
    method: "POST",
    headers:{
      "Content-Type" : "application/json"
    },
    body : JSON.stringify(credentialObj)
  })
  .then(response => response.json())
  .then(data => {
    console.log(data)
    let incorrectDiv = document.getElementById("incorrectCred");
    if(!data.credential){
      incorrectDiv.parentElement.classList.remove("d-none")
    }
    else{
      incorrectDiv.parentElement.classList.add("d-none")
      window.location.href = '/'
    }

})
.catch(error => console.log(error))
})

}
  /*$("#loginId").on("click",function(){
   
})*/



  
  


