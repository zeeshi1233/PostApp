import { app, auth, db, storage } from './firebas.js'
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { setDoc, doc, query, where, onSnapshot, collection, addDoc, orderBy, getDocs, serverTimestamp, limit } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";


let authorName;
const show_user = () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
      onSnapshot(collection(db, "users"), (data) => {
        data.docChanges().forEach((change) => {
          // showPost(change.doc.data())
          if (uid == change.doc.data().user) {
            authorName = change.doc.data().name;

            if (change.doc.data().pic) {
              document.querySelector(".myimg").src = change.doc.data().pic
              document.querySelector(".myimg1").src = change.doc.data().pic
            }
            else {
              document.querySelector(".myimg").src = 'download.jpg'
              document.querySelector(".myimg1").src = 'download.jpg'
            }


            document.getElementById("name").innerHTML = authorName;
            all(change.doc.data().email)

            console.log(authorName);
          }

        });
      });
    } else {
      window.location.href = "login.html";
    }
  });
};

show_user()


//  shoow Post

document.getElementById("load").style.display = "grid"

var sugUser;
async function all(email) {
  console.log(email);
  let alluser = document.getElementById("allusers");

  const q = query(collection(db, "users"), where("email", "!=", email));
  const onSnapshot = await getDocs(q);

  onSnapshot.forEach((change) => {
    if (change.data().pic) {
      sugUser = change.data().pic
    }
    else {
      sugUser = "download.jpg"
    }

    alluser.innerHTML += `
<div class="adjust1" id="">
<div class="profile-pic" style="display: flex;align-items: center;">
    <img src="${sugUser}" id="all_user_img" width="50px " height="50px" style="border-radius: 50%;" alt="">
    <p style="font-size: 20px;margin-left: 10px;" class="name">${change.data().name}</p>
    </div>
    <div class="switch">
    <Button  >Follow</Button>
    </div>
</div>
`
  })
};



function final(users) {
  var mytestpost = document.getElementById("all_posts");
  const q = query(collection(db, "post"), where("user", "==", users.user),orderBy("timestamp","desc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    if (snapshot.size === 0) {
      document.getElementById("nofound").style.display="flex"
      document.getElementById("nofound").style.display="none"
      document.getElementById("load").style.display="none"
    }
    else{
      snapshot.docChanges().forEach((change) => {
        const { name, pic, timestamp, user } = change.doc.data()
        console.log(change.doc.data());
        document.getElementById("load").style.display="none"
        let picsHtml = "";
        if (pic) {
               picsHtml = `<img src="${pic}" id="self">`;
             } else {
               picsHtml = "";
            }
      mytestpost.innerHTML += `
<div class="post_sty" id="post_sty">
           <div class="profile-pic1" style="display: flex;align-items: center;">
             <img src="${users.pic ? users.pic : 'download.jpg'}" id="ur_img" width="50px " height="50px" style="border-radius: 50%;" alt="">
             <div style='display:block;' > 
               <p style="font-size: 20px;margin-left: 10px;font-weight: bold;" id="sec">${users.name}</p>
               <span style='font-size:14px;margin-left:10px;'>${moment(timestamp) ? moment(timestamp.toDate()).fromNow():moment().fromNow()}</span>
             </div>
           </div>
           <div>
                        <i style="margin-left: -30px;" class="fa-solid fa-ellipsis-vertical"></i>
                      </div>
                    </div>
                    <div style="box-shadow: rgb(38, 57, 77) 0px 20px 30px -10px;">
                      <div class="com_post">
                        <div class="des">
                          <p style="font-size: 18px;">${name}</p>
                        </div>
                        ${picsHtml}
                      </div>
                      <div class="social">
                        <div>
                          <li><i class="fa-regular fa-heart"></i></li>
                        </div>
                        <div>
                          <li><i class="fa-regular fa-message"></i></li>
                        </div>
                        <div>
                          <li><i class="fa-regular fa-bookmark"></i></li>
                        </div>
                        <div>
                          <li><i class="fa-solid fa-share"></i></li>
                        </div>
                      </div>
                      <br>
                    </div>
                    <br>

`


    });
  }
  });

}


async function text() {
  const q = query(collection(db, "users"),);
  const onSnapshot = await getDocs(q);
  onSnapshot.forEach((change) => {
    // mytest(change.data())
    final(change.data())
  })
};
text()



const add_post = () => {
  let text = document.getElementById("text");
  let file = document.getElementById("file-input");
  if (text.value == "" && file.files > 0) {
    alert("Fill All Fields")
  }
  else {

    if (file.files.length > 0) {

      console.log(file.files[0].name);
      const storageRef = ref(storage, `images/${file.files[0].name}`);
      const uploadTask = uploadBytesResumable(storageRef, file.files[0]);
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');

          document.getElementById("load").style.display = "none"
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              document.getElementById("load").style.display = "grid"
              break;
          }
        },
        (error) => {
          console.log('error-->', error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log('File available at', downloadURL);
            onAuthStateChanged(auth, async (user) => {
              if (user) {
                const uid = user.uid;
                console.log(uid);
                await addDoc(collection(db, "post"), {
                  name: text.value,
                  pic: downloadURL,
                  timestamp: serverTimestamp(),
                  user: uid,
                });
              }
              text.value=""
            });
          });
        }
        );
      
    }
    else {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const uid = user.uid;
          console.log(uid);
          await addDoc(collection(db, "post"), {
            name: text.value,
            timestamp: serverTimestamp(),
            user: uid,

          });
        }
        text.value=""
      });
    }

  }

}



window.add_post = add_post


// Log Out

window.logout = () => {
  signOut(auth).then(() => {
    window.location.href = "login.html"
  }).catch((error) => {
    console.log(error);
  });
}

