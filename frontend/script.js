"use strict"



const weatherContainer=document.querySelector(".weather__container")

const weatherKeyAPI = "cc64220f3035e5a16294d43495518496"
const reverseGeocodeAPI = "pk.1960b7873a2354dd9497f5afaead3209"
const infoContainer = document.querySelector(".info__container")
const menuSidebarList = document.querySelector(".menu_sidebar_list")
const tbodyElements = document.querySelectorAll("tbody")
const modalWindowDelete= document.querySelector(".modal__delete")
const modalWindowPostpone= document.querySelector(".modal__postpone")
const modalWindowCompleted= document.querySelector(".modal__completed")
const modalWindowUpdate= document.querySelector(".modal__update")



const intOptionsWeather = {
    hour: "numeric",
    minute : "numeric",
    day: "numeric",
    month: 'short', 
    weekday: "long", 
    year: 'numeric'
}

const dateInternOptions ={
    year: "2-digit",
    day: "2-digit",
    month: "2-digit"
}


const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul","Aug", "Sep", "Oct", "Nov", "Dec"]
const days = ["SUN","MON", "TUE", "WED", "THU", "FRI", "SAT", ]
const weatherIcons = {
    "01d": "wi-day-sunny", 
    "02d": "wi-day-cloudy", 
    "03d": "wi-cloud", 
    "04d": "wi-cloudy", 
    "09d": "wi-rain-wind", 
    "10d": "wi-day-sleet", 
    "11d": "wi-storm-showers", 
    "13d": "wi-snowflake-cold", 
    "50d": "wi-day-fog", 
    "01n": "wi-night-clear", 
    "02n": "wi-night-alt-cloudy", 
    "03n": "wi-cloud", 
    "04n": "wi-cloudy", 
    "09n": "wi-rain-wind", 
    "10n": "wi-night-alt-showers", 
    "11n": "wi-night-alt-storm-showers", 
    "13n": "wi-snowflake-cold", 
    "50n": "wi-night-fog", 
}




class App {

    #userLocation;
    #userLocationCoords;
    #taskContainer;
    #todayTaskContainer;
    #weekTaskContainer;

    // #user={
    //     "username": "gabriel",
    //     "id": 1,
    //     "email": "gabi.munteanu@hit-ad.ro",
    //     "token": "28957212399c77c3f33a137d6e99c0564050e002",
    //     "picture": "http://127.0.0.1:8000/media/user_media/user_gabriel/default.jpg"
    // }
    #user;
    
    constructor(){
        this.taskList=[]; 
        this._getUserLocation();
        this.currentDate =new Date();
        this._addEventListeners();
    }

