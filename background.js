/*
USGS_ALERT!
first Created/Coded by LEE JUNSUNG 2024.06.01~2024.07.31;
//////////////////////////////////////////////////////////////////
1. This program is made with the assumption that it uses the same JSON update method as JMA and CWA, which has resulted in many issues. (It was made in a way that issues are fixed after initial production)
2. If improvements are needed, there is a necessity to integrate the modular algorithms that operate individually. Otherwise, it might be better to remake it.
3. Due to the issues mentioned in point 1, there might be a lot of unnecessary code.
4. No one knows where or what the specific code does (even the person who made it). GOOD LUCK 👍
/////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////[Differences from JMA and CWA]//////////////////////////////
1. USGS data does not come in sequentially.
2. Data is arbitrarily deleted.
3. IDs and details of data change frequently (there is no order).
(In such situations, the program must run stably!)
////////////////////////////////[Miscellaneous (Not Important)]//////////////////////////////////////
- Missing Functionality: [A feature to reload and display the previous latest data after it is deleted]
  ㄴ▷ (Detailed Description): When the most recent data is deleted, the topmost data in the array is considered the latest data, not based on the incoming data. 🔨👷‍♂️ <- [Easy to implement] -> {Can be done by taking the announcement time from the JSON}.
If only the ID changes -> No action is taken.
If both ID and MAG change, it is displayed -> It is displayed as a new event without notifying about the magnitude change.
*/
  ///////////////////////////////////////////////////////////////////////////////////////////////
 //  Memory Leak enhancement 24.08.06; 100MB for 1 hour operation // (Previously up to 600MB) //
