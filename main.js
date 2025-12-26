let currentUser = null;
const peers = [];
const connections = [];
const peer = new Peer(); // free default PeerJS server

// ===== LOGIN =====
function login(){
  const u = username.value.trim();
  if(!u || !avatar.files[0]) return;
  const reader = new FileReader();
  reader.onload = () => {
    currentUser = u;
    pImg.src = reader.result;
    pName.textContent = u;
    loginCard.classList.add("hidden");
    appCard.classList.remove("hidden");
    startPeer();
  };
  reader.readAsDataURL(avatar.files[0]);
}

// ===== START PEER =====
function startPeer(){
  peer.on('open', id => console.log("Peer ID:", id));

  // Listen for incoming connections
  peer.on('connection', conn => {
    conn.on('data', data => handleMessage(data));
    connections.push(conn);
  });

  // Optional: auto connect to known peer IDs
  // peers.forEach(p => connections.push(peer.connect(p)));
}

// ===== SHARE =====
function share(){
  const text = textShare.value.trim();
  const file = fileShare.files[0];
  if(!text && !file) return;

  if(file){
    const reader = new FileReader();
    reader.onload = () => {
      broadcast({owner: currentUser, file:{name:file.name, data:reader.result}});
      addFeed({owner:currentUser, file:{name:file.name}});
    };
    reader.readAsDataURL(file);
  } else {
    broadcast({owner: currentUser, text});
    addFeed({owner: currentUser, text});
  }

  textShare.value = "";
  fileShare.value = "";
}

// ===== BROADCAST =====
function broadcast(data){
  connections.forEach(c => c.send(data));
}

// ===== FEED =====
function addFeed(item){
  const d = document.createElement("div");
  d.className = "item";
  d.innerHTML = `
    <div class="item-header">
      <img src="${pImg.src}">
      <b>${item.owner}</b>
    </div>
    ${item.text ? `<div>${item.text}</div>` : ""}
    ${item.file ? `<div class="file-card"><a href="${item.file.data}" download="${item.file.name}">${item.file.name}</a></div>` : ""}
  `;
  feed.prepend(d);
}

// ===== HANDLE MESSAGE =====
function handleMessage(data){
  addFeed(data);
}

// ===== LOGOUT =====
function logout(){
  currentUser=null;
  localStorage.removeItem("SuperShareSession");
  appCard.classList.add("hidden");
  loginCard.classList.remove("hidden");
}

// ===== AUTO LOGIN =====
const sessionUser = localStorage.getItem("SuperShareSession");
if(sessionUser){
  currentUser = sessionUser;
  loginCard.classList.add("hidden");
  appCard.classList.remove("hidden");
  pName.textContent = currentUser;
  startPeer();
}
