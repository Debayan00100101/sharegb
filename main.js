const PASS="super00100101";

let db = JSON.parse(localStorage.getItem("SuperShareDB")) || {};
let currentUser = localStorage.getItem("SuperShareSession");

function login(){
  if(password.value!==PASS || !username.value || !avatar.files[0]) return;
  const r=new FileReader();
  r.onload=()=>{
    db[username.value]=db[username.value]||{avatar:r.result,items:[]};
    localStorage.setItem("SuperShareDB",JSON.stringify(db));
    localStorage.setItem("SuperShareSession",username.value);
    start(username.value);
  };
  r.readAsDataURL(avatar.files[0]);
}

function start(u){
  currentUser=u;
  loginCard.classList.add("hidden");
  appCard.classList.remove("hidden");
  pImg.src=db[u].avatar;
  pName.textContent=u;
  render();
}

function logout(){
  localStorage.removeItem("SuperShareSession");
  currentUser=null;
  appCard.classList.add("hidden");
  loginCard.classList.remove("hidden");
}

function share(){
  const text=textShare.value.trim();
  const file=fileShare.files[0];

  if(text){
    db[currentUser].items.unshift({
      id:crypto.randomUUID(),
      owner:currentUser,
      type:"text",
      content:text
    });
  }

  if(file){
    db[currentUser].items.unshift({
      id:crypto.randomUUID(),
      owner:currentUser,
      type:file.type.startsWith("image")?"image":
           file.type.startsWith("video")?"video":
           file.type.startsWith("audio")?"audio":"file",
      name:file.name,
      size:file.size,
      url:URL.createObjectURL(file)
    });
  }

  localStorage.setItem("SuperShareDB",JSON.stringify(db));
  textShare.value="";
  fileShare.value="";
  render();
}

function deleteItem(owner,id){
  if(owner!==currentUser) return;
  db[owner].items=db[owner].items.filter(i=>i.id!==id);
  localStorage.setItem("SuperShareDB",JSON.stringify(db));
  render();
}

function render(){
  feed.innerHTML="";
  Object.entries(db).forEach(([user,data])=>{
    data.items.forEach(i=>{
      const d=document.createElement("div");
      d.className="item";
      d.innerHTML=`
        <div class="item-header">
          <img src="${data.avatar}">
          <b>${user}</b>
          ${i.owner===currentUser?`<button class="delete-btn" onclick="deleteItem('${user}','${i.id}')">Delete</button>`:""}
        </div>
      `;
      if(i.type==="text") d.innerHTML+=`<div>${i.content}</div>`;
      if(i.type==="image") d.innerHTML+=`<img src="${i.url}">`;
      if(i.type==="video") d.innerHTML+=`<video controls src="${i.url}"></video>`;
      if(i.type==="audio") d.innerHTML+=`<audio controls src="${i.url}"></audio>`;
      if(i.type==="file") d.innerHTML+=`
        <div class="file-card">${i.name} — ${(i.size/1024/1024).toFixed(2)} MB</div>`;
      feed.appendChild(d);
    });
  });
}

/* AUTO LOGIN ON LOAD */
if(currentUser && db[currentUser]){
  start(currentUser);
}else{
  loginCard.classList.remove("hidden");
}
