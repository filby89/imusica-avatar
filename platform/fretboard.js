class Fretboard {
	constructor(frets_num) {
		var slideSpeed = 300;
		var noteToShow = "All";
		var canClick = true;

	    this.fret = [ //preset fretboard positioning for each bendquanto
	      [0,0,0,0,0,0], //A major preset
	      [0,0,0,0,0,0],  //E major preset
	      [0,0,0,0,0,0],  //D major preset
	      [0,0,0,0,0,0],  //C major preset
	      [0,0,0,0,0,0] //G major preset
	    ];

	    this.tune = 0;

		var boxes = [];


		var strings = ["E_low", "A", "D", "G", "B", "E_high"];

		$("#select-box > option").each(function() {
			boxes.push(this.value);
		});

		this.boxes = boxes;

		this.strings = strings;

		for (var i=0; i < frets_num; i++) {
			$(".fret.first").after("<div class='fret'></div>");
		}

		for (var j=0; j<boxes.length; j++) {
			var notes = {
				e_low: ['E','F','F#','G','G#','A','A#','B','C','C#','D','D#','E'],
				a: ['A','A#','B','C','C#','D','D#','E','F','F#','G','G#',"A"],
				d: ['D','D#','E','F','F#','G','G#','A','A#','B','C','C#','D'],
				g: ['G','G#','A','A#','B','C','C#','D','D#','E','F','F#','G'],
				b: ['B','C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],
				e_high: ['E','F','F#','G','G#','A','A#','B','C','C#','D','D#','E']
			}

			notes.e_low.length = frets_num+1;
			notes.a.length = frets_num+1;
			notes.d.length = frets_num+1;
			notes.g.length = frets_num+1;
			notes.b.length = frets_num+1;
			notes.e_high.length = frets_num+1;


			for (var i=0; i < notes.e_low.length; i++){
				$('.mask.low-e ul').append('<li string_index=' + i + ' box=' + boxes[j] + ' string=' + strings[0] + ' note='+notes.e_low[i]+'>'+notes.e_low[i]+'</li>')
				$('.mask.a ul').append('<li string_index=' + i + ' box=' + boxes[j] + ' string=' + strings[1] + ' note='+notes.a[i]+'>'+notes.a[i]+'</li>')
				$('.mask.d ul').append('<li string_index=' + i + ' box=' + boxes[j] + ' string=' + strings[2] + ' note='+notes.d[i]+'>'+notes.d[i]+'</li>')
				$('.mask.g ul').append('<li string_index=' + i + ' box=' + boxes[j] + ' string=' + strings[3] + ' note='+notes.g[i]+'>'+notes.g[i]+'</li>')
				$('.mask.b ul').append('<li string_index=' + i + ' box=' + boxes[j] + ' string=' + strings[4] + ' note='+notes.b[i]+'>'+notes.b[i]+'</li>')
				$('.mask.high-e ul').append('<li string_index=' + i + ' box=' + boxes[j] + ' string=' + strings[5] + ' note='+notes.e_high[i]+'>'+notes.e_high[i]+'</li>')	
			}
		}

		// fix width of several elements

		$(".guitar-neck").width(frets_num*80+80);
		$(".strings").width(frets_num*80+80);
		$(".dots").width(frets_num*80+80);

		var that = this;

		$(".notes li").click(function(){
			var string = $(this).attr("string");
			var box = $(this).attr("box");

			var box_idx = parseInt(box.replace("box_", ""));
			var string_idx = 0;

		var strings = ["E_low", "A", "D", "G", "B", "E_high"];
			switch(string) {
			    case "E_low":
			        string_idx = 0;
			        break;
			    case "A":
			        string_idx = 1;
			        break;
			    case "D":
			        string_idx = 2;
			        break;
			    case "G":
			        string_idx = 3;
			        break;
			    case "B":
			        string_idx = 4;
			        break;
			    case "E_high":
			        string_idx = 5;
			        break;
			}
		console.log(box_idx, string_idx, parseInt($(this).attr('string_index')))

			if ($(this).hasClass("active")) {
				that.fret[box_idx][string_idx] = 0;
			}	
			else {
				that.fret[box_idx][string_idx] = parseInt($(this).attr('string_index'));
			}		

			console.log(that.fret);

			$(`.notes li[box=${box}][string=${string}]`).removeClass("active");
			$(this).toggleClass("active");
		});


		for (var i=1; i < boxes.length; i++) {
			$(".notes li[box='"+boxes[i]+"']").hide();
		}

		$("#select-box").change(function(){
			for (var i=0; i < boxes.length; i++) {
				$(".notes li[box='"+boxes[i]+"']").hide();
			}

			var box = $("#select-box").val();
			$(".notes li[box='"+box+"']").show();
		})


		function showNotes(noteToShow){
			if(noteToShow == "All"){
				$('.guitar-neck .notes li').animate({opacity:1}, 500);
			} else if (noteToShow == "None") {
				$('.guitar-neck .notes li').animate({opacity:0}, 500);
			}
			else {
				$('.guitar-neck .notes li').not('[note="'+noteToShow+'"]').animate({opacity:0}, 500);
				$('.guitar-neck .notes li[note="'+noteToShow+'"]').animate({opacity:1}, 500);	
			}	
		}
		



		///// controls

		$('.controls a.down').click(function(){
			if(!canClick){return false;}
			canClick = false;

			$('.mask').each(function(){
				var el = $(this);
				var nextNote = el.find('li:nth-child(12)').text();

				el.animate({right: -268}, slideSpeed);
				setTimeout(function(){
					el.find('ul').prepend( "<li note="+nextNote+">"+nextNote+"</li>" );
					el.find('li:last-child').remove();
					el.css({right: -189});
				}, slideSpeed+20)
			});

			setTimeout(function(){
				changeOpenNotes();
				showNotes(noteToShow);
				canClick = true;
			}, slideSpeed+20)
			
			return false;
		});

		$('.controls a.up').click(function(){
			if(!canClick){return false;}
			canClick = false;

			$('.mask').each(function(){
				var el = $(this);
				var nextNote = el.find('li:nth-child(2)').text();

				$( "<li note="+nextNote+">"+nextNote+"</li>" ).appendTo(el.find('ul'));
				el.css({right: -268});
				el.find('li:first-child').remove();
				el.animate({right: -189}, slideSpeed);
				
			});

			changeOpenNotes();
			showNotes(noteToShow);

			setTimeout(function(){
				canClick = true;
			}, slideSpeed+20)
			return false;
		});

		$('.controls li').click(function(){
			noteToShow = $(this).text();
			showNotes(noteToShow);
		});

		function changeOpenNotes(){
			$('.notes .mask').each(function(){
				var el = $(this);
				var elClass = el.attr('class').split(' ')[1];
				var note = el.find('li:last-child').text();

				$('.open-notes .'+elClass).text(note);
			});
		}    

	}


}