///////////////////////////////////////////////////////////////////////////////////////////////
"use strict";
const keepAlive = async () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();
// global var and func in func
let DEFINE_USER_MAG = 6; // DEFAULT popup.js link
let target_num_automatic = null;
let target_num_reviewed = null;
let target_num_undefined = null;
let auto_reviewed;
let _prev_first_data = 'abc'; //initialized
let prev_first_data_first;
let DEFINE_USER_RESTART_INTV;
//let prev_id = [];
////////////////////// Get_all_data from the storage ////////////////////////////// 🥸
async function ignition(){ // one-time-function: OTF
    try{
        await chrome.storage.sync.get('prev_first_data_storage', async function(data) { // S/OTF 
            if(await data.prev_first_data_storage != null && await data.prev_first_data_storage !== ''){
                prev_first_data_first = await data.prev_first_data_storage;
                console.log('prev_first_data restored!: '+ prev_first_data_first);
            }else{
                console.log('For the stability of the program, it will be restarted in 10 seconds unless popup or tts is running');
                let countdown = 10;
                setInterval(async ()=>{
                    if(mon_started && lasttabUsed != null){
                        countdown--;
                        if(countdown>=0){
                            console.log(`${countdown}seconds has been remaining!`);
                        }
                        if(countdown <= 0){
                            if(await chrome.offscreen.hasDocument()){
                                console.log(`popup is running`);
                            }else{
                                await chrome.runtime.reload();
                            }
                        }
                    }
                },1000);
            }
        });
        await chrome.storage.sync.get('prev_target_num_auto_rev', async function(data){
            if(await data.prev_target_num_auto_rev != null){
                if(await data.prev_target_num_auto_rev[0] != null){
                    target_num_automatic = await data.prev_target_num_auto_rev[0];
                }
                if(await data.prev_target_num_auto_rev[1] != null){
                    target_num_reviewed = await data.prev_target_num_auto_rev[1];
                }
                if(await data.prev_target_num_auto_rev[2] != null){
                    target_num_undefined = await data.prev_target_num_auto_rev[2];
                }
                if(await data.prev_target_num_auto_rev[3] != null){
                    auto_reviewed = await data.prev_target_num_auto_rev[3];
                }
            }
        });
        await chrome.storage.sync.get('prev_current_diff_arr', async function(data){
            if(data.prev_current_diff_arr != null){
                if(data.prev_current_diff_arr[0] != null){
                    _prev_current_diff_arr = await data.prev_current_diff_arr[0];
                }
            }
        });
        await chrome.storage.sync.get('restart_intv', async function(data) {
            if(await data.restart_intv == null || await data.restart_intv == ''){
                DEFINE_USER_RESTART_INTV = 1800;
            }else{
                DEFINE_USER_RESTART_INTV = 1800 * await data.restart_intv;
            }
            console.log(`Program_Restart_Intv: ${(DEFINE_USER_RESTART_INTV*2)/3600} hour(s)`);
        });
        playMP3('Init.mp3', '', 0);
    }catch(err){
        prev_first_data_first = undefined;
        console.log(err);
    }
}ignition();
//////////////////////([설정] && [상태 체크])///////////////////////
let howismaass = 'USGS창 없음';
let DEFINE_USER_HOUR = 3600000;
let restart_counter = 0;
chrome.runtime.onMessage.addListener(async function (request) {
    try{
        if(request.message === 'user_mag'){
            DEFINE_USER_MAG = await request.data;
            //prev_first_data_first = undefined;
            //_prev_first_data = undefined;
            await main();
            //console.log('user mag: ' + DEFINE_USER_MAG);
        }else if(request.message === 'user_mag_clean'){
            // When user changes USER_DEFINE_MAG will 'not' reload the page <- 필요시 따로 선언하면 됨.
            _prev_first_data = 'user_change';
        }else if(request.message === 'Checkmaass'){
            if((howismaass != null)){
                chrome.runtime.sendMessage({
                    message: "checkme",
                    data: [howismaass, restart_counter],
                });
            }
        }else if(request.message === 'alert_finish'){
            if (await chrome.offscreen.hasDocument()){
                try{
                    if (await chrome.offscreen.hasDocument()){
                        await playMP3('shut.mp3', '', [undefined, undefined]);
                        await chrome.offscreen.closeDocument();
                    }
                }catch(err){
                    console.log(err + ', maybe chrome.offscreen is already closed');
                }
            };
        }else if(request.message === 'user_hour'){
            const hours = request.data;
            const hour_1 = 3600000;
            DEFINE_USER_HOUR = hour_1 * hours;
            await main();
            //console.log('user hour: ' + DEFINE_USER_HOUR + '-> ' + DEFINE_USER_HOUR/3600000);
        }else if(request.message == 'user_hour_clean'){
        }else if(request.message === 'user_restart_intv'){
            DEFINE_USER_RESTART_INTV = 1800 * request.data;
        }else{
        }
    }catch(error){
        console.log(error + ' found in chrome.runtime.onMessage.addListener(async function (request)');
    }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//addEventListener() get DEFINE_USER_MAG from popup.js
let lasttabUsed = null;
let lasttabUsedurl = null;
let mon_started = false;
let https_http_switch = false;
let data_down_swt = false;
let server_down_swt = false;
async function fetch_url_parsing() {
    const usgs_url_https = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';
    const usgs_url_http = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';
    function urlUsgs() { // Test http if https fails
        return https_http_switch ? usgs_url_http : usgs_url_https;
    }
    try {
        const response = await fetch(urlUsgs(), {
            method: 'GET',
            cache: 'default',
            credentials: 'omit',
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            headers: { 'Content-Type': 'application/json' },
        }).then(response => {
            howismaass = response.status;
            server_down_swt = false;
            data_down_swt = false;
            return response;
        }).catch(err =>{
            //console.log(err);
            howismaass = 500;
        });
        if (howismaass < 400) {
            https_http_switch = false;
            return await response.json();
        } else {
            https_http_switch = !https_http_switch;
            if (howismaass === 500) {
                server_down_swt = true;
                data_down_swt = true;
                return 'Fault';
            }
            if(howismaass > 399){
                server_down_swt = false;
                data_down_swt = true;
                return 'Fault';
            }
        }
    } catch (err) {
        console.log(err);
        howismaass = 500;
        return 'Fault';
    }
}
async function time_parser(timestamp){
    //const kr = 32400000; //UTC+9 3600 * 9 * 1000
    const time = new Date(timestamp);
    return time.toUTCString();//.replace('GMT');    
}
async function playMP3(source,tw_tts,mag) {
    await createOffscreen();
    await chrome.runtime.sendMessage({ play: { source,tw_tts,mag} });
}
async function createOffscreen() {
    if (await chrome.offscreen.hasDocument()){return};
    await chrome.offscreen.createDocument({
        url: 'offscreen_audio.html',
        reasons: ['BLOBS'],
        justification: 'alert'
    });
}
// first find usgs_tab;
async function find_tab(){ // Get the first tab, that has '://earthquake.usgs.gov/'
    try{
        chrome.tabs.query({}, async function (tabs) { 
            for(let i = 0; i < tabs.length; i++) {
                if (tabs[i].url.toString().includes('://earthquake.usgs.gov/earthquakes/map/')) {
                    lasttabUsed = tabs[i].id;
                    mon_started = true;
                    lasttabUsedurl = tabs[i].url;
                    await chrome.tabs.reload(lasttabUsed);
                    chrome.storage.sync.get('magnum', async function(data) {
                        DEFINE_USER_MAG = parseFloat(await data.magnum);
                    });
                    chrome.storage.sync.get('hournum', async function(data) {
                        const hour_1 = 3600000;
                        DEFINE_USER_HOUR = parseInt(await data.hournum) * hour_1;
                        if(isNaN(DEFINE_USER_HOUR)){
                            DEFINE_USER_HOUR = hour_1;
                        }
                    });
                    console.log(`Detected the target tab on tab.id[${lasttabUsed}]: ${lasttabUsedurl}`);
                    //await main();
                    return true;
        }}});
    }catch(err){
        console.log(err);
        return false;
    }
}
chrome.tabs.onRemoved.addListener(function(tabid) { // tab exit handling
    if(tabid == lasttabUsed){
        console.log(`User closed the target tab`);
        lasttabUsed = null;
        mon_started = false;
        //_prev_first_data = 'abc';
        howismaass = 'USGS창 없음';
    }
});
///////////////////////////////////////MainInterval/////////////////////////////////////////
(async function mainofmain() { //
    let result;
    restart_counter_func();
    while (true) {
        try {
            result = await main();
            if(result == 'Done'){
                continue;
            }else if(result == 'Down'){
                await new Promise(r => setTimeout(r, 2000));
                continue;
            }else{
            }
        } catch (err) {
            await new Promise(r => setTimeout(r, 2000));
            continue;
        }
            await new Promise(r => setTimeout(r, 2000));
    }
})();
/////////////////////////////////////
//split restart counter 
async function restart_counter_func(){
    while(true){
        if (await chrome.offscreen.hasDocument()){
        }else{
            if(restart_counter >= DEFINE_USER_RESTART_INTV){
                await chrome.runtime.reload();
            }
        }
        if(mon_started){
            restart_counter++;
        }
        await new Promise(r => setTimeout(r, 2000));
    }
}
////////////////////////////////////! REGION&CITY Parser !//////////////////////////////////
async function region(place_full){
    if(place_full.includes(', ')){
        return await place_full.split(', ')[1];
    }else{
        if(await city(place_full) == ''){
            return place_full;
        }else{
            return '';
        }
    }
}
async function city(place_full){
    if(place_full.includes(' of ')){
        return await place_full.split(' of ')[1].split(', ')[0];
    }else{
        return '';
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////
let USER_DEFINE_TRIGGERED = false;
let MAG_TRIGGERED = false;
let server_down = false;
let data_down = false;
let chk_0_changed = false;
let changed_in_nested = false;
let changed_in_nested_storage_automatic = [];
let changed_in_nested_storage_reviewed = [];
let changed_in_nested_storage_undefined = [];
let _prev_current_diff;
let _prev_current_diff_arr = [];
async function main(){
    if(mon_started == false){
        howismaass = 'USGS not detected!';
        await find_tab();
        return;
    }
    let status_change_switch = false;
    let changed_in_time = [];
    let if_data_changed = false;
    let last_exit_diff = 0;
    let diff_check = [];
    if(mon_started & lasttabUsed != null){
            const first_data = await fetch_url_parsing();
        if(((first_data != null) & (first_data !== '') & (first_data !== 'Fault'))){
            if(data_down){
                data_down = false;
                const Text_tts = 'USGS, Connection is recovered.';
                await playMP3('backon', Text_tts, undefined);
                console.log('data_down -> data_up');
            }
            if(server_down){
                server_down = false;
                const Text_tts = 'USGS, Connection is recovered.';
                await playMP3('backon', Text_tts, null);
                console.log('Server_down -> Server_up');
            }
            // new data receiv -> test with prev // data update -> test with prev(more algorithm needed) 
            const first_target_data = await first_data.features;
//////////////////////CHECK_DATA CHANGED////////////////////////////////////////////
            let data_change_length = Math.min(await first_target_data.length, await _prev_first_data.length);
            for(let i = 0; i < data_change_length; i++){
                if((await first_target_data[i].id != await _prev_first_data[i].id) || (await first_target_data[i].properties.mag != await _prev_first_data[i].properties.mag) || (await first_target_data[i].properties.status != await _prev_first_data[i].properties.status)){
                    if_data_changed = true;
                    break;
                }  
            }
//////////////////////////////////////////////////////////////////////////////
            if(prev_first_data_first != null){ // one time function OTF
                _prev_first_data = await first_target_data;
                if((await prev_first_data_first[0] != null) & (await prev_first_data_first[0] != '')){
                    if((await prev_first_data_first[0].toString() == await first_target_data[0].id.toString())){
                        if((await prev_first_data_first[1] != null) & (await prev_first_data_first[1] != '')){
                            if((await prev_first_data_first[1] == await first_target_data[0].properties.mag)){
                                prev_first_data_first = undefined; // if status reviewed is needed, use this variable
                                console.log('The data seems to be the same from the last exit!');
                            }else{
                                console.log('The id seems to be the same from the last exit but mag');
                                _prev_first_data[0].properties.mag = await prev_first_data_first[1];
                                prev_first_data_first = undefined;
                                return;
                            }
                        }else{
                            console.log('The id seems to be the same from the last exit but mag');
                            _prev_first_data[0].properties.mag = await prev_first_data_first[1];
                            prev_first_data_first = undefined;
                            return; 
                        }
                    }else{
                        for(let i = 0; i < first_target_data.length; i++){
                            if(await prev_first_data_first[0].toString() == await first_target_data[i].id.toString()){
                                console.log('new Data has been piled up from the last exit!');
                                prev_first_data_first = undefined; // if status reviewed is needed, use this variable
                                last_exit_diff = i;
                                await _prev_first_data.splice(0, i);
                                return;
                            }
                            if(i >= first_target_data.length-1){// if program is started day after, reset _prev_first_data;
                                _prev_first_data = 'abc';
                            }
                        }
                        prev_first_data_first = undefined; // if status reviewed is needed, use this variable
                        if(last_exit_diff>0){
                            if_data_changed = true;
                        }
                    }
                }else{
                    _prev_first_data = 'abc';
                }
                prev_first_data_first = undefined;
            }
///////////////////////////////////////////////////
///////avoid test error //
if(_prev_first_data.length <= 0){
    _prev_first_data = 'abc';
}
//////////////////////////////////////////CHECK IF ID IS DELETED OR NOT//////////////////////////////////
if(((_prev_first_data != null)&&(_prev_first_data.toString() != await first_target_data.toString()))||if_data_changed){
    let _prev_first_diff = [];
    let current_del = [];
    let del_testbox=[];
    let deleted_swt = false;
    let diff_swt = [];
//////////////////////////////////DATA_DIFF_ALGORITHM/////////////////////////////////
    for(let i=0; i<await _prev_first_data.length; i++){
        _prev_first_diff[i] = await _prev_first_data[i].id;
    }
    for(let i=0; i<await first_target_data.length; i++){
        current_del[i] = await first_target_data[i].id;
    }
    for(let i=0; i<_prev_first_data.length; i++){
        if(current_del.includes(await _prev_first_data[i].id)){
        }else{ // Data Deletion event detector
            if(_prev_first_data[i].id != null && _prev_first_data[i].id != ''){
                console.log('Data deleted: ' + '[id]: ' + (await _prev_first_data[i].id) + '  [place_name]: ' + (await _prev_first_data[i].properties.place) + '  [mag]: ' + (await _prev_first_data[i].properties.mag) + '    ' + i);
                del_testbox.push(`${await _prev_first_data[i].properties.place}+${await _prev_first_data[i].properties.mag}`);
            }
            if(!deleted_swt){
                deleted_swt = true;
            }
        }
    }
    for(let i = 0; i<await first_target_data.length; i++){
        if(_prev_first_diff.includes(await first_target_data[i].id)){
            diff_swt[i] = false;
        }else{
            diff_swt[i] = true;
            diff_check.push(i);
            console.log('New Data: ' + '[id]: ' + (await first_target_data[i].id) + '  [place_name]: ' + (await first_target_data[i].properties.place) + '  [mag]: ' + (await first_target_data[i].properties.mag) + '    ' + i);
            if(deleted_swt){
                if(del_testbox.includes(`${await first_target_data[i].properties.place}+${await first_target_data[i].properties.mag}`)){
                    diff_swt[i] = false;
                    diff_check.pop(i);
                }
            }
        }
    }
    if (diff_check.length>0 || diff_swt.includes(true)){
        if_data_changed = true;
    }
    //console.log(diff_swt);
    if(deleted_swt && !diff_swt.includes(true)){ // if data not changed
        _prev_first_data = await first_target_data;
        if_data_changed = false;
        await chrome.storage.sync.set({prev_first_data_storage: [await _prev_first_data[0].id, await _prev_first_data[0].properties.mag]}, async function() {});
        await chrome.storage.sync.set({prev_target_num_auto_rev: [await target_num_automatic, await target_num_reviewed, await target_num_undefined, await auto_reviewed]}, async function() {});
        console.log('Done');
        return "Done"
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function nochange(){
    async function arr(){
        if(first_target_data[_prev_current_diff_arr[0]] == null){
            return 0;
        }else{
            return await _prev_current_diff_arr[0];
        }
    }
    USER_DEFINE_TRIGGERED = false;
    if(DEFINE_USER_MAG == undefined | DEFINE_USER_MAG == null){
        DEFINE_USER_MAG = 6;
    }
    if(["automatic", "AUTOMATIC"].includes(await first_target_data[await arr()].properties.status)){
        auto_reviewed = true;
    }else if(["reviewed", "REVIEWED"].includes(await first_target_data[await arr()].properties.status)){
        auto_reviewed = false;
    }else{
        auto_reviewed = undefined;
    }
    const mag = await first_target_data[await arr()].properties.mag;
    if(mag >= DEFINE_USER_MAG){
        await chrome.tabs.sendMessage(lasttabUsed, {message:"more", data: { DEFINE_USER_MAG, target_num_automatic, target_num_reviewed, target_num_undefined, auto_reviewed }});
    }else if(mag < DEFINE_USER_MAG){
        await chrome.tabs.sendMessage(lasttabUsed, {message:"less", data: { DEFINE_USER_MAG, target_num_automatic, target_num_reviewed, target_num_undefined, auto_reviewed }});
    }
}
            if((!if_data_changed) && (_prev_first_data == await first_target_data.toString())){
                try{
                    if (await chrome.offscreen.hasDocument()){
                            await nochange();
                    }else{
                        await nochange();
                    }
                }catch(err){
                    console.log(err + ' [err] found while injecting codes => so reload the lasttab');
                    mon_started = false;
                    find_tab();
                    return;
                };
                return;
            }      
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            if((if_data_changed) || (_prev_first_data.toString() != await first_target_data.toString())){ // (_prev_first_data.toString() != await first_target_data.toString()) does not test everything. therefore, if_data_changed is needed!
                if(_prev_first_data == 'user_change'){
                    // Nothing
                }else{
                    console.log('received new data');
                    _prev_current_diff = 0;
                    if(last_exit_diff>0){
                        _prev_current_diff = last_exit_diff;
                        for(let i = 0; i < _prev_current_diff; i++){
                            _prev_current_diff_arr[i] = i;
                        }
                    }
                    if((diff_check.length>0)){
                        _prev_current_diff = diff_check.length;
                        _prev_current_diff_arr = diff_check;
                        console.log(_prev_current_diff_arr);
                    }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    for(let k = 0; k < changed_in_time.length; k++){
                        if(changed_in_time[k] === '' || changed_in_time[k] === null || changed_in_time[k] === undefined){
                            console.log('Deleted obsolete data from changed_in_time: ' + changed_in_time[k]);
                            changed_in_time.splice(k,1);
                        }
                    }
                    if(changed_in_time.length>0){
                        for(let m = 0; m < first_target_data.length; m++){
                            if(changed_in_time.includes(await first_target_data[m].id)){ // changed_in_time;
                                if((await first_data.metadata.generated - await first_target_data[m].properties.time) > DEFINE_USER_HOUR){ // if defined 'hour' is smaller than the data
                                    for(let k = 0; k < changed_in_time.length; k++){
                                        if(changed_in_time[k] == await first_target_data[m].id){
                                            changed_in_time.splice(k,1);
                                        }
                                    }
                                }
                                if(await first_target_data[m].properties.mag < DEFINE_USER_MAG){ // if the data is smaller than the defined mag!
                                    for(let k = 0; k < changed_in_time.length; k++){
                                        if(changed_in_time[k] == await first_target_data[m].id){
                                            changed_in_time.splice(k,1);
                                        }
                                    }
                                }
                            }
                        }
                        changed_in_nested = true;
                    }
                    target_num_automatic = null; //confirmed!
                    target_num_reviewed = null;
                    target_num_undefined = null;
                    changed_in_nested_storage_automatic = []; //confirmed!
                    changed_in_nested_storage_reviewed = [];
                    changed_in_nested_storage_undefined = [];
                    chk_0_changed = true; // 0_changed !
                    if(_prev_first_data !== 'abc' && _prev_first_data !== 'user_change' && _prev_first_data != null){
                        USER_DEFINE_TRIGGERED = true;
                        for(let a=0; a<await first_target_data.length; a++){
                            if((await first_target_data[a].id == await _prev_first_data[a].id)){
                                chk_0_changed = false;
                                USER_DEFINE_TRIGGERED = false;
                            }else{
                                if((`${await first_target_data[a].properties.place}+${await first_target_data[a].properties.mag}` != `${await _prev_first_data[a].properties.place}+${await _prev_first_data[a].properties.mag}`)){
                                    USER_DEFINE_TRIGGERED = true;
                                    break;
                                }
                            }
                        }
                        //console.log('_prev_first_data: ' , _prev_first_data);
                        //console.log('first_target_data: ' , await first_target_data);
                        for(let j = 0; j < await _prev_first_data.length; j++){
                            for(let i = 0; i < await first_target_data.length; i++){
                                if(await first_target_data[i].id == await _prev_first_data[j].id){
                                    //////////////////////////////// status changed while mags are the same ///////////////////////
                                    if((await _prev_first_data[j].properties.status != await first_target_data[i].properties.status) && (await first_target_data[i].properties.mag == await _prev_first_data[j].properties.mag)){
                                        USER_DEFINE_TRIGGERED = false;
                                        const updated_time_diff = await first_data.metadata.generated - await _prev_first_data[j].properties.time;
                                        if((updated_time_diff <= DEFINE_USER_HOUR) && (await first_target_data[i].properties.mag >= DEFINE_USER_MAG)){
                                            const place_full = await first_target_data[i].properties.place;
                                            const place_region = await region(place_full);
                                            const place_city = await city(place_full);
                                            if(changed_in_time.includes(await first_target_data[i].id)){
                                            }else{
                                                changed_in_time.push(await first_target_data[i].id); // <-- add only if it was created within 1 hour
                                            }
                                            const current_mag = await first_target_data[i].properties.mag;
                                            const prev_status = _prev_first_data[j].properties.status;
                                            const current_status = first_target_data[i].properties.status;
                                            const packed_data = {place_region, place_city, prev_status, current_status, updated_time_diff};
                                            const Text_tts = `USGS ${place_region}, ${place_city}'s STATUS is changed to ${current_status} from ${prev_status}.`;
                                            console.log(Text_tts);
                                            await playMP3('Alert.mp3_status_changed', Text_tts, [current_mag, packed_data]);
                                            status_change_switch = true;
                                            changed_in_nested = true;
                                            changed_in_nested_storage_automatic = [];
                                            changed_in_nested_storage_reviewed = [];
                                            changed_in_nested_storage_undefined = [];
                                    }
                                }
                                    ///////////////// Mag changed! //////////////////////////
                                    if(await first_target_data[i].properties.mag != await _prev_first_data[j].properties.mag){
                                        USER_DEFINE_TRIGGERED = false;
                                        //console.log('previous data seems to be updated:  ' + await _prev_first_data[j].properties.place +` mag changed from ${await _prev_first_data[j].properties.mag} to ${await first_target_data[i].properties.mag}`);
                                        //console.log(await first_data.metadata.generated - await _prev_first_data[j].properties.time + '  ' + DEFINE_USER_HOUR);
                                            const updated_time_diff = await first_data.metadata.generated - await _prev_first_data[j].properties.time;
                                            if((updated_time_diff <= DEFINE_USER_HOUR) && (await first_target_data[i].properties.mag >= DEFINE_USER_MAG)){
                                                const place_full = await first_target_data[i].properties.place;
                                                const place_region = await region(place_full);
                                                const place_city = await city(place_full);
                                                const prev_mag = await _prev_first_data[j].properties.mag;
                                                const current_mag = await first_target_data[i].properties.mag;
                                                const status = await first_target_data[i].properties.status;
                                                const packed_data = {place_region, place_city, prev_mag, current_mag, updated_time_diff};
                                                async function logAndPlaySound(status, updated_time_diff, _prev_first_data, j, first_target_data, i, place_region, place_city, prev_mag, current_mag, packed_data) {
                                                    const hour_1 = 3600000;
                                                    let logMessage, textTts, soundFile;
                                                    if (["reviewed", "REVIEWED"].includes(status)) {
                                                        logMessage = `[Reviewed] updated within ${Math.floor(updated_time_diff / hour_1)} hour(s) ${Math.round(0.6 * ((updated_time_diff / hour_1) % 1) * 100)} Minute(s): `;
                                                        textTts = `USGS ${place_region}, ${place_city}'s magnitude is changed to ${current_mag} from ${prev_mag} and REVIEWED!`;
                                                        soundFile = 'Alert.mp3_mag_changed_reviewed';
                                                    } else if (["automatic", "AUTOMATIC"].includes(status)) {
                                                        logMessage = `[Automatic] updated within ${Math.floor(updated_time_diff / hour_1)} hour(s) ${Math.round(0.6 * ((updated_time_diff / hour_1) % 1) * 100)} Minute(s): `;
                                                        textTts = `USGS ${place_region}, ${place_city}'s magnitude is changed to ${current_mag} from ${prev_mag} and not yet REVIEWED!`;
                                                        soundFile = 'Alert.mp3_mag_changed_automatic';
                                                    } else {
                                                        logMessage = `[Undefined] updated within ${Math.floor(updated_time_diff / hour_1)} hour(s) ${Math.round(0.6 * ((updated_time_diff / hour_1) % 1) * 100)} Minute(s): `;
                                                        textTts = `USGS ${place_region}, ${place_city}'s magnitude is changed to ${current_mag} from ${prev_mag} and UNDEFINED`;
                                                        soundFile = 'Alert.mp3_mag_changed_undefined';
                                                    }
                                                    console.log(logMessage + _prev_first_data[j].properties.place + ` mag changed from ${_prev_first_data[j].properties.mag} to ${first_target_data[i].properties.mag}`);
                                                    await playMP3(soundFile, textTts, [current_mag, packed_data]);
                                                    if (changed_in_time.includes(await first_target_data[i].id)) {
                                                    }else{
                                                        changed_in_time.push(await first_target_data[i].id); // <-- add only if it was created within 1 hour
                                                    }
                                                    changed_in_nested = true;
                                                    status_change_switch = true;
                                                    changed_in_nested_storage_automatic = [];
                                                    changed_in_nested_storage_reviewed = [];
                                                    changed_in_nested_storage_undefined = [];
                                                }
                                                await logAndPlaySound(status, updated_time_diff, _prev_first_data, j, first_target_data, i, place_region, place_city, prev_mag, current_mag, packed_data);                                                
                                            }
                                    }else{
                                        //console.log('previous data seems to be not updated:  ' + _prev_first_data[j].properties.place +` Prev: ${_prev_first_data[j].properties.mag}  Now: ${first_target_data[i].properties.mag}`);
                                        //nothing -> confirmed working properly
                                    }
                                }
                            }
                        }
                        if(changed_in_time != null){
                            _prev_first_data = await first_target_data;
                        }
                    }
                    console.log('changed id: ' + changed_in_time);
            }
            if(((first_target_data != null) & (first_target_data !== '') & (first_data !== 'Fault'))){
                async function second_data(){
                    if(first_target_data[_prev_current_diff_arr[0]] == null){
                        return await first_target_data[0].properties;
                    }else{
                        return await first_target_data[_prev_current_diff_arr[0]].properties;
                    }
                }
                const second_target_data = await second_data();
                const detect_time = await time_parser(parseInt(await second_target_data.time));
                const update_time = await time_parser(parseInt(await second_target_data.updated));
                const place_full = await second_target_data.place;
                const place_region = await region(place_full);
                const place_city = await city(place_full);
                async function geo_data(){
                    if(first_target_data[_prev_current_diff_arr[0]] == null){
                        return await first_target_data[0].geometry.coordinates
                    }else{
                        return await first_target_data[_prev_current_diff_arr[0]].geometry.coordinates
                    }
                }
                const lnglatdep = await geo_data();
                const packed_data = {detect_time, update_time, place_full, lnglatdep};
                const mag = Math.round(parseFloat(second_target_data.mag) * 10, 2) / 10;
                if(_prev_current_diff>0){
                    target_num_automatic = [];
                    target_num_reviewed = [];
                    target_num_undefined = [];
                    for(let k=0; k < _prev_current_diff; k++){
                        if((await first_data.metadata.generated - await first_target_data[k].properties.time) <= DEFINE_USER_HOUR){
                            if(await first_target_data[_prev_current_diff_arr[k]].properties.mag >= DEFINE_USER_MAG){
                                if(["automatic", "AUTOMATIC"].includes(await first_target_data[_prev_current_diff_arr[k]].properties.status)){
                                    if(target_num_automatic.includes(_prev_current_diff_arr[k])){
                                    }else{
                                        target_num_automatic.push(_prev_current_diff_arr[k]);
                                    }
                                }else if(["reviewed", "REVIEWED"].includes(await first_target_data[_prev_current_diff_arr[k]].properties.status)){
                                    if(target_num_reviewed.includes(_prev_current_diff_arr[k])){
                                    }else{
                                        target_num_reviewed.push(_prev_current_diff_arr[k]);
                                    }
                                }else{
                                    if(target_num_undefined.includes(_prev_current_diff_arr[k])){
                                    }else{
                                        target_num_undefined.push(_prev_current_diff_arr[k]);
                                    }
                                }
                            }
                        }
                    }                   
                }
                if(changed_in_nested){
                    changed_in_nested = false;
                    for(let i=0; i < first_target_data.length; i++){
                        for(let j=0; j < changed_in_time.length; j++){
                            if(await first_target_data[i].id == changed_in_time[j]){
                                if(["automatic", "AUTOMATIC"].includes(await first_target_data[i].properties.status)){
                                    changed_in_nested_storage_automatic.push(i);
                                }else if(["reviewed", "REVIEWED"].includes(await first_target_data[i].properties.status)){
                                    changed_in_nested_storage_reviewed.push(i);
                                }else{
                                    changed_in_nested_storage_undefined.push(i);
                                }
                            }
                        }                         
                    }
                    // console.log('changed_in_nested_storage_automatic: ', changed_in_nested_storage_automatic);
                    // console.log('changed_in_nested_storage_reviewed:  ', changed_in_nested_storage_reviewed);
                    // console.log('changed_in_nested_storage_undefined: ', changed_in_nested_storage_undefined);
                    if(status_change_switch){
                        target_num_automatic = changed_in_nested_storage_automatic;
                        target_num_reviewed = changed_in_nested_storage_reviewed;
                        target_num_undefined = changed_in_nested_storage_undefined;
                    }
                    if(_prev_current_diff>1){
                        target_num_automatic = target_num_automatic.concat(changed_in_nested_storage_automatic);
                        target_num_reviewed = target_num_reviewed.concat(changed_in_nested_storage_reviewed);
                        target_num_undefined = target_num_undefined.concat(changed_in_nested_storage_undefined);
                    }
                }
                _prev_first_data = await first_target_data;
                try{
                    await chrome.storage.sync.set({prev_first_data_storage: [await _prev_first_data[0].id, await _prev_first_data[0].properties.mag]}, async function() {});
                    await chrome.storage.sync.set({prev_target_num_auto_rev: [await target_num_automatic, await target_num_reviewed, await target_num_undefined, await auto_reviewed]}, async function() {});
                    await chrome.storage.sync.set({prev_current_diff_arr: [_prev_current_diff_arr]}, async function() {});
                }catch(err){
                    console.log(err);
                }
                    try{
                        if(DEFINE_USER_MAG == undefined | DEFINE_USER_MAG == null){
                            DEFINE_USER_MAG = 6;
                        }
                        if(_prev_current_diff>0){
                            MAG_TRIGGERED = false;
                            for(let k=0; k < _prev_current_diff; k++){
                                if(first_target_data[_prev_current_diff_arr[k]].properties.mag >= DEFINE_USER_MAG){
                                    MAG_TRIGGERED = true;
                                    break;
                                }
                            }
                        }else{
                            if(mag >= DEFINE_USER_MAG){
                                if(USER_DEFINE_TRIGGERED | chk_0_changed){
                                    MAG_TRIGGERED = true;
                                }
                            }else{
                                if(USER_DEFINE_TRIGGERED == false){
                                    MAG_TRIGGERED = false;
                                }
                            }
                        }
                    }catch(err){
                        console.log(err + ' err found while injection');
                        mon_started = false;
                        find_tab();
                        return;
                    };
                if(MAG_TRIGGERED){ // tts and poppu blocked afeter the first alarm;
                    MAG_TRIGGERED = false;
                    // popup here
                    if(_prev_current_diff>1){ 
                        const diff = _prev_current_diff;
                        _prev_current_diff = 0;
                        for(let k=0; k < diff; k++){
                            if((await first_data.metadata.generated - await first_target_data[k].properties.time) <= DEFINE_USER_HOUR){
                                if(await first_target_data[_prev_current_diff_arr[k]].properties.mag >= DEFINE_USER_MAG){
                                    _prev_current_diff = _prev_current_diff + 1;
                                }
                            }
                        }
                    }
                    if(_prev_current_diff>1){
                        for(let k=0; k < _prev_current_diff; k++){
                            if((await first_data.metadata.generated - await first_target_data[k].properties.time) <= DEFINE_USER_HOUR){
                                const second_target_data = await first_target_data[_prev_current_diff_arr[k]].properties;
                                const detect_time = await time_parser(parseInt(second_target_data.time));
                                const update_time = await time_parser(parseInt(second_target_data.updated));
                                const place_full = await second_target_data.place;
                                const place_region = await region(place_full);
                                const place_city = await city(place_full);
                                const mag =  await second_target_data.mag;
                                const lnglatdep = await first_target_data[_prev_current_diff_arr[k]].geometry.coordinates;
                                const packed_data = {detect_time, update_time, place_full, lnglatdep};
                                if(await first_target_data[_prev_current_diff_arr[k]].properties.mag >= DEFINE_USER_MAG){
                                    if(["reviewed", "REVIEWED"].includes(await first_target_data[_prev_current_diff_arr[k]].properties.status)){
                                        const Text_tts = `USGS, Multiple events triggered!!, please check the popup.!`;
                                        console.log(`triggered: USGS, from ${place_region} ${place_city} magnitude ${mag} detected! [reviewed]`);
                                        await playMP3('Alert.mp3_reviewed_pcd', Text_tts, [mag, packed_data]);
                                    }else if(["automatic", "AUTOMATIC"].includes(await first_target_data[_prev_current_diff_arr[k]].properties.status)){
                                        const Text_tts = `USGS, Multiple events triggered!!, please check the popup.!`;
                                        console.log(`triggered: USGS, from ${place_region} ${place_city} magnitude ${mag} detected! [automatic]`);
                                        await playMP3('Alert.mp3_automatic_pcd', Text_tts, [mag, packed_data]);
                                    }else{
                                        const Text_tts = `USGS, Multiple events triggered!!, please check the popup.!`;
                                        console.log(`triggered: USGS, from ${place_region} ${place_city} magnitude ${mag} detected! [undefined]`);
                                        await playMP3('Alert.mp3_undefined_pcd', Text_tts, [mag, packed_data]);
                                    }
                                }
                            }
                        }
                    }else{
                        async function arr(){
                            if(first_target_data[_prev_current_diff_arr[0]] == null){
                                return 0;
                            }else{
                                return await _prev_current_diff_arr[0];
                            }
                        }
                        if((await first_data.metadata.generated - await first_target_data[0].properties.time) <= DEFINE_USER_HOUR){
                            if(["reviewed", "REVIEWED"].includes(await first_target_data[await arr()].properties.status)){
                                const Text_tts = `USGS, near ${place_region}, ${place_city}, magnitude ${mag} has been detected! reviewed!`
                                console.log(Text_tts);
                                await playMP3('Alert.mp3_reviewed', Text_tts, [mag, packed_data]);
                            }else if (["automatic", "AUTOMATIC"].includes(await first_target_data[await arr()].properties.status)){
                                const Text_tts = `USGS, near ${place_region}, ${place_city}, magnitude ${mag} has been detected! not yet reviewed!`
                                console.log(Text_tts);
                                await playMP3('Alert.mp3_automatic', Text_tts, [mag, packed_data]);
                            }else{
                                const Text_tts = `USGS, near ${place_region}, ${place_city}, magnitude ${mag} has been detected! undefined status!`
                                console.log(Text_tts);
                                await playMP3('Alert.mp3_undefined', Text_tts, [mag, packed_data]);
                            }
                        }
                    }
                }
            }
        }
        //}
        }
        if(first_data === 'Fault'){
            if(server_down == false & server_down_swt & data_down_swt){
                console.log('Something went wrong!, Connection_Err');
                const Text_tts = `USGS, data problem and connection error detected, check your connection!`
                await playMP3('Info.mp3', Text_tts, [null, null]);
                server_down = true;
            }
            if(data_down == false & server_down_swt == false & data_down_swt){
                console.log('Data not received!');
                const Text_tts = `Failed to retrieve the data`
                await playMP3('Info.mp3', Text_tts, [undefined, undefined]);
                data_down = true;
            }
        }
    }
    if(server_down || data_down){
        return "Down";
    }
    await chrome.tabs.reload(lasttabUsed);
    //await popnloc(lasttabUsed, DEFINE_USER_MAG, target_num_automatic, target_num_reviewed, target_num_undefined, auto_reviewed);
    console.log('Done');
    return 'Done';
}

async function popnloc(lasttabUsed, DEFINE_USER_MAG, target_num_automatic, target_num_reviewed, target_num_undefined, auto_reviewed){
    await chrome.tabs.reload(lasttabUsed);
    setTimeout(async () => {
        try{
            await chrome.tabs.sendMessage(lasttabUsed, {message:"popnloc", data: { DEFINE_USER_MAG, target_num_automatic, target_num_reviewed, target_num_undefined, auto_reviewed }});
        }catch(error){
            console.log(error + ' maybe the page is not loaded properly -> force reload the page!');
            mon_started = false;
            find_tab();
        }
    }, 2000);
}