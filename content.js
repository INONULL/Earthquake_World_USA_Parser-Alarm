//"use strict";
// if detect from background.js send sig to content.js
// 24.06.10 chrome.scripting -> content.js [uses less memory and more stability (maybe)]
// Lee JunSung :D 🥸let data;
let last_state;
let auto_reviewed;
let data;
chrome.runtime.onMessage.addListener(function (request) {
    if(request.message === "more") {
      data = request.data;
      auto_reviewed = data.auto_reviewed;
      more(data.DEFINE_USER_MAG, data.target_num_automatic, data.target_num_reviewed, data.target_num_undefined, auto_reviewed);
      prohibit();
      last_state = "more";
      return;
    }
    if(request.message === "less"){
      data = request.data;
      auto_reviewed = data.auto_reviewed;
      less(data.DEFINE_USER_MAG, data.target_num_automatic, data.target_num_reviewed, data.target_num_undefined, auto_reviewed);
      prohibit();
      last_state = "less";
      return;
    }
    if(request.message === "popnloc"){
        let latest = 0;
        data = request.data;
        const arr_a = ()=> {if(data.target_num_automatic==null){return []}else{return data.target_num_automatic}};
        const arr_b = ()=> {if(data.target_num_reviewed==null){return []}else{return data.target_num_reviewed}};
        const arr_c = ()=> {if(data.target_num_undefined==null){return []}else{return data.target_num_undefined}};
        const concat_ab = arr_a().concat(arr_b());
        const concat_abc = concat_ab.concat(arr_c());
        if((concat_abc.length == 0 && concat_abc == [])){
        }else{
            latest = Math.min(...concat_abc);
        }
        popnloc(latest);
      return;
    }
    if(request.message === "change_mag"){
    }
});
document.addEventListener('click', ()=>{
  if(window.location.toString().includes('://earthquake.usgs.gov/earthquakes/map/')){
    if(last_state === 'more'){
      more(parseFloat(data.DEFINE_USER_MAG), data.target_num_automatic, data.target_num_reviewed, data.target_num_undefined, auto_reviewed);
      prohibit();
    }
    if(last_state === 'less'){
      less(parseFloat(data.DEFINE_USER_MAG), data.target_num_automatic, data.target_num_reviewed, data.target_num_undefined, auto_reviewed);
      prohibit();  
    }
  }
});
function more(DEFINE_USER_MAG, target_num_automatic, target_num_reviewed, target_num_undefined, auto_reviewed){
  const pop_card = document.querySelector('mat-card');
  const main_target  = document.querySelectorAll('mat-list-item');
  let first_list;
  if(target_num_automatic == null && target_num_reviewed == null && target_num_undefined == null){
      first_list = main_target[1];
  }else{
      for(let i = 1; i < main_target.length; i++){
          const scond_list = main_target[i];
          scond_list.style.removeProperty("background-color");
      }
      if(target_num_automatic != null){
        for(let i = 0; i < target_num_automatic.length; i++){ // automatic!
            first_list = main_target[target_num_automatic[i]+1];
            first_list.style.removeProperty("background-color");
            first_list.style.backgroundColor = '#00FF0080'; // green automatic
            const main_card_target = first_list.querySelector('usgs-event-item-detail div h6').innerText;
            //card.contains maincard target
            const card = document.querySelector('usgs-details-info-box');
            if(card.innerHTML != '<!---->' & card.innerHTML != null & card.innerHTML != undefined & main_card_target != null){
                const first_card = card.querySelector('mat-card div mat-card-header div mat-card-title a').innerText;
                const the_mag = first_card.substring(1,5);
                if(first_card.includes(main_card_target)){
                    pop_card.style.backgroundColor='#00FF00';
                }else if(parseFloat(the_mag)>=DEFINE_USER_MAG){
                    pop_card.style.backgroundColor='#00FF00';
                }else{
                    pop_card.style.backgroundColor='#FFFFFF';
                }
            }else{
            }
        }
    }
    if(target_num_reviewed != null){
        for(let i = 0; i < target_num_reviewed.length; i++){ // reviewed!
            first_list = main_target[target_num_reviewed[i]+1];
            first_list.style.removeProperty("background-color");
            first_list.style.backgroundColor = '#FF000080'; //F0A092
            const main_card_target = first_list.querySelector('usgs-event-item-detail div h6').innerText;
            //card.contains maincard target
            const card = document.querySelector('usgs-details-info-box');
            if(card.innerHTML != '<!---->' & card.innerHTML != null & card.innerHTML != undefined & main_card_target != null){
                const first_card = card.querySelector('mat-card div mat-card-header div mat-card-title a').innerText;
                const the_mag = first_card.substring(1,5);
                if(first_card.includes(main_card_target)){
                    pop_card.style.backgroundColor='#FFCCCB';
                }else if(parseFloat(the_mag)>=DEFINE_USER_MAG){
                    pop_card.style.backgroundColor='#FFCCCB';
                }else{
                    pop_card.style.backgroundColor='#FFFFFF'; 
                }
            }else{
            }
        }
    }
    if(target_num_undefined != null){
        for(let i = 0; i < target_num_undefined.length; i++){ // reviewed!
            first_list = main_target[target_num_undefined[i]+1];
            first_list.style.removeProperty("background-color");
            first_list.style.backgroundColor = '#FFFF8F80'; //F0A092
            const main_card_target = first_list.querySelector('usgs-event-item-detail div h6').innerText;
            //card.contains maincard target
            const card = document.querySelector('usgs-details-info-box');
            if(card.innerHTML != '<!---->' & card.innerHTML != null & card.innerHTML != undefined & main_card_target != null){
                const first_card = card.querySelector('mat-card div mat-card-header div mat-card-title a').innerText;
                const the_mag = first_card.substring(1,5);
                if(first_card.includes(main_card_target)){
                    pop_card.style.backgroundColor='#FFFF8F';
                }else if(parseFloat(the_mag)>=DEFINE_USER_MAG){
                    pop_card.style.backgroundColor='#FFFF8F';
                }else{
                    pop_card.style.backgroundColor='#FFFFFF'; 
                }
            }else{
            }
        }
    }
      return;
  }
  try{
    const main_card_target = first_list.querySelector('usgs-event-item-detail div h6').innerText;
    //card.contains maincard target
    const card = document.querySelector('usgs-details-info-box');
    const first_card = card.querySelector('mat-card div mat-card-header div mat-card-title a').innerText;
    const the_mag = first_card.substring(1,5);
    if(card.innerHTML != '<!---->' & card.innerHTML != null & card.innerHTML != undefined & main_card_target != null){
        if((parseFloat(the_mag)>=DEFINE_USER_MAG) && (auto_reviewed)){
            pop_card.style.backgroundColor='#00FF00';
        }else if((parseFloat(the_mag)>=DEFINE_USER_MAG) && (auto_reviewed == false)){
            pop_card.style.backgroundColor='#FFCCCB';
        }else if((parseFloat(the_mag)>=DEFINE_USER_MAG) && (auto_reviewed === undefined)){
            pop_card.style.backgroundColor='#FFFF8F'; 
        }else{
            pop_card.style.backgroundColor='#FFFFFF'; 
        }
    }else{
    }
    first_list.style.removeProperty("background-color");
    if(auto_reviewed){
        first_list.style.backgroundColor = '#00FF0080'; //F0A092 00FF0080
    }else if(auto_reviewed == false){
        first_list.style.backgroundColor = '#FF000080'; //F0A092 00FF0080
    }else if(auto_reviewed == undefined){
        first_list.style.backgroundColor = '#FFFF8F'; //F0A092 00FF0080
    }
    if((parseFloat(the_mag)>=DEFINE_USER_MAG) && auto_reviewed){
        first_list.style.backgroundColor = '#00FF0080'; //F0A092 00FF0080
    }
    if((parseFloat(the_mag)>=DEFINE_USER_MAG) && auto_reviewed == false){
        first_list.style.backgroundColor = '#FF000080'; //F0A092 00FF0080
    }
    if((parseFloat(the_mag)>=DEFINE_USER_MAG) && auto_reviewed == undefined){
        first_list.style.backgroundColor = '#FFFF8F'; //F0A092 00FF0080
    }
        for(let i = 2; i < main_target.length; i++){
            const scond_list = main_target[i];
            scond_list.style.removeProperty("background-color");
        }
}catch(err){
    popnloc();
}
  return;
}
function less(DEFINE_USER_MAG, target_num_automatic, target_num_reviewed, target_num_undefined, auto_reviewed){
  const pop_card = document.querySelector('mat-card');
  const main_target  = document.querySelectorAll('mat-list-item');
  let first_list;
  if(target_num_automatic == null && target_num_reviewed == null && target_num_undefined == null){
      first_list = main_target[1];
  }else{
      for(let i = 1; i < main_target.length; i++){
          const scond_list = main_target[i];
          scond_list.style.removeProperty("background-color");
      }
        if(target_num_automatic != null){
            for(let i = 0; i < target_num_automatic.length; i++){
                first_list = main_target[target_num_automatic[i]+1];
                first_list.style.removeProperty("background-color");
                first_list.style.backgroundColor = '#00FF0080'; // green automatic
                const main_card_target = first_list.querySelector('usgs-event-item-detail div h6').innerText;
                const card = document.querySelector('usgs-details-info-box');
                if(card.innerHTML != '<!---->' & card.innerHTML != null & card.innerHTML != undefined & main_card_target != null){
                    const first_card = card.querySelector('mat-card div mat-card-header div mat-card-title a').innerText;
                    const the_mag = first_card.substring(1,5);
                    if(first_card.includes(main_card_target)){
                        pop_card.style.backgroundColor='#00FF00';
                    }else if(parseFloat(the_mag)>=DEFINE_USER_MAG){
                        pop_card.style.backgroundColor='#00FF00';
                    }else{
                        pop_card.style.backgroundColor='#FFFFFF'; 
                    }
                }else{
                }
            }
        }
        if(target_num_reviewed != null){
            for(let i = 0; i < target_num_reviewed.length; i++){
                first_list = main_target[target_num_reviewed[i]+1];
                first_list.style.removeProperty("background-color");
                first_list.style.backgroundColor = '#FF000080'; //F0A092
                const main_card_target = first_list.querySelector('usgs-event-item-detail div h6').innerText;
                const card = document.querySelector('usgs-details-info-box');
                if(card.innerHTML != '<!---->' & card.innerHTML != null & card.innerHTML != undefined & main_card_target != null){
                    const first_card = card.querySelector('mat-card div mat-card-header div mat-card-title a').innerText;
                    const the_mag = first_card.substring(1,5);
                    if(parseFloat(the_mag)>=DEFINE_USER_MAG){
                        pop_card.style.backgroundColor='#FFCCCB';
                    }else{
                        pop_card.style.backgroundColor='#FFFFFF'; 
                    }
                }else{
                }
            }
        }
        if(target_num_undefined != null){
            for(let i = 0; i < target_num_undefined.length; i++){
                first_list = main_target[target_num_undefined[i]+1];
                first_list.style.removeProperty("background-color");
                first_list.style.backgroundColor = '#FFFF8F80'; //F0A092
                const main_card_target = first_list.querySelector('usgs-event-item-detail div h6').innerText;
                const card = document.querySelector('usgs-details-info-box');
                if(card.innerHTML != '<!---->' & card.innerHTML != null & card.innerHTML != undefined & main_card_target != null){
                    const first_card = card.querySelector('mat-card div mat-card-header div mat-card-title a').innerText;
                    const the_mag = first_card.substring(1,5);
                    if(parseFloat(the_mag)>=DEFINE_USER_MAG){
                        pop_card.style.backgroundColor='#FFFF8F';
                    }else{
                        pop_card.style.backgroundColor='#FFFFFF'; 
                    }
                }else{
                }
            }
        }
        first_list.style.removeProperty("background-color");
        const main_card_target = first_list.querySelector('usgs-event-item-detail div h6').innerText;
        //card.contains maincard target
        const card = document.querySelector('usgs-details-info-box');
        if(card.innerHTML != '<!---->' & card.innerHTML != null & card.innerHTML != undefined & main_card_target != null){
            const first_card = card.querySelector('mat-card div mat-card-header div mat-card-title a').innerText;
            const the_mag = first_card.substring(1,5);
            if((parseFloat(the_mag)>=DEFINE_USER_MAG) && (auto_reviewed)){
                pop_card.style.backgroundColor='#00FF00';
            }else if((parseFloat(the_mag)>=DEFINE_USER_MAG) && (auto_reviewed == false)){
                pop_card.style.backgroundColor='#FFCCCB';
            }else if((parseFloat(the_mag)>=DEFINE_USER_MAG) && (auto_reviewed === undefined)){
                pop_card.style.backgroundColor='#FFFF8F';
            }else{
                pop_card.style.backgroundColor='#FFFFFF'; 
            }
        }
      return;
  }
  try{
    const main_card_target = first_list.querySelector('usgs-event-item-detail div h6').innerText;
    //card.contains maincard target
    const card = document.querySelector('usgs-details-info-box');
    if(card.innerHTML != '<!---->' & card.innerHTML != null & card.innerHTML != undefined & main_card_target != null){
        const first_card = card.querySelector('mat-card div mat-card-header div mat-card-title a').innerText;
        const the_mag = first_card.substring(1,5);
        if((parseFloat(the_mag)>=DEFINE_USER_MAG) && (auto_reviewed)){
            pop_card.style.backgroundColor='#00FF00';
        }else if((parseFloat(the_mag)>=DEFINE_USER_MAG) && (auto_reviewed == false)){
            pop_card.style.backgroundColor='#FFCCCB';
        }else if((parseFloat(the_mag)>=DEFINE_USER_MAG) && (auto_reviewed === undefined)){
            pop_card.style.backgroundColor='#FFFF8F';
        }else{
            pop_card.style.backgroundColor='#FFFFFF'; 
        }
    }else{
        //nothing..
    }
    first_list.style.removeProperty("background-color");
    for(let i = 2; i < main_target.length; i++){
        const scond_list = main_target[i];
        scond_list.style.removeProperty("background-color");
    }
}catch(err){
    popnloc();
}
  return;
}
function changed_mag(){

}
function prohibit(){
  const chklabel = document.querySelector('mat-checkbox');
  chklabel.innerHTML = '<!---->';
  return;
}
let clicked_once = false;
function popnloc(last){
    let arr_num = 1;
    if(last == null){
        arr_num = 1;
    }else{
        arr_num = last+1;
    }
  const main_target  = document.querySelectorAll('mat-list-item')[arr_num];
  if(main_target == null){
  }else{
    const bool_seleted = main_target.classList.contains('selected');
    if(!bool_seleted && !clicked_once){
        main_target.click();
        clicked_once = true;
    }
  }
  const card = document.querySelector('usgs-details-info-box');
  if(card.innerHTML != '<!---->' & card.innerHTML != null & card.innerHTML != undefined){
    if(last_state == "more"){
        const first_card = card.querySelector('mat-card div mat-card-header div mat-card-title a').innerText;
        const pop_card = document.querySelector('mat-card');
        const the_mag = first_card.substring(1,5);
        if((parseFloat(the_mag)>=DEFINE_USER_MAG) && (auto_reviewed)){
            pop_card.style.backgroundColor='#00FF00';
        }else if((parseFloat(the_mag)>=DEFINE_USER_MAG) && (auto_reviewed == false)){
            pop_card.style.backgroundColor='#FFCCCB';
        }else if((parseFloat(the_mag)>=DEFINE_USER_MAG) && (auto_reviewed === undefined)){
            pop_card.style.backgroundColor='#FFFF8F';
        }else{
            pop_card.style.backgroundColor='#FFFFFF'; 
        }
    }
  }else{
  }
  return;
}