    //  SUB-COMPONENT  getting LAT/LONG of user location
    _getUserLocation(){
        navigator.geolocation.getCurrentPosition( location=>{
            this.#userLocationCoords = [location.coords.latitude,location.coords.longitude]
            this._getCurrentCity(this.#userLocationCoords)
            ;} ,error=> console.log("Could not get location using navigator API"));
    }

   //  SUB-COMPONENT  getting city of user location
   _getCurrentCity([lat,long]){
    fetch(`https://us1.locationiq.com/v1/reverse.php?key=${reverseGeocodeAPI}&lat=${lat}&lon=${long}=&format=json&accept-language="en"`)
    .then(response=>response.json())
    .then(data => {
        if(data.address.city.toLowerCase().includes("sector")){
            this.#userLocation = "Bucharest";
        }else{
            this.#userLocation=data.address.city
        }
        this._getWeatherInfo(this.#userLocationCoords)
    })
    .catch(error => console.error("Could not get current city using geocode API"))
    }    
    
    //  SUB-COMPONENT  format received weather data from API for easy implementation. Returning an MAP object
    _formatWeather (data){
        const dataObj =new Map();
        dataObj.set("today",
                {"temp":data.current.temp.toFixed(1),
                "humidity":data.current.humidity,
                "icon":weatherIcons[data.current.weather[0].icon],
                "description": data.current.weather[0].main
                })
        dataObj.set("forecast", [])
        data.daily.forEach((day,index)=>{
            dataObj.get("forecast").push(
                {"temp":day.temp.day.toFixed(0), 
                "icon":weatherIcons[day.weather[0].icon]})
        })

        // getting next days literall\
        const today = this.currentDate.getDay();
        dataObj.set("nextDays",[days[today]])
        for( let i=1;i<6;i++){
            if(i+today<days.length){
                dataObj.get("nextDays").push(days[today+i])
            }else{
                dataObj.get("nextDays").push(days[today-7+i])
            }
        }
        return dataObj;
    }


    // SUB-COMPONENT  render all information to the console (date, weather, forecast, location)
    renderWeatherHtml(weatherObj,date,location) {
        
        const html =`
        <div class="weather__container">
                    <div class="date__info"> 
                        <p class="font_xxl mg__lt10">${date.getDate()}</p>
                        <div class="mg__lt10">   
                            <p class="font_esm"> ${months[date.getMonth()]}</p> </p>
                            <p class="font_esm"> ${date.getFullYear()} </p>
                        </div>
                        <p class="font_esm location mg__lt10 ">${location}</p>
                    </div>
                    <div class="weather__info ">
                        <i class="wi ${weatherObj.get('today').icon} font_weather mg__lt10"></i>
                        <p class="font_esm mg__lt10">${weatherObj.get('today').temp}<span>&#176;</span>C</p>
                        <p class="font_esm mg__lt10"> ${weatherObj.get('today').description}</p>
                        <i class="wi wi-humidity font_weather mg__lt10"></i>
                        <p class="font_esm mg__lt10">${weatherObj.get('today').humidity} %</p>
                    </div>
                    <hr class="fade_rule mg__tp10"></hr>  
                   <div class="weather__forecast mg__tp10">
                        <i class="wi ${weatherObj.get('forecast')[1].icon} font_forecast"></i>
                        <i class="wi ${weatherObj.get('forecast')[2].icon} font_forecast"></i>
                        <i class="wi ${weatherObj.get('forecast')[3].icon} font_forecast"></i>
                        <i class="wi ${weatherObj.get('forecast')[4].icon} font_forecast"></i>
                        <i class="wi ${weatherObj.get('forecast')[5].icon} font_forecast"></i>
                        <p class="font_esm "> ${weatherObj.get('forecast')[1].temp}<span>&#176;</span> </p>
                        <p class="font_esm "> ${weatherObj.get('forecast')[2].temp}<span>&#176;</span> </p>
                        <p class="font_esm "> ${weatherObj.get('forecast')[3].temp}<span>&#176;</span> </p>
                        <p class="font_esm "> ${weatherObj.get('forecast')[4].temp}<span>&#176;</span> </p>
                        <p class="font_esm "> ${weatherObj.get('forecast')[5].temp}<span>&#176;</span> </p> 
                        <p class="font_esm "> ${weatherObj.get('nextDays')[1]}</p>
                        <p class="font_esm "> ${weatherObj.get('nextDays')[2]}</p>
                        <p class="font_esm "> ${weatherObj.get('nextDays')[3]}</p>
                        <p class="font_esm "> ${weatherObj.get('nextDays')[4]}</p>
                        <p class="font_esm "> ${weatherObj.get('nextDays')[5]}</p>
                     
                   </div>
                   <hr class="fade_rule mg__tp10"></hr>  
                </div>
        `
        infoContainer.insertAdjacentHTML("afterbegin", html);
    }
    
    // SUB-COMPONENT  getting csrf token from browser cookie
    _getCSRFToken(){
        const [,cookie] = String(document.cookie).split("=");
            return cookie
    }


    //  COMPONENT  getting weather information from openweather API
    _getWeatherInfo(city){
        const weatherFetchURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${this.#userLocationCoords[0]}&lon=${this.#userLocationCoords[1]}&exclude=hourly,minutely&appid=${weatherKeyAPI}&units=metric`
        fetch(weatherFetchURL)
        .then(response => response.json())
        .then(data => {
            const formatedWeather= this._formatWeather(data);
            this.renderWeatherHtml(formatedWeather,this.currentDate,this.#userLocation)
            // document.querySelector(".weather__container").classList.remove(".display__none")
        })
        .catch(err => console.error(err))
    }


    // COMPONENT  this function handles the user click on home button

    _renderTask(data,action_container){
        const tableId = document.querySelector(`.${action_container}`).querySelector("table").getAttribute("id")
        this._emptyTableElements(tableId);

        const position = document.querySelector(`.${action_container}`).getElementsByTagName("tbody")[0]
        data.forEach(task => {

            // format arrow class, arrow colour and date 
            let arrowClass; 
            if (task.importance==="high") arrowClass="fas fa-long-arrow-alt-up high";
            else if (task.importance==="medium") arrowClass= "fas fa-arrows-alt-v medium";
            else arrowClass= "fas fa-long-arrow-alt-down low";
            let deadline = new Intl.DateTimeFormat("default",dateInternOptions ).format(new Date(task.deadline_date))

            const html = `
                <tr class="task__item" data-taskid=${task.id}>
                    <td style="width:2%;text-align:center"><i class="${arrowClass}"></i></td>
                    <td style="width:5%;text-align:center"><p class="font_small">${task.id}</p></td>
                    <td style="width:40%"><p class="font_small">${task.description}</p></td>
                    <td style="width:6%;text-align:center"><p class="font_small">13%</p></td>
                    <td style="width:12%;text-align:center"><p class="font_small">${deadline}</p></td>
                    <td class="deadline__date" style="width:8%;text-align:center"><p class="font_small">${task.deadline_time? task.deadline_time.slice(0,5):""}</p></td>
                    <td style="width:3%;text-align:center"><i class="fas fa-circle ${task.status} task__circle"></i></td>
                    <td style="width:3%;text-align:center"><a href="#" class="check__status "><i class="fas fa-check link" data-action="COMPLETED" data-status="${task.status}"</i></a></td>
                    <td style="width:3%;text-align:center"><a href="#" class="check__status "><i class="fas fa-history link " data-action="POSTPONE"></i></a></td>
                    <td style="width:3%;text-align:center"><a href="#" class="check__status "><i class="fas fa-pen link" data-action="UPDATE"></i></a></td>
                    <td style="width:3%;text-align:center"><a href="#" class="check__status "><i class="fas fa-minus-circle link" data-action="DELETE"></i></a></td>
                </tr>    
            
            `
            position.insertAdjacentHTML("beforeend", html)
        })
        document.querySelector(`.${action_container}`).classList.remove("display__none")
    }

    // COMPONENT   fetch for API data according to opened container (TODAY, WEEK, ALL)
    _fetchData(action_container){
        let filter;

        if(action_container==="task") filter="";
        if(action_container==="week_task") filter="?period=week";
        if(action_container==="today_task") filter="?period=today";

        fetch(`http://127.0.0.1:8000/api/task/${filter}`,{
            method: "GET",
            headers:{
            'Authorization': `Token ${this.#user.token}`}
        })
        .then( response => response.json())
        .then( data => {
                if(action_container==="task") this.#taskContainer=data;
                if(action_container==="week_task") this.#weekTaskContainer=data;
                if(action_container==="today_task") this.#todayTaskContainer=data;
                this._renderTask(data, action_container)
            })
        .catch( err => console.error(err))
    }

    


    // SUB-COMPONENT  this function is used for filtering tasks according to SEELCT tags on tables thead. Parameters : filterObject and action container where to update results
    _tasksFilterBy(filterObject,action_container){
        let filteredTasks;
        if(action_container==="task") filteredTasks= this.#taskContainer;
        if(action_container==="week_task")  filteredTasks= this.#weekTaskContainer;
        if(action_container==="today_task") filteredTasks= this.#todayTaskContainer;
        
        
        Object.entries(filterObject).forEach(entry => {
            if(entry[1]!="") filteredTasks=filteredTasks.filter(task =>task[entry[0]]===entry[1])
        })

        this._renderTask(filteredTasks,action_container)


    }

    // SUB-COMPONENT  click on task event handler
    _clickOnTask(e){
        e.preventDefault();
        const actionContainer =e.target.closest("div.action__container").classList[1]

        const taskID = e.target.closest("tr").getAttribute("data-taskid")
        const availableTasks = ["DELETE","UPDATE", "POSTPONE", "COMPLETED"]

        const deletePromise = function(taskID,action){
            return new Promise((resolve, reject) =>{
                modalWindowDelete.classList.remove("display__none")
                modalWindowDelete.getElementsByTagName("p")[0].textContent ="Are you sure you want to delete this task ?";
                document.querySelector(".prompt_message_buttons").addEventListener("click", function(e){
                    e.preventDefault();
                    if((e.target.closest("button") && (e.target.getAttribute("value")==="yes"))) resolve([taskID,action])
                    modalWindowDelete.classList.add("display__none")
                    modalWindowDelete.getElementsByTagName("p")[0].textContent =""
                })
            })
        }

        const postponePromise = function(taskID, action, e, thisKeyword){
            
            fetch(`http://127.0.0.1:8000/api/task/${taskID}/`,{
                    method: "GET",
                    headers: {
                        'Authorization': "Token 28957212399c77c3f33a137d6e99c0564050e002",
                        'Content-type':'application/json',
                        'X-CSRFToken': thisKeyword._getCSRFToken(),
                    }
                })
                .then(response => response.json())
                .then(data => {
                    modalWindowPostpone.getElementsByTagName("input")[0].value = data.deadline_date
                    modalWindowPostpone.getElementsByTagName("input")[1].value = data.deadline_time
                })
           
            return new Promise((resolve, reject) =>{
                modalWindowPostpone.classList.remove("display__none");
                modalWindowPostpone.getElementsByTagName("p")[0].textContent ="Select new deadline";
                document.querySelector(".prompt_message_buttons_postpone").addEventListener("click", function(e){
                    e.preventDefault();
                    const newDate = document.getElementById("deadline").value;
                    const newTime = document.getElementById("hour").value;
                    if((e.target.closest("button") && (e.target.getAttribute("value")==="yes"))) {
                        const object = {
                            "deadline_date": newDate,
                            "deadline_time": newTime,
                        }
                        resolve([taskID, object])
                    }
                    modalWindowPostpone.classList.add("display__none")
                    modalWindowPostpone.getElementsByTagName("p")[0].textContent =""
                })
            })
        }

        const completedPromise= function(taskID,action,e){
            let currentStatus = e.target.getAttribute("data-status")
            return new Promise((resolve,reject)=>{
                modalWindowCompleted.classList.remove("display__none");
                modalWindowCompleted.getElementsByTagName("p")[0].textContent =`Are you sure you want to mark as ${currentStatus==="completed"? "pending":"completed"}?`;
                document.querySelector(".prompt_message_buttons_completed").addEventListener("click", function(e){
                    e.preventDefault();
                    if((e.target.closest("button") && (e.target.getAttribute("value")==="yes"))) {
                        const object = {
                           "status":`${currentStatus==="completed"? "pending":"completed"}`
                        }
                        this.target.setAttribute("data-status",object["status"]);
                        resolve([taskID, object])
                    }
                    modalWindowCompleted.classList.add("display__none")
                    modalWindowCompleted.getElementsByTagName("p")[0].textContent =""
                }.bind(e))
            })
        }

        const updatePromise = function(taskID,action,e,thisKeyword){
            return new Promise((resolve,reject)=>{
                modalWindowUpdate.classList.remove("display__none");
                modalWindowUpdate.getElementsByTagName("p")[0].textContent ="Update task details";
                // set default form values with task details
             
                fetch(`http://127.0.0.1:8000/api/task/${taskID}/`,{
                    method: "GET",
                    headers: {
                        'Authorization': "Token 28957212399c77c3f33a137d6e99c0564050e002",
                        'Content-type':'application/json',
                        'X-CSRFToken': thisKeyword._getCSRFToken(),
                    }
                })
                .then(response => response.json())
                .then(data => {
                    modalWindowUpdate.getElementsByTagName("input")[0].value = data.description
                    modalWindowUpdate.getElementsByTagName("input")[1].value = data.location
                    modalWindowUpdate.getElementsByTagName("input")[2].value = data.details
                    modalWindowUpdate.getElementsByTagName("select")[0].value = data.status
                    modalWindowUpdate.getElementsByTagName("select")[1].value = data.importance
                })

                document.querySelector(".prompt_message_buttons_update").addEventListener("click", function(e){
                    e.preventDefault();
                    if((e.target.closest("button") && (e.target.getAttribute("value")==="yes"))) {
                        const form = e.target.closest("div.modal__update").querySelector("form");
                        const formData = new FormData(form)
                        const submitedData = {};
                        for(var pair of formData.entries()) {
                            if(pair[1]!="") submitedData[pair[0]]=pair[1]; 
                           }
                        resolve([taskID, submitedData])
                    }
                    modalWindowUpdate.classList.add("display__none")
                    modalWindowUpdate.getElementsByTagName("p")[0].textContent =""
                }.bind(e))
            })
        }

        if (availableTasks.includes(e.target.getAttribute("data-action"))){
            const action = e.target.getAttribute("data-action")
            if(action==="DELETE")deletePromise(taskID,action).then(array => this._deleteTaskEvHandler(array, actionContainer))
            if(action==="POSTPONE")postponePromise(taskID,action,e,this).then(array => this._updateTaskEvHandler(array, actionContainer))
            if(action==="COMPLETED")completedPromise(taskID,action,e).then(array => this._updateTaskEvHandler(array, actionContainer))
            if(action==="UPDATE")updatePromise(taskID,action,e,this).then(array => this._updateTaskEvHandler(array, actionContainer))
        }

    }

    // SUB-COMPONENT  function used for deleting tasks.Parameters : an array with task id, and http method ["DELETE"]
    _deleteTaskEvHandler([taskID,action],actionContainer){
        fetch(`http://127.0.0.1:8000/api/task/${taskID}/`,{
            method: `${action}`,
            headers: {
                'Authorization': `Token ${this.#user.token}`,
                'Content-type':'application/json',
                'X-CSRFToken': this._getCSRFToken(),
            }
        })
        .then(response => response.json())
        .then(data=>this._fetchData(actionContainer))
    }

    _updateTaskEvHandler([taskID,object],actionContainer){
        
        fetch(`http://127.0.0.1:8000/api/task/${taskID}/`,{
            method: "PUT",
            headers: {
                'Authorization': `Token ${this.#user.token}`,
                'Content-type':'application/json',
                'X-CSRFToken': this._getCSRFToken(),
            },
            body :JSON.stringify(object)
        })
        .then(response => response.json())
        .then(data=>this._fetchData(actionContainer))
    }


    _promptMessage(message){
        let answer={};
        modalWindow.classList.remove("display__none")
        modalWindow.firstChild.innerHTML = message;
        document.querySelector(".prompt_message_buttons").addEventListener("click", function(e){
            e.preventDefault();
            if(e.target.closest("button")) this[e.target.getAttribute("name")]=e.target.getAttribute("value")
            modalWindow.classList.add("display__none")
        }.bind(answer))
        return answer
    }


    // SUB-COMPONENT  function used to fecth an API for login the user
    _submitLoginEvHandler(){

        const form = document.getElementById("login__form");
        const formData = new FormData(form);
        const submitedData = {};
        for(var pair of formData.entries()) {
            submitedData[pair[0]]=pair[1]; 
           }


        fetch("http://127.0.0.1:8000/api/login/", {
            method: 'POST',
            headers:{
             'Content-type':'application/json',
             'X-CSRFToken': this._getCSRFToken(),
        },
            body :JSON.stringify(submitedData)
        })
        .then(response =>{
            if(!response.ok) throw response;
            this._emptyFormValues(form);
            return response.json();
        }) 
        .then(data =>{
            this.#user =data;
            this._afterLogin(this.#user);
        })
        
        .catch(err =>{
            try{
                err.json()
                .then(body =>this._displayFormMessage(body,form,"ERROR"))
            }
            catch(e){
                console.log("Something went wrong with parsing")
            }
        })
    }



    // SUB-COMPONENT  function used to fecth an API for registering a new user
    _submitRegisterEvHandler(){
        const form = document.getElementById("register__form");

        const formData = new FormData(form)
        const submitedData = {};
        for(var pair of formData.entries()) {
            submitedData[pair[0]]=pair[1]; 
           }
        
           fetch("http://127.0.0.1:8000/api/register/", {
            method: 'POST',
            headers:{
             'Content-type':'application/json',
             'X-CSRFToken': this._getCSRFToken(),
        },
            body :JSON.stringify(submitedData)
        })
        .then(response =>{
            if(!response.ok) throw response;
            this._emptyFormValues(form);
            this._displayFormMessage({"message":["Account successfully created. You can log in now"]}, form, "SUCCES")
        }) 
        .catch(err =>{
            try{
                err.json()
                .then(body =>this._displayFormMessage(body,form,"ERROR"))
            }
            catch(e){
                console.log("Something went wrong with parsing")
            }
        })


    }

    // SUB-COMPONENT  function used to fetch API for a POST request with a new task to be added.
    _submitTaskEvHandler(){
       
        let form = document.querySelector(".form__add__task");

        const formData  = new FormData(form);
        const submitedData ={};
        this._deleteFormMessage(form)
 
        for(var pair of formData.entries()) {
            console.log(pair[0],pair[1])
            if(pair[0]==="deadline_time" && pair[1]=="") continue;
            submitedData[pair[0]]=pair[1]; 
           }
     
       
        fetch("http://127.0.0.1:8000/api/task/", {
            method: 'POST',
            headers:{
                'Authorization': `Token ${this.#user.token}`,
                'Content-type':'application/json',
                'X-CSRFToken': this._getCSRFToken(),
        },
            body :JSON.stringify(submitedData)
        })
         .then(response =>{
            if(!response.ok) throw response;
            this._displayFormMessage({"message":["Task successfully added."]},form ,"SUCCES");
            this._emptyFormValues(form);
        }) 
         .catch(err =>{
            try{
                err.json()
                .then(body =>this._displayFormMessage(body,form,"ERROR"))
            }
            catch(e){
                console.log("Something went wrong with parsing")
            }
        })
    }


    // SUB-COMPONENT  fuction used to display form messages. Parameters : API message object , form element where to display messages, messages type ERROR / SUCCES
    _displayFormMessage(objectMessage, targetForm, messageType="SUCCES"){
        const messages = Object.values(objectMessage)
        const formMessagePosition = targetForm.querySelector(".form__message__container")
        messages.forEach(value =>{
            let messageElement = document.createElement("p");
            if(messageType==="ERROR"){
                messageElement.classList.add("form__errors");
                messageElement.innerHTML = `<i class="fas fa-exclamation-circle mg__rt05"></i>${value[0]}`
            }else{
                messageElement.classList.add("form__success");
                messageElement.innerHTML = `<i class="fas fa-check mg__rt05 completed"></i>${value[0]}`
            }    
            formMessagePosition.insertAdjacentElement("afterbegin",messageElement);
        })
    }

    // SUB-COMPONENT  fuction used to remove any form messages. Parameters : form element from where to remove messages
    _deleteFormMessage(targetForm){
        const messageContainer = targetForm.querySelector(".form__message__container");
        while(messageContainer.firstChild){
            messageContainer.removeChild(messageContainer.firstChild);
        }
       
    }

    // SUB-COMPONENT  fuction used to clear all content from any form input. Parameters: form element from where to clear inputs
    _emptyFormValues(targetForm){
        targetForm.querySelectorAll("input").forEach(element => element.value="")
    }

    // SUB-COMPONENT  function used to empty tables. Parameters: table id from where to empty all TD elements
    _emptyTableElements(targetTableId){
        const tableTbody = document.getElementById(targetTableId).querySelector("tbody")
        while (tableTbody.firstChild){
            tableTbody.removeChild(tableTbody.firstChild)
        }
    }

    // SUB-COMPONENT  this function show/remove user details. Parameters : picure url, username, action Peformed LOGIN / LOGUT
    _renderUserDetails(pictureUrl=undefined, username=undefined, actionPerformed){
        if(actionPerformed==="login"){
            const html = `
            <div class="user__container">
                <img class="user__picture" src="${pictureUrl}">
                <p class="mg__lt10 " style="font-size: 16px;font-weight:600;color:white" class="font_esm"> Hello ${username}</p>  
            </div>
            `
            infoContainer.insertAdjacentHTML("afterbegin", html);
        }else{
            infoContainer.children[0].remove();
        }

      
    }

    // SUB-COMPONENT this function show/hiddes menu sidebar elements. Paramaters : "login" (action to do after login) / "logout" (action to do after logout)
    _showHideMenuElements(actionPerformed){
        menuSidebarList.querySelectorAll("li").forEach(element =>{
            if (actionPerformed==="login"){
                if(element.children[0].getAttribute("data-name")==="login") element.classList.toggle("display__none")
                else element.classList.toggle("display__none")
            }
           
            if (actionPerformed==="logout"){
                if(element.children[0].getAttribute("data-name")==="logout") element.classList.toggle("display__none")
                else element.classList.toggle("display__none")
            }
        })
    }




    // COMPONENT  events to handle for when an user logs in. Paramaters : None
    _afterLogin(userObject){    
        this._showHideMenuElements("login");
        this._renderUserDetails(userObject.picture, userObject.username, "login");
        this._showActionContainer("task");

    }

    // COMPONENT  events to handle for when an user logs out. Paramaters : None
    _afterLogOut(){
        this._showHideMenuElements("logout");
        this._renderUserDetails("logout");
        this.#user = undefined;
        this._showActionContainer("login_register");

    }


    // 

    // COMPONENT   adding event listeners for menu sidebar
    _addEventListeners(){
        const menuSidebar = document.querySelector(".menu_sidebar");
        menuSidebar.addEventListener("click", function(e){
            e.preventDefault();
            const menuItem =e.target.closest("a");
            if(!menuItem) return;
            const data_name=menuItem.getAttribute("data-name");
            if(data_name==="task") {
                this._showActionContainer("task")
                this._fetchData("task")
                };
            if(data_name==="add_task") {
                this._showActionContainer("add_task")
            }
            if(data_name==="login") {
                this._showActionContainer("login_register")
            }
            if(data_name==="today_task") {
                this._showActionContainer("today_task")
                this._fetchData("today_task")
            }
            if(data_name==="week_task") {
                this._showActionContainer("week_task")
                this._fetchData("week_task")
            }
            if(data_name==="all_task") {
                this._showActionContainer("task")
            }
            
            if(data_name==="logout") this._afterLogOut()
            

        }.bind(this))
    

        const addTaskform = document.querySelector(".form__add__task");
        addTaskform.addEventListener("submit", function(e){
            e.preventDefault();
            this._submitTaskEvHandler()
        }.bind(this))
        // try to move bind this inside call back function

        const tablesTheads=document.querySelectorAll("thead")
        tablesTheads.forEach(thead => thead.addEventListener("change",function(e){
            e.preventDefault();
            const thead =e.target.closest("thead")
            let filters= {}
            thead.querySelectorAll("select").forEach(select=> filters[select.name]=select.value)
            const actionContainer = e.target.closest("div.action__container").classList[1]
            this._tasksFilterBy(filters,actionContainer);
        }.bind(this)))          



        const registerForm = document.getElementById("register__form")
        registerForm.addEventListener("submit", function(e) {
            e.preventDefault()
            this._submitRegisterEvHandler()
        }.bind(this))
        
        const loginForm = document.getElementById("login__form")
        loginForm.addEventListener("submit", function(e) {
            e.preventDefault()
            this._submitLoginEvHandler()
        }.bind(this))

        const swipeLogRegBtn = document.getElementById("swipe_reg_login");
        const textLogReg = document.getElementById("text_reg_log");
        swipeLogRegBtn.addEventListener("click", function(e) {
            e.preventDefault();
            const textLogReg = document.getElementById("text_reg_log");
            if(e.target.classList.contains("register__position")){
                e.target.classList.remove("register__position");
                e.target.classList.add("login__position")
                textLogReg.innerHTML="Register"
            }
            else{
                e.target.classList.add("register__position");
                e.target.classList.remove("login__position");
                textLogReg.innerHTML="Login"
                }
            document.querySelector(".form__register__container").classList.toggle("display__none");
            document.querySelector(".form__login__container").classList.toggle("display__none");
        })

        tbodyElements.forEach(element =>element.addEventListener("click", this._clickOnTask.bind(this)))



    }


    // COMPONENT  Show/hide active action container. Receive 1 parameter from add event listener attr DATA-NAME
    _showActionContainer(visibleContainer){
        document.querySelectorAll(".action__container").forEach(elem=> {
            elem.classList.remove("display__on")
            elem.classList.add("display__off")})
        document.querySelector(`.${visibleContainer}`).classList.add("display__on")
    } 

}


const app = new App();




