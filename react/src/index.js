import React, { createElement } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Timer from './Components/Timer';
import Question from './Components/Question';
import Modal from './Components/Modal';
import './Components/modal.css';
import Autosuggest from 'react-autosuggest';
import RpaExam from './Components/RpaExam';

var questionQueries = [];

 // https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
function escapeRegexCharacters(str) {
   return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
 }
 
 function getSuggestions(value) {
   const escapedValue = escapeRegexCharacters(value.trim());
   
   if (escapedValue === '') {
     return [];
   }
 
   const regex = new RegExp('^' + escapedValue, 'i');
   return questionQueries.filter(questionQuery => regex.test(questionQuery.name));
 }
 
 
 
 function renderSuggestion(suggestion) {
   return (
     <span>{suggestion.name}</span>
   );
 }

class Exam extends React.Component {
	
  constructor(props) {
   super(props);
   this.saveChosenOption = this.saveChosenOption.bind(this);
   this.getSuggestionValue = this.getSuggestionValue.bind(this);
   this.showModal = this.showModal.bind(this);
   this.hideModal = this.hideModal.bind(this);
	let jsonQuestions = require('./questions.json');
	let examQuestions = jsonQuestions.slice(this.props.start, this.props.end);
	let examHistory = this.getExamHistory();
    this.state = {
      graded: false,
	   start: this.props.start,
	   end: this.props.end,
	   history: examHistory,
	   questions: examQuestions,
	   currentQuestionNumber: 0,
	   currentQuestion: examQuestions[0],
      time:0,
      score:0,
      timerRunning: true,
      show: false,
      managedQuestion: "none",
      value: '',
      suggestions: []
    };

    setInterval(() => {
		this.state.time++;
		//console.log(this.state.time);
	}, 1000);

	console.log("Number of Questions: " + this.state.questions.length);
	console.log("Here is the history state: " + JSON.stringify(this.state.history));
   
  }
  
  

  onChange = (event, { newValue, method }) => {
   this.setState({
     value: newValue
   });
 };
 
 onSuggestionsFetchRequested = ({ value }) => {
   this.setState({
     suggestions: getSuggestions(value)
   });
 };

 onSuggestionsClearRequested = () => {
   this.setState({
     suggestions: []
   });
 };

   showModal (){
   this.setState({ show: true });
   };

   hideModal (){
   this.setState({ show: false });
   };

	nextQuestion() {
		let currentIndex = this.state.currentQuestionNumber;
		this.setState({currentQuestionNumber: currentIndex + 1});
		this.setState({currentQuestion: this.state.questions[currentIndex + 1]});
      let eachQuestion=this.state.questions[currentIndex].options;
      this.setState({time:0})
      this.gradeQuestion();
      this.handleCheckOptions();
      this.updateTimeSpent();
         
	}

   handleCheckOptions(){
      if(this.state.currentQuestion.options[0].selected){
         document.getElementById("option0").checked = true;
      }else{
         document.getElementById("option0").checked = false;
      }
      
      if(this.state.currentQuestion.options[1].selected){
         document.getElementById("option1").checked = true;
      }else{
         document.getElementById("option1").checked = false;
      }
      
      if(this.state.currentQuestion.options[2].selected){
         document.getElementById("option2").checked = true;
      }else{
         document.getElementById("option2").checked = false;
      }

      if(this.state.currentQuestion.options[3].selected){
         document.getElementById("option3").checked = true;
      }else{
         document.getElementById("option3").checked = false;
      }
  }

   setQuestion(position) {
		this.setState({currentQuestionNumber: position});
		this.setState({currentQuestion: this.state.questions[position]});
	}
	
	previousQuestion() {
		let currentIndex = this.state.currentQuestionNumber;
		this.setState({currentQuestionNumber: currentIndex - 1});
		this.setState({currentQuestion: this.state.questions[currentIndex-1]});
      this.setState({time:0});
      this.gradeQuestion();
     
	}
	
	getQuestion(questionNumber) {
		this.setState({currentQuestionNumber: questionNumber});
		this.setState({currentQuestion: this.state.questions[questionNumber]});
	}
	
