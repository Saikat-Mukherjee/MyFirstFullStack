$(document).ready(function() {
    // code to be executed after the DOM is fully loaded
        function validateForm(){
            if(!$("#name").val() || $("#name").val() == ""){
                alert("Please give a proper name");
                return false;
            }

            if(!$("#dob").val() || $("#dob").val() == ""){
                alert("Please give a proper Date of birth");
                return false;
            }

            if(!$("#phone").val() || $("#phone").val() == ""){
                alert("Please give a proper mobile number");
                return false;
            }

            if(!$("#email").val() || $("#email").val() == ""){
                alert("Please give a proper emailId");
                return false;
            }

            if(!$("#address").val() || $("#address").val() == ""){
                alert("Please give a proper address");
                return false;
            }

            return true;
        }

        function generatePassword(length) {
            const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let password = '';
            for (let i = 0; i < length; i++) {
              password += charset.charAt(Math.floor(Math.random() * charset.length));
            }
            return password;
          }

        $("#formSubmit").on("click",function(){
            if(!validateForm()){
                return;    
            }

            
            var obj = {};
            obj["uid"] = new Date().getTime();
            obj["password"] = generatePassword(8);
            obj["name"] =  $("#name").val();
            obj["dob"] =  $("#dob").val();
            obj["phone"] =  $("#phone").val();
            obj["email"] =  $("#email").val();
            obj["address"] =  $("#address").val();

            //var urlStr = "http://localhost:3000/register";

            var urlStr="/register";

            console.log(obj);
            $.ajax({
                type: "POST",
                url: urlStr,
                data: obj,
                success: function(){
                    alert(`Submit button has been successfully clicked. Password : ${obj[password]} `);
                },
               // dataType: dataType
            });
        })

        $("#formUpdate").on("click",function(){
            if(!validateForm()){
                return;    
            }

            
            var obj = {};
            obj["name"] =  $("#name").val();
            obj["dob"] =  $("#dob").val();
            obj["phone"] =  $("#phone").val();
            obj["email"] =  $("#email").val();
            obj["address"] =  $("#address").val();

            //var urlStr = "http://localhost:3000/register";

            var urlStr="/settings";

            console.log(obj);
            $.ajax({
                type: "POST",
                url: urlStr,
                data: obj,
                success: function(data){
                    console.log(data);
                    //alert(`Submit button has been successfully clicked. Password : ${obj[password]} `);
                    window.location.href = '/';
                },
               // dataType: dataType
            });
        })



         
  });
  