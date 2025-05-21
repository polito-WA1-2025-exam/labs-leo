
function Captions(id, text = '', meme_id = 1){
    this.id = id;
    this.text = text;
    this.meme_id = meme_id;
}

 function Meme(id, img_url = 'Vite.svg'){
    this.id = id;
    this.img_url = img_url;
}


function Round(user_id = 1, meme, captions, points = 0, selected_caption, match_id, round, correctCaptions = []){
    this.user_id = user_id;
    this.meme = meme;
    this.captions = captions;
    this.points = points;
    this.selected_caption = selected_caption;
    this.match_id = match_id;
    this.round = round;
    this.correctCaption = correctCaptions;
}

export {Captions, Meme, Round};