	gradeTheExam(score) {
		let examHistory = this.getExamHistory();
		examHistory.exams.push(this.state.questions);
		this.setState({history: examHistory})
		localStorage.setItem('examHistory', JSON.stringify(examHistory));
      let finalScore=0;
      this.gradeQuestion();
      this.updateTimeSpent();
      this.setState({graded: true}, () =>{
         //disable buttons and options
         document.getElementById("next").setAttribute("class", "disabled btn btn-primary");
         document.getElementById("previous").setAttribute("class", "disabled btn btn-primary");
         document.getElementById("finish").setAttribute("class", "disabled btn btn-primary");
         document.getElementById("option0").setAttribute("disabled", "");
         document.getElementById("option1").setAttribute("disabled", "");
         document.getElementById("option2").setAttribute("disabled", "");
         document.getElementById("option3").setAttribute("disabled", "");
      });
   
  
         for(var que=0;que<examHistory.exams[((examHistory.exams.length)-1)].length;que++){
            //console.log( "Que Number "+que+"Marked "+examHistory.exams[examcount][que].marked);
            finalScore=finalScore+examHistory.exams[(examHistory.exams.length-1)][que].marked;
         }
      
      
      this.stoptimer();
      this.showModal(); //Score display
      this.setState({score:finalScore});

		return finalScore;
	}
	
	getExamHistory() {
      try{
         let object = localStorage.getItem('examHistory');
         let examHistory = "";
         
         if (object == null) {
            examHistory = {name:"Exam History"};
            let exams = [];
            examHistory.exams = exams;
            localStorage.setItem('examHistory', JSON.stringify(examHistory));
            this.setState({history: examHistory})
         } else {
            examHistory = JSON.parse(object);
         }
         return examHistory;
      }catch(e){
         console.log(e);
      }
		
	}
	
	getCorrectCount() {
		return "999";
	}

   initializeQuestions(){
      questionQueries=[];
      for(var i = 0; i<this.state.questions.length; i++){
         var sample = {"name":"", "id":""};
         sample.name=this.state.questions[i].query;
         sample.id=i;
         questionQueries.push(sample);
      }
   }

   getSuggestionValue(suggestion) {
      document.getElementById("manageQuestionsButton").click();
      document.getElementById("managedQuestion").value=suggestion.id;
      this.state.managedQuestion = suggestion.id;
      this.setFieldsForManagedQuestions()
      return suggestion.name;
    }
   

  componentDidMount() {
   try {
      this.handleButtons()
      this.createJumperButtons();
      var fiveMinutes = 60 * 5,
      display = "timer";
      this.startTimer(fiveMinutes-1, display);
      if(this.state.time!==0){
         this.resetTimer();
      }
      this.initializeQuestions();
   } catch (error) {
      console.log(error);
   } 
   
  }

  componentDidUpdate(){
     this.handleButtons();
     this.createJumperButtons(); 
     if(this.state.timerRunning){
      document.getElementById("option0cheat").innerHTML = "";
      document.getElementById("option1cheat").innerHTML = "";
      document.getElementById("option2cheat").innerHTML = "";
      document.getElementById("option3cheat").innerHTML = "";
     }
     else{
      document.getElementById("option0").setAttribute("disabled", "");
      document.getElementById("option1").setAttribute("disabled", "");
      document.getElementById("option2").setAttribute("disabled", "");
      document.getElementById("option3").setAttribute("disabled", "");
      document.getElementById("option0cheat").innerHTML = "";
      document.getElementById("option1cheat").innerHTML = "";
      document.getElementById("option2cheat").innerHTML = "";
      document.getElementById("option3cheat").innerHTML = "";  
      document.getElementById("cheatButton").click();
    }
      this.handleCheckOptions();
  }

  resetTimer(){
   this.setState({time:0});
  }

