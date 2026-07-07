const API="http://localhost:5000";

async function register(){

    const username=document.getElementById("registerUsername").value;

    const email=document.getElementById("registerEmail").value;

    const password=document.getElementById("registerPassword").value;

    const response=await fetch(API+"/register",{

        method:"POST",

        headers:{

            "Content-Type":"application/json"

        },

        body:JSON.stringify({

            username,

            email,

            password

        })

    });

    const data=await response.json();

    alert(data.message);

}

async function login(){

    const username=document.getElementById("loginUsername").value;

    const password=document.getElementById("loginPassword").value;

    const response=await fetch(API+"/login",{

        method:"POST",

        headers:{

            "Content-Type":"application/json"

        },

        body:JSON.stringify({

            username,

            password

        })

    });

    const data=await response.json();

    alert(data.message);

    if(data.success){

        document.getElementById("dashboard").style.display="block";

    }

}

async function upload(){

    const file=document.getElementById("file").files[0];

    const formData=new FormData();

    formData.append("file",file);

    const response=await fetch(API+"/upload",{

        method:"POST",

        body:formData

    });

    const data=await response.json();

    alert(data.message);

}

async function loadFiles(){

    const response=await fetch(API+"/files");

    const files=await response.json();

    const list=document.getElementById("fileList");

    list.innerHTML="";

    files.forEach(file=>{

        const li=document.createElement("li");

        li.innerText=file;

        list.appendChild(li);

    });

}