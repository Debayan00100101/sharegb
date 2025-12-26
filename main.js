const PASS="super00100101";

let db = JSON.parse(localStorage.getItem("SuperShareDB")) || {};
let currentUser = localStorage.getItem("SuperShareSession");

// ===== PEERJS REALTIME =====
const peer = new Peer();
const conns = [];

peer.on('connection', conn => {
  conns.push(conn);
  conn.on('data', data => receiveData(data));
});

// Broadcast to all peers
function broadcast(data){
  conns.forEach(c=>c.send(data));
}

// ===== LOGIN =====
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

// ===== LOGOUT =====
function logout(){
  localStorage.removeItem("SuperShareSession");
  currentUser=null;
  appCard.classList.add("hidden");
  loginCard.classList.remove("hidden");
}

// ===== SHARE =====
function share(){
  const text=textShare.value.trim();
  const file=fileShare.files[0];

  const post = {owner:currentUser, text:"", file:null};

  if(text) post.text=text;
  if(file){
    const fReader = new FileReader();
    fReader.onload = () => {
      post.file={name:file.name, data:fReader.result};
      db[currentUser].items.unshift(post);
      localStorage.setItem("SuperShareDB",JSON.stringify(db));
      broadcast(post);
      render();
    };
    fReader.readAsDataURL(file);
    textShare.value="";
    fileShare.value="";
    return;
  }

  db[currentUser].items.unshift(post);
  localStorage.setItem("SuperShareDB",JSON.stringify(db));
  broadcast(post);
  render();
  textShare.value="";
  fileShare.value="";
}

// ===== RECEIVE DATA =====
function receiveData(data){
  if(!db[data.owner]) db[data.owner]={avatar:"",items:[]};
  db[data.owner].items.unshift(data);
  localStorage.setItem("SuperShareDB",JSON.stringify(db));
  render();
}

// ===== RENDER =====
function render(){
  feed.innerHTML="";
  Object.entries(db).forEach(([user,data])=>{
    data.items.forEach(i=>{
      const d=document.createElement("div");
      d.className="item";
      d.innerHTML=`
        <div class="item-header">
          <img src="${data.avatar || pImg.src}">
          <b>${user}</b>
          ${i.owner===currentUser?`<button class="delete-btn" onclick="deleteItem('${user}','${i.id || ''}')">Delete</button>`:""}
        </div>
      `;
      if(i.text) d.innerHTML+=`<div>${i.text}</div>`;
      if(i.file) d.innerHTML+=`<div class="file-card"><a href="${i.file.data}" download="${i.file.name}">${i.file.name}</a></div>`;
      feed.appendChild(d);
    });
  });
}

// ===== DELETE =====
function deleteItem(owner,id){
  if(owner!==currentUser) return;
  db[owner].items=db[owner].items.filter(i=>i.id!==id);
  localStorage.setItem("SuperShareDB",JSON.stringify(db));
  render();
}

/* AUTO LOGIN */
if(currentUser && db[currentUser]){
  start(currentUser);
  peer.on('open', id => console.log("Your Peer ID:", id));
}else{
  loginCard.classList.remove("hidden");
}
