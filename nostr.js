let pubkey = '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2';

let relays = ['wss://relay.damus.io', 'wss://relay.nostr.band']
const pool = new NostrTools.SimplePool()

let counter = 0;

let inputPubkey = document.getElementById('inputPubkey');
let ulCardList = document.getElementById('cardList');

inputPubkey.addEventListener('input', function() {
        pubkey = this.value;
        getFollower().catch(console.error);
});

async function nostrLogin() {
    let publicKey = await window.nostr.getPublicKey();
    console.log("Public Key: " + publicKey);
    let publicKeyEncoded = window.NostrTools.nip19.npubEncode(publicKey);
    pubkey = publicKey;
    // window.localStorage.setItem("userPubkey", userPubkey);
    // nostrGetLoginInfo();
    return publicKey;
}

async function getFollower() {
        ulCardList.innerHTML = '';
        counter = 0;
        
        let h = pool.subscribeMany(
                [...relays],
                [
                    {
                        kinds: [3],
                        '#p': [pubkey],
                        limit: 10,
                        // authors: [pubkey]
                    },
                ],
                {
                    onevent(event) {
                        var date = new Date(event.created_at * 1000);
                        var pubkey = event.pubkey;

                        // console.log(event)
                        
                        counter++;
                        let li = document.createElement('li');
                        li.classList.add('list-group-item');
                        li.id = event.pubkey;
                        li.innerHTML = pubkey + " - " + date.toLocaleString();
                        ulCardList.appendChild(li);
                        nostrGetUserinfo(pubkey)
                    },
                    oneose() {
                        h.close()
                    }
                }
            )
}

async function nostrGetUserinfo(pubkey) {
    let h = pool.subscribeMany(
        [...relays],
        [
            {
                kinds: [0],
                authors: [pubkey],
                limit: 10
            }
        ],
        {
            onevent(event) {
                data = event.content;
                // console.log(data)
                var li = document.getElementById(pubkey);

                const username = JSON.parse(data.content)['username'];
                const displayName = JSON.parse(data.content)['displayName'];
                const name = JSON.parse(data.content)['name'];
                const about = JSON.parse(data.content)['about'].replace(/\r?\n/g, "<br>");
                const picture = JSON.parse(data.content)['picture'];
                const lightningAddress = JSON.parse(data.content)['lud16'];
                const website = JSON.parse(data.content)['website'];

                let imgSrc = `https://robohash.org/${pubkeyEncoded}`;
                if(picture == null) {
                    picture = imgSrc;
                }

                if (typeof displayName !== "undefined") {
                    // document.getElementById('header-title').innerHTML = `${displayName}`;
                    li.innerHTML = `${displayName} started following you at ${date.toLocaleString()}`;
                    // document.title = `${displayName}`;
                } else if (typeof name !== "undefined") {
                    // document.getElementById('header-title').innerHTML = `${name}`;
                    li.innerHTML = `${name} started following you at ${date.toLocaleString()}`;
                    // document.title = `${name}`;
                } else {
                    // document.getElementById('header-title').innerHTML = `${username}`;
                    li.innerHTML = `${username} started following you at ${date.toLocaleString()}`;
                    // document.title = `${username}`;
                }
            },
            oneose() {
                h.close()
            }
        }
    )
}

getFollower().catch(console.error);