  gradeQuestion(){
   let currentIndex = this.state.currentQuestionNumber;
   let score= this.state.score;
   var correctCount=0;
   let eachQuestion=this.state.questions[currentIndex].options;
   for(var i=0;i<eachQuestion.length;i++){
      console.log(this.state.questions[currentIndex].options[i].correct)
      if(this.state.questions[currentIndex].options[i].selected===this.state.questions[currentIndex].options[i].correct ){
         correctCount=correctCount+1;
         continue;	
      }
      else{
         break;
      }	
   }
   if(this.state.questions[currentIndex].marked===0 && correctCount===eachQuestion.length){
    //  console.log('CORRECT ANSWER');
      this.state.questions[currentIndex].marked=1;
   }
   else if(this.state.questions[currentIndex].marked===1 && score!==0 && correctCount!==eachQuestion.length){
      this.state.questions[currentIndex].marked=0;
      //console.log('WRONG ANSWER');
   }
   
  }
  updateTimeSpent(){
   let currentIndex = this.state.currentQuestionNumber;
   this.state.questions[currentIndex].timespent=this.state.questions[currentIndex].timespent+this.state.time;
  }
  createJumperButtons(){
   document.getElementById("questionJumper").innerHTML = "";
   var questionsLength = this.state.questions.length;
     for(var i = 0; i < questionsLength; i++){
         var button = document.createElement("button");
         button.appendChild(document.createTextNode(i+1));
         button.setAttribute("id", "btn"+i);
         button.setAttribute("type", "button");
         button.setAttribute("class", "btn btn-secondary btn-sm");
         if(i == this.state.currentQuestionNumber){
            button.setAttribute("class", "btn btn-primary btn-sm");
         }
         document.getElementById("questionJumper").appendChild(button);
         document.getElementById("questionJumper").appendChild(document.createTextNode("\u00A0"));//nbsp
     }

     for(let x = 0; x < questionsLength; x++){
         var elem = document.getElementById("btn"+x);
         elem.addEventListener("click", () => { this.clickJumperButton(x); });
     }
  }

  clickJumperButton(x){
   this.gradeQuestion();
   this.updateTimeSpent();
   this.setState({time:0});
   this.setQuestion(x);
  
  }

  stoptimer(){
   this.setState({timerRunning: false});
   document.getElementById("timer").innerHTML = "Done Submission";
  }

  startTimer(duration, display){
      var timer = duration, minutes, seconds;
      var self = this;
      setInterval(function () {
         if(self.state.timerRunning){
         minutes = parseInt(timer / 60, 10);
         seconds = parseInt(timer % 60, 10);
         
         minutes = minutes < 10 ? "0" + minutes : minutes;
         seconds = seconds < 10 ? "0" + seconds : seconds;

         
         if(minutes === "00" && seconds === "00"){
            document.getElementById("finish").click();
         }else{
            try{
               document.getElementById(display).innerHTML = minutes + ":" + seconds;
            }catch(e){
               
            }
            
         }

         if (--timer < 0) {
            document.getElementById(display).innerHTML = "00:00";
            document.getElementById("next").setAttribute("class", "disabled btn btn-primary");
            document.getElementById("previous").setAttribute("class", "disabled btn btn-primary");
            document.getElementById("finish").setAttribute("class", "disabled btn btn-primary");
            clearInterval();
            //timer = duration;
         }
        }
      }, 1000);
   }

  handleButtons(){
    if(this.state.currentQuestionNumber === this.state.questions.length-1){
      document.getElementById("next").setAttribute("class", "disabled btn btn-primary");
    }else{
      document.getElementById("next").setAttribute("class", "enabled btn btn-primary");
    }
    if(this.state.currentQuestionNumber > 0){
      document.getElementById("previous").setAttribute("class", "enabled btn btn-primary");
    }
    try{
      if(this.state.currentQuestionNumber === 0){
        document.getElementById("previous").setAttribute("class", "disabled btn btn-primary");
      }
    }catch(e){
      console.log(e);
    }
    
  }

	clearLocalStorage() {
		localStorage.clear('examHistory');
		this.setState({history: this.getExamHistory()});
      document.getElementById("formatToTable").setAttribute("class", "enabled btn btn-primary");
      document.getElementById("formatToCode").setAttribute("class", "disabled btn btn-primary");
	}

   formatToCode() {
      document.getElementById("formatToTable").setAttribute("class", "enabled btn btn-primary");
      document.getElementById("formatToCode").setAttribute("class", "disabled btn btn-primary");
      document.getElementById("examHistory").innerHTML = JSON.stringify(this.state.history, "", "\t");
   }

