const SERVER_URL = 'http://localhost:3001/api';

const logIn = async (credentials) => {
    return await fetch(SERVER_URL + '/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',  // this parameter specifies that authentication cookie must be forwared. It is included in all the authenticated APIs.
        body: JSON.stringify(credentials),
    }).then(handleInvalidResponse)
    .then(response => response.json());
}

const SignUp = async (informations) => {
    return await fetch(SERVER_URL + '/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',  // this parameter specifies that authentication cookie must be forwared. It is included in all the authenticated APIs.
        body: JSON.stringify(informations),
    }).then(handleInvalidResponse)
    .then(response => response.json());
}

const getUserInfo = async () => {
    return await fetch(SERVER_URL + '/sessions/current', {
        credentials: 'include'
    }).then(handleInvalidResponse)
    .then(response => response.json());
}

const logOut = async() => {
    return await fetch(SERVER_URL + '/sessions/current', {
      method: 'DELETE',
      credentials: 'include'
    }).then(handleInvalidResponse);
  }

function handleInvalidResponse(response) {
    if (!response.ok) { throw Error(response.statusText) }
    let type = response.headers.get('Content-Type');
    if (type !== null && type.indexOf('application/json') === -1){
        throw new TypeError(`Expected JSON, got ${type}`)
    }
    return response;
}


////////////// GAME API //////////////////////////////

async function getCaptionSingle(){
    const response = await fetch(`${SERVER_URL}/round/single`);
    
    if(!response.ok) {
        const errMessage = await response.json();
        throw errMessage;
    }else{
        const captionJson = await response.json();
        return captionJson;
    }
}

async function getCaptionMulti(){
    const response = await fetch(`${SERVER_URL}/loggedround`, {
        credentials: 'include'
    });
    
    if(!response.ok) {
        const errMessage = await response.json();
        throw errMessage;
    }else{
        const captionJson = await response.json();
        return captionJson;
    }
}

async function checkRound(round){
    const response = await fetch(`${SERVER_URL}/checkRound`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(round),
    });
    
    if(!response.ok) {
        const errMessage = await response.json();
        throw errMessage;
    }else{
        const captionJson = await response.json();
        return captionJson;
    }
}

async function checkRoundLog(round){
    const response = await fetch(`${SERVER_URL}/checkRoundLog`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(round),
        credentials: 'include'
    });
    
    if(!response.ok) {
        const errMessage = await response.json();
        throw errMessage;
    }else{
        const captionJson = await response.json();
        return captionJson;
    }
}

async function createMatch(match){
    const response = await fetch(`${SERVER_URL}/createMatch`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(match),
        credentials: 'include'
    });

    if(!response.ok) {
        const errMessage = await response.json();
        throw errMessage;
    }else{
        const id = await response.json();
        return id;
    }
}

async function getHistory(){
    const response = await fetch(`${SERVER_URL}/history`,{
        credentials: 'include'
    });

    if(!response.ok) {
        const errMessage = await response.json();
        throw errMessage;
    }else{
        const captionJson = await response.json();
        return captionJson;
    }
}

async function getHistoryMatch(match_id){
    const response = await fetch(`${SERVER_URL}/matchHistory/${match_id}`,{
        credentials: 'include'
    });
    
    if(!response.ok) {
        const errMessage = await response.json();
        throw errMessage;
    }else{
        const captionJson = await response.json();
        return captionJson;
    }
}

async function initMatchLogged(){
    const response = await fetch(`${SERVER_URL}/initMatch`,{
        credentials: 'include'
    });

    if(!response.ok) {
        const errMessage = await response.json();
        throw errMessage;
    }else{
        return true;
    }
    //console.log(response);
}

const API = {logIn, getUserInfo, logOut, getCaptionSingle, getCaptionMulti, createMatch, getHistory, getHistoryMatch, SignUp, checkRound, initMatchLogged, checkRoundLog};
export default API;