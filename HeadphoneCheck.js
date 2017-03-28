(function(HeadphoneCheck, $, undefined) {

 	HeadphoneCheck.examplesPerPage = 3;
	HeadphoneCheck.debug = true;

	var totalCorrect = 0;
	var stimMap = [];
	var lastPage;

	//PRIVATE FUNCTIONS
	function updateCorrect(stim, response) {
		if (stim.correct == response) {
			totalCorrect++;
		}
	};

	//FUNCTIONS FOR INITIALIZING THE STIMULI AND SHUFFLING THE JSON FILE
 	function shuffleTrials(data) {
        stimMap = shuffle(data["stim"]); //shuffles the array 
    };

	function checkPassFail(correctThreshold) {
		if (totalCorrect >= correctThreshold) {
			return true;
		}
		else { return false; }
	};

	function stim_play(stimFile) {
		$('#' + stimFile).get(0).play();
	};

	function clickDisable(buttonID) {
        $('#' + buttonID).prop('disabled', true);
	};

	function shuffle(array) {
  		var currentIndex = array.length, temporaryValue, randomIndex ;

		  // While there remain elements to shuffle...
		  while (0 !== currentIndex) {

		    // Pick a remaining element...
		    randomIndex = Math.floor(Math.random() * currentIndex);
		    currentIndex -= 1;

		    // And swap it with the current element.
		    temporaryValue = array[currentIndex];
		    array[currentIndex] = array[randomIndex];
		    array[randomIndex] = temporaryValue;
		  }

		  return array;
		};
    
    //renderHTML takes in the stimulus ID and the stimulus file and creates a div element with everything needed to play and respond to this sound
    function renderOneTrialHTML(stimDiv, stimID, stimFile) {
    	var divID = "stim"+stimID
    	console.log(divID);
    	$('<div />', {id: divID}).appendTo(('#' + stimDiv));

    	//add in the audio source
    	
    	$('<audio />',{
    			id: 'audio' + stimID,
    			type: 'audio/mpeg',
    			src: stimFile
    		}).appendTo($('#' + divID));

		//add in the button for playing the sound
    	$('<button />', {
    		id: 'b' + stimID, 
    		disabled: false,
    		click: function () {
    			stim_play('audio' + stimID);
    			clickDisable(this.id);
    		},
    		text: 'Play'
    	}).appendTo($('#' + divID));

    	//add in the radio buttons for selecting which sound was softest
    	$('<div />', {
    			id: 'radioButtons'+stimID,
    			class: 'ui-buttonset-vertical',
    			width: '30%'
    			}).appendTo($('#' + divID));

    	//give the label info for the buttons
    	var radioButtonInfo = [{ "id": "1", "name": "FIRST sound was SOFTEST" }, { "id": "2", "name": "SECOND sound was SOFTEST" }, {"id": "3", "name": "THIRD sound was SOFTEST"}];

		$.each(radioButtonInfo, function() {
			$("#radioButtons" + stimID).append(
            	$('<input />', { 
                	type: 'radio', 
                	id: 'radio' + this.id,
                	name: 'radio-resp' + stimID,
                	value: this.id
                } ));
			$("#radioButtons" + stimID).append(
          		$('<label />', {
          			for: 'radio' + this.id,
          			class: 'radio-label',
            		text: this.name                            
        		}));

		});
	};


	//PUBLIC FUNCTIONS
	// Load the experiment configuration from the server
    HeadphoneCheck.loadExamples = function (jsonpath) {
        $.ajax({
            dataType: "json",
            url: jsonpath,
            async: false,
            success: function (data) { 
                if (HeadphoneCheck.debug) {
                    console.log("Got configuration data");
                }
                shuffleTrials(data);
                console.log(stimMap);
                lastPage = Math.ceil(stimMap.length/HeadphoneCheck.examplesPerPage); //get last page
            }
        });
    };

	HeadphoneCheck.renderHTMLPage = function(pageNum) {

		//get the stimuli to display on this page
		var curStimuli = [];
		for (i = 0; i < HeadphoneCheck.examplesPerPage; i++) {
			curStimuli.push(stimMap[pageNum*HeadphoneCheck.examplesPerPage + i])
		}
		console.log(curStimuli);

		$('<div />', {
			id: "instruct",
			class: "warning",
			html: "When you hit <b>Play</b>, you will hear three sounds separated by silences."
		}).appendTo($('#container-exp'));


		$('<div />', {
			class: "warning",
			text: "Simply judge WHICH SOUND WAS SOFTEST(quietest)-- 1, 2, or 3?"
		}).appendTo($('#container-exp'));

		$('<div />', {
			class: "warning",
			text: "Test sounds can only be played once!"
		}).appendTo($('#container-exp'));

		//add in a group for each item in stimulus
		$.each(curStimuli, function () {
			renderOneTrialHTML('container-exp', this.id, this.stimFile)
		})

		$('<div />', {
			class: "warning",
			type: "button",
			text: "Continue",
			click: function () {
				for (stimID = 0; stimID < HeadphoneCheck.examplesPerPage; stimID++) {
					updateCorrect(curStimuli[stimID], $('input[name=radio-resp' + stimID + ']:checked').val());
				}
				if (pageNum == lastPage) {
					checkPassFail();
				}
				else {
					pageNum++;
					HeadphoneCheck.renderHTMLPage(pageNum);
				}
			}
		}).appendTo($('#container-exp'));
	};

}( window.HeadphoneCheck = window.HeadphoneCheck || {}, jQuery));

$(document).ready(function() { 
	jsonpath = "headphone_check_stim.json";
	HeadphoneCheck.loadExamples(jsonpath);
	var pageNum = 0;
	var continueVal = HeadphoneCheck.renderHTMLPage(pageNum);
	if (continueVal) {
		alert('continuing on!');
	}
});