   formatToTable() {
      var scores = [];
      var items = [];
      document.getElementById("formatToTable").setAttribute("class", "disabled btn btn-primary");
      document.getElementById("formatToCode").setAttribute("class", "enabled btn btn-primary");
      var examHistory = this.getExamHistory();
      
         document.getElementById("examHistory").innerHTML = "";
         var table = document.createElement("table");
         table.setAttribute("id", "tablestyle");
         var tr = document.createElement("tr");
         var headers = ["Exam number", "Question", "Options Given", "Correct Options", "Selected Options"];
         for (var i = 0; i < headers.length; i++) {
            var th = document.createElement("th");
            th.appendChild(document.createTextNode(headers[i]));
            tr.appendChild(th);
         }
         table.appendChild(tr);

         if(examHistory.exams.length < 1){
            tr = document.createElement("tr");
            td = document.createElement("td");
            td.setAttribute("colspan", "5");
            td.setAttribute("style", "text-align: center");
            td.appendChild(document.createTextNode("**Nothing to show**"));
            tr.appendChild(td);
            table.appendChild(tr); 
         }
         for (var counter = 0; counter < examHistory.exams.length; counter++) { //per exam
            var score = 0;
            tr = document.createElement("tr");
            var td = document.createElement("td"); //Start of Exam Number
            td.appendChild(document.createTextNode("Exam History: " + (counter + 1))); 
            var p = document.createElement("p");

            var span = document.createElement("span");
            span.setAttribute("id", "examHistoryScore"+(counter+1));
            p.appendChild(span);
            td.appendChild(p);
            tr.appendChild(td);
            // td = document.createElement("td");
            // td.setAttribute("id", "examHistoryScore"+(counter+1));
            // tr.appendChild(td);
            table.appendChild(tr);//End of Exam Number
            for (var q = 0; q < examHistory.exams[counter].length; q++) { //per question
               var question = examHistory.exams[counter][q].query;
               var correctOptions = [];
               var selectedOptions = [];
               var optionsGiven = [];
               var options = examHistory.exams[counter][q].options;
               var isCorrect = true;
               console.log(JSON.stringify(question));
               for (var opt = 0; opt < options.length; opt++) { //selected and correct options gathering
                  if (examHistory.exams[counter][q].options[opt].correct) {
                     correctOptions.push(examHistory.exams[counter][q].options[opt].text);
                  }
                  if (examHistory.exams[counter][q].options[opt].selected) {
                     selectedOptions.push(examHistory.exams[counter][q].options[opt].text);
                  }
                  optionsGiven.push(examHistory.exams[counter][q].options[opt].text);
               }
   
               tr = document.createElement("tr");
               tr.appendChild(document.createElement("td")); //for blank td
               
               td = document.createElement("td");
               td.appendChild(document.createTextNode(question));
               tr.appendChild(td);
   
               td = document.createElement("td");
               var p = document.createElement("p");
               p.appendChild(document.createTextNode("Given Options:"));
               td.appendChild(p);
               var ul = document.createElement("ul");
               for (opt = 0; opt < optionsGiven.length; opt++) {
                  var li = document.createElement("li");
                  li.setAttribute("style", "margin-left: 40px");
                  li.appendChild(document.createTextNode(optionsGiven[opt]));
                  td.appendChild(li);
               }
               tr.appendChild(td);
   
               td = document.createElement("td");
               p = document.createElement("p");
               p.appendChild(document.createTextNode("Correct Options:"));
               td.appendChild(p);
               for (opt = 0; opt < correctOptions.length; opt++) {
                  var li = document.createElement("li");
                  li.setAttribute("style", "margin-left: 40px");
                  li.appendChild(document.createTextNode(correctOptions[opt]));
                  td.appendChild(li);
               }
               tr.appendChild(td);
   
               td = document.createElement("td");
               p = document.createElement("p");
               p.appendChild(document.createTextNode("Selected Options:"));
               td.appendChild(p);
               for (opt = 0; opt < selectedOptions.length; opt++) {
                  var li = document.createElement("li");
                  li.setAttribute("style", "margin-left: 40px");
                  li.appendChild(document.createTextNode(selectedOptions[opt]));
                  td.appendChild(li);
               }
               tr.appendChild(td);
   
               console.log("-------correct: " + correctOptions.toString());
               console.log("-------selected: " + selectedOptions.toString());
   
               if (selectedOptions.length < 1) { //check if the user answered the question
                  isCorrect = false;
               } else {
                  for (i = 0; i < selectedOptions.length; i++) { //decision if the answer is correct
                     var selected = selectedOptions[i];
                     if (!correctOptions.includes(selected)) {
                        isCorrect = false;
                     }
                  }
               }
   
               if (isCorrect) {
                  console.log("-------You are correct");
                  tr.setAttribute("style", "background-color:#ccffcc");
                  score++;
               } else {
                  tr.setAttribute("style", "background-color:#ff6666");
                  console.log("-------You are wrong");
               }
   
               table.appendChild(tr);
               // document.getElementById("examHistoryScore1").appendChild(document.createTextNode("yey"));
            }
            scores.push(score);
            items.push(examHistory.exams[counter].length);
   
         }
         document.getElementById("examHistory").appendChild(document.createElement("br"));
         document.getElementById("examHistory").appendChild(table);
         
         console.log(scores.toString());
         for(var i = 1; i < scores.length+1; i++){
            //alert("examHistoryScore"+i);
            document.getElementById("examHistoryScore"+i).innerHTML = "Score: (" + scores[i-1] + "/" + items[i-1] + ")";
         }
      
   }
	
