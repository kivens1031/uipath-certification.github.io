import React, { Component } from 'react';
 
class Question extends Component{
    constructor(props) {
        super(props);
    }   
	
	getNumberOfCorrectOptions() {
		let correctCount = 0;
        let i = 0;
		for (i = 0; i < this.props.question.options.length; i++) {
           if (this.props.question.options[i].correct) {
			 correctCount++;
		   }
		}
		return correctCount;
	}
	
	
	getRadioOrCheckboxType() {
		if (this.getNumberOfCorrectOptions() > 1 ) {
			return "checkbox";
		}
		return "checkbox";
	}
	
	
	toggleOption(index) {
      try{
         var flag = this.props.question.options[index].selected;
         this.props.question.options[index].selected = !flag;
		 // doing this to re-render
         this.props.saveQuestionState(this.props.question);
      } catch(e){
         console.log(e);
      }
	}
	
	isAnsweredCorrectly() {
		let correctCount = 0;
        let i = 0;
		for (i = 0; i < this.props.question.options.length; i++) {
           if ( (this.props.question.options[i].correct) != (this.props.question.options[i].selected) ) {
			 return "false";
		   }
		}
		return "true";
	}
	
	isDisabled() {
		if (this.props.disabled==true) {
			return true;
		}
		else {
			return false;
		}
		
	}
	
	
	
    render(){
        return (

			<div class="card-body">

			   <h3 class="card-title" id="query"> 
				  {this.props.question.query} (Choose {this.getNumberOfCorrectOptions()}) {this.isAnsweredCorrectly()}
			   </h3>
			   
				{
					this.props.question.options.map((option, index)=>
					   <div class="form-check my-2" id={"outerOptionDiv" + index}>
						  <input class="form-check-input  option-radio" type={this.getRadioOrCheckboxType()} name="optionRadios" id={"option" + index} value={"option"  + index}
							 checked={this.props.question.options[index].selected} 
							 disabled={this.isDisabled()}
							 onClick={() => this.toggleOption(index)} 
						  ></input>
						  <label class="form-check-label" for={"option"  + index} id={"labelOption" + index}>
						  {this.props.question.options[index].text}
						  </label>
					   </div>
					)
				}
			 
			</div>
           
            
        )
    }
}
 
export default Question;