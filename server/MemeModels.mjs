
 function Captions(id, text = ''){
    this.id = id;
    this.text = text;
}

 function Meme(id, img_url = 'Vite.svg'){
    this.id = id;
    this.img_url = img_url;
}


 function Round(user_id = 1, meme_id, captions, details, points = 0, selected_caption){
    this.user_id = user_id;
    this.meme_id = meme_id;
    this.captions = captions;
    this.details = details;
    this.points = points;
    this.selected_caption = selected_caption;
}

export {Captions, Meme, Round};