	toggleOption(index, currentQuestion, questions, currentQuestionNumber) {
      try{
         
         var question = currentQuestion;
         var examQuestions = questions;
         var flag = question.options[index].selected;
         question.options[index].selected = !flag;		
         examQuestions[currentQuestionNumber] = question;
         this.saveChosenOption(question, examQuestions);
      } catch(e){
         console.log(e);
      }
	}

   saveChosenOption(question, examQuestions){
      this.setState({currentQuestion: question});
      this.setState({questions: examQuestions});
   }

   cheat(){
      var currentQuestion = this.state.currentQuestion;
      var correctIndices = [];
      var wrongIndeces = [];
      for(var i = 0; i<currentQuestion.options.length; i++){
         if(currentQuestion.options[i].correct){
            correctIndices.push(i);
         }
         if(!currentQuestion.options[i].correct && currentQuestion.options[i].selected){
            wrongIndeces.push(i);
         }
      }
      for(i = 0; i<correctIndices.length; i++){
         // correct logo = https://w7.pngwing.com/pngs/715/577/png-transparent-green-correct-sign-correct-green-tick-thumbnail.png
         // wrong logo = https://cdn.pixabay.com/photo/2012/04/24/11/23/cross-39414_1280.png
         var logo = document.createElement("img");
         logo.src = "https://i.pinimg.com/originals/70/85/48/7085480c49d120138a363de1a21614c0.jpg";
         logo.setAttribute("style", "width: 40px; padding: 5px;");
         document.getElementById("option"+correctIndices[i]+"cheat").innerHTML = "";
         document.getElementById("option"+correctIndices[i]+"cheat").appendChild(logo);
      }
      if(!this.state.timerRunning){
         for(i = 0; i<wrongIndeces.length; i++){
            // correct logo = https://w7.pngwing.com/pngs/715/577/png-transparent-green-correct-sign-correct-green-tick-thumbnail.png
            // wrong logo = https://cdn.pixabay.com/photo/2012/04/24/11/23/cross-39414_1280.png
            var logo = document.createElement("img");
            logo.src = "https://cdn.pixabay.com/photo/2012/04/24/11/23/cross-39414_1280.png";
            logo.setAttribute("style", "width: 30px; padding: 5px;");
            document.getElementById("option"+wrongIndeces[i]+"cheat").innerHTML = "";
            document.getElementById("option"+wrongIndeces[i]+"cheat").appendChild(logo);
         }
      }
   }

   normalInputWithLabel(form, labelText, inputId){
      var div = document.createElement("div");
      div.setAttribute("class", "form-group row");
      var label = document.createElement("label");
      label.setAttribute("class", "control-label col-sm-2");
      label.innerHTML = labelText;
      div.appendChild(label);
      var div2 = document.createElement("div");
      div2.setAttribute("class", "col-sm-6");
      var input = document.createElement("input");
      input.setAttribute("type", "text");
      input.setAttribute("id", inputId);
      input.setAttribute("value", "");
      input.setAttribute("class", "form-control");
      div2.appendChild(input);
      div.appendChild(div2);
      form.appendChild(div);
      form.appendChild(document.createElement("br"));
   }

   optionWithLabelAndCheckbox(form, labelText, index){
      var table = document.createElement("table");
       table.setAttribute("style", "width: 50%");
         var tr = document.createElement("tr");
         
         //checkbox
         var td = document.createElement("td");
         var checkbox = document.createElement("input");
         checkbox.setAttribute("type", "checkbox");
         checkbox.setAttribute("class", "form-check-input");
         checkbox.setAttribute("id", "option"+index+"checkbox");
         td.appendChild(checkbox); 
         tr.appendChild(td);

         //label
         td = document.createElement("td");
         var label = document.createElement("label");
         label.setAttribute("class", "control-label col-sm-6");
         label.innerHTML = labelText;
         td.appendChild(label); 
         tr.appendChild(td);

         //input
         td = document.createElement("td");
         var input = document.createElement("input");
         input.setAttribute("type", "text");
         input.setAttribute("id", "option"+index+"input");
         input.setAttribute("value", "");
         input.setAttribute("class", "form-control");
         td.appendChild(input); 
         tr.appendChild(td);
         table.append(tr);


      form.appendChild(table);
   }

   searchBar(){
      document.getElementById("managequestions").innerHTML = "";
      var form = document.createElement("div");

         
         //Select
         var label = document.createElement("label");
         label.innerHTML = "Target Question: ";
         form.appendChild(label);
         var select = document.createElement("select");
         select.setAttribute("id", "managedQuestion");
         select.setAttribute("class", "form-select form-select-sm");
         select.setAttribute("aria-label", ".form-select-sm example");
            var option = document.createElement("option");
               option.setAttribute("value", "new");
               option.innerHTML = "New entry";
            this.state.managedQuestion = "new";
            select.appendChild(option);
            var questions = this.state.questions;
            for(var i = 0; i<questions.length; i++){
               option = document.createElement("option");
                  option.setAttribute("value", i);
                  option.innerHTML = questions[i].query;
               select.appendChild(option);
            }
         select.addEventListener("change", () => { this.state.managedQuestion = document.getElementById("managedQuestion").value; 
            this.setFieldsForManagedQuestions();
         });
         form.appendChild(select);
         form.appendChild(document.createElement("br"));
         
         //Query
         this.normalInputWithLabel(form, "Query: ", "querymanaged");

         //Answer
         this.normalInputWithLabel(form, "Answer: ", "answer");

         //Difficulty
         this.normalInputWithLabel(form, "Difficulty: ", "difficulty");
         
         //Options
         label = document.createElement("label");
         label.innerHTML = "Options: ";
         form.appendChild(label);
         form.appendChild(document.createElement("br"));
         
         for(var i = 0; i<4; i++){
            this.optionWithLabelAndCheckbox(form, "Option "+(i+1)+": " , i);
         }

         
         var button = document.createElement("button");
         button.appendChild(document.createTextNode("Submit"));
         button.setAttribute("class","btn btn-primary");
         button.addEventListener("click", () => { this.submitManagedQuestion(); });
         form.appendChild(button);

      document.getElementById("managequestions").appendChild(form);
   }

   setFieldsForManagedQuestions(){
      var index = this.state.managedQuestion;
      if(!isNaN(index)){//is numerical
         var targetQuestions = this.state.questions[index];
         document.getElementById("querymanaged").value = targetQuestions.query;
         document.getElementById("answer").value = targetQuestions.answer;
         if(targetQuestions.difficulty == undefined){
            document.getElementById("difficulty").value = "";
         }else{
            document.getElementById("difficulty").value = targetQuestions.difficulty;
         }
         var options = targetQuestions.options;
         for(var i = 0; i<options.length; i++){
            document.getElementById("option"+i+"input").value = options[i].text;
            if(options[i].correct){
               document.getElementById("option"+i+"checkbox").checked = true;
            }else{
               document.getElementById("option"+i+"checkbox").checked = false;
            }
         }
      }else{
         document.getElementById("querymanaged").value = "";
         document.getElementById("answer").value = "";
         document.getElementById("difficulty").value = "";
         for(var i = 0; i<10 ; i++){
            try {
               document.getElementById("option"+i+"input").value = "";
               document.getElementById("option"+i+"checkbox").checked = false;
            } catch (e) {
               break;
            }
         }
      }
   }

   submitManagedQuestion(){
      var targetQuestions = "";
      if(!isNaN(index)){//is numerical = edit
         targetQuestions = this.state.questions[this.state.managedQuestion];
      }else{
         targetQuestions = JSON.stringify(this.state.questions[0]);
         targetQuestions = JSON.parse(targetQuestions);
      }

     
      targetQuestions.query = document.getElementById("querymanaged").value;
      targetQuestions.answer = document.getElementById("answer").value;
      targetQuestions.difficulty = document.getElementById("difficulty").value;
      var index = this.state.managedQuestion;
      for(var i = 0; i < 10; i++){
         try {
            targetQuestions.options[i].text = document.getElementById("option"+i+"input").value;
            if(document.getElementById("option"+i+"checkbox").checked){
               targetQuestions.options[i].correct = true;
            }else{
               targetQuestions.options[i].correct = false;
            }
         } catch (e) {
            break;
         }
      }

      if(!isNaN(index)){//is numerical = edit
         alert("Edit " + JSON.stringify(targetQuestions));
         document.getElementById("managequestions").innerHTML = "";
         this.state.questions[this.state.managedQuestion] = targetQuestions;
         //function call will be here
      }else{
         targetQuestions.id = "new";
         alert("Add " + JSON.stringify(targetQuestions));
         document.getElementById("managequestions").innerHTML = "";
         //function call will be here
      }
      
   }
  
  render() { 
   const { value, suggestions } = this.state;
   const inputProps = {
     placeholder: "Search specific question here",
     value,
     onChange: this.onChange
   };
    return (
       

<div class="container">
<div class="card">
   <div class="card-header" id="questionNumber">
      Question {this.state.currentQuestionNumber + 1}
   </div>
   <div class="card-body">
      <Question saveChosenOption = {this.saveChosenOption} question={this.state.currentQuestion} toggleOption={this.toggleOption} questions={this.state.questions} currentNumber={this.state.currentQuestionNumber}/>
      <div>
         <p class="card-text mt-3">
            <a id="previous" class="disabled btn btn-primary"
               onClick={() => this.previousQuestion()}
            >&lt;&lt; Previous</a>&nbsp;
            <a id="next" class="disabled btn btn-primary" 
               onClick={() => this.nextQuestion()}
            >Next &gt;&gt;</a> &nbsp;
            <a id="finish" class="btn btn-primary"
               onClick={() => this.gradeTheExam()}
            >Finish</a>&nbsp;
            {/* <Timer /> */}
            <Modal show={this.state.show} handleClose={this.hideModal}>
               <p>You Scored {this.state.score} points</p>
            </Modal>

         </p>
         <div></div>
      </div>
   </div>
</div>
<div class="card mt-2">
   <div class="card-header" id="questionJumperTitle">
      Question Jumper
   </div>
   <div class="card-body">
      <h3 class="card-title" id="questionJumperCardTitle">Navigation</h3>
      <p class="card-text"></p>
      <div id="questionJumper"></div>
   </div>
</div>
<div class="card mt-2">
   <div class="card-header">
      Click here to <a id="cheatButton" class="enabled btn-sm btn-primary" onClick={() => this.cheat()}>Cheat</a>&nbsp;
      <a class="enabled btn-sm btn-primary" id="manageQuestionsButton" onClick={() => this.searchBar()}>Manage questions</a>&nbsp;
   </div>
   <div class="card-body">
      <Autosuggest 
         suggestions={suggestions}
         onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
         onSuggestionsClearRequested={this.onSuggestionsClearRequested}
         getSuggestionValue={this.getSuggestionValue}
         renderSuggestion={renderSuggestion}
         inputProps={inputProps} />
        <div id="managequestions"></div>
   </div>
   
</div>
<div class="card mt-2">
   <div class="card-header" id="localStorageTitle">
      Local Storagee
   </div>
   <div class="card-body">
      <h3 class="card-title" id="localStorageCardTitle">What's in Storage?</h3>
      <p>Number of exams in your history: {this.state.history.exams.length} </p>
      <a id="clearls" class="btn btn-primary"
         onClick={() => this.clearLocalStorage()}
      >Clear Local Storage</a>&nbsp;
      <a id="formatToTable" class="enabled btn btn-primary"
         onClick={() => this.formatToTable()}
      >Format to Table</a>&nbsp;
      <a id="formatToCode" class="disabled btn btn-primary"
         onClick={() => this.formatToCode()}
      >Format to Code</a>
      <div>
         <pre id="examHistory" key={Math.random()}> { JSON.stringify(this.state.history, "", "\t") } </pre>
      </div>
      <p class="card-text">
      </p>
   </div>
</div>
</div>



    );
  }
}

ReactDOM.render(
  
   <RpaExam start="25" end="30"/>,
  
   // <Exam start="25" end="30"/>,
   document.getElementById('root')
 
);