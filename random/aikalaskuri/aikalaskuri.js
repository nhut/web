var cdowns = new Array();

var persons = new Array();
var g = new Graph();
var index = 0;

var time_seconds = 1000;
var time_minute = time_seconds * 60;
var time_hour = time_minute * 60;
var time_day = time_hour * 24;

var showId = false;
var showPic = false;

var text = {
	age: 'Ik�',
	birthday: 'Syntym�aika',
	nextBirthday: 'Seur. syntt�riin',
	dieDate: 'Kuolinaika'
}

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === '-') {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

function Person(fname, lname, bday, picUrl, dDate, fname2, lname2, mname2, prefix, place) {
	var obj = {
		id: index++,
		firstname: fname,
		lastname: lname,
		birthday: bday,
		picUrl: picUrl,
		firstname2: fname2,
		lastname2: lname2,
		middlename2: mname2,
		prefix: prefix,
		place: place,
		
		dName2: function() {
			return this.firstname+' '+this.lastname;
		},
		dName: function() {
			var f = this.firstname;
			if (!(this.firstname2 === null || this.firstname2 === undefined)) {
				f = this.firstname2;
			}
			var l = this.lastname;
			if (!(this.lastname2 === null || this.lastname2 === undefined)) {
				l = this.lastname2;
			}
			var m = '';
			if (!(this.middlename2 === null || this.middlename2 === undefined)) {
				m = ' '+this.middlename2;
			}
			var text = f+m+', '+l;
			if (!(this.prefix === null || this.prefix === undefined)) {
				text += ' ('+prefix+')';
			}
			return text;
		},		
		dBirthday: function() {
			var d = new Date(this.birthday);
			var r;
			try {
				r = d.toLocaleString().slice(0, -3);
			} catch(err) {}
			return r;
		},

		nBirthday: function() {
			var cDate = new Date();
			var bDay = new Date(this.birthday);
			bDay.setFullYear(cDate.getFullYear());
			if(cDate.getTime() > bDay.getTime()) {
				bDay.setFullYear(cDate.getFullYear()+1);
			}
			return bDay.toLocaleString();
		},
		currentAge: function() {
			var birthday = new Date(this.birthday);
			if(this.dieDate) {
				var dDate = new Date(this.dieDate);
				return ~~((dDate - birthday) / (31557600000));
			} else {
				return ~~((Date.now() - birthday) / (31557600000));
			}
		},
		
		nextBirthday: function() {
			var cDate = new Date();
			var bDay = new Date(this.birthday);
			bDay.setFullYear(cDate.getFullYear());
			if(cDate.getTime() > bDay.getTime()) {
				bDay.setFullYear(cDate.getFullYear()+1);
			}
			
            var distance = bDay - cDate;
            return distance;
		},
		tillNextBirthday: function() {
			var distance = this.nextBirthday();
            var days = Math.floor(distance / time_day);
            var hours = Math.floor((distance % time_day) / time_hour);
            var minutes = Math.floor((distance % time_hour) / time_minute);
            var seconds = Math.floor((distance % time_minute) / time_seconds);

			return days+'vrk '+hours+'h '+minutes+'min '+seconds+'s';
		},
		currAge: 0,
		nextBDay: 0,
		dieDate: null,
		dieDateDisplay: function() {
			var tmpDDate = new Date(this.dieDate);
			var r;
			try {
				r = tmpDDate.toLocaleString().slice(0, -3);
			} catch(err) {}
			return r;
		}
	};
	obj.currAge = obj.currentAge();
	obj.nextBDay = obj.nextBirthday();
	if(dDate) {
		obj.dieDate = dDate;
	}
	return obj;
}

function createPersonBox(p, elem) {
	try {
		var isDead = (p.dieDate == null ? false : true);
		
		console.log('Creating person... '+p.dName()+', '+p.currentAge()+', '+p.dBirthday()+' --> '+p.nBirthday()+', isDead='+isDead);
		var currentAge = p.currentAge();
		
		var data = '<fieldset class="box">';
	data += '<legend '+(showId ? '' : 'title="'+p.id+'")')+(isDead ? 'style="color: red;"' : '')+'>'+p.dName()+' ('+currentAge+')'+(showId ? '&nbsp;&nbsp;id='+p.id : '')+'</legend>';
	
	data += '<span class="pDiv"><img src="'+(showPic ? p.picUrl : '')+'" class="pic" /></span>';
	data += '<span class="text">';
	data += '<table class="pTable">';
		data += '<tr>';
		data += '<td>'+text.age+':</td>';
		data += '<td>'+currentAge+(true ? '' : ' ('+p.nBirthday()+')')+'</td>';
		data += '</tr>';
		
		data += '<tr>';
		data += '<td>'+text.birthday+':</td>';
		data += '<td>'+p.dBirthday()+'</td>';
		data += '</tr>';
		
		if(isDead) {
			data += '<tr>';
			data += '<td>'+text.dieDate+':</td>';
			data += '<td><span id="b_'+p.id+'"></td>';
			data += '</tr>';
		} else {
			data += '<tr>';
			data += '<td>'+text.nextBirthday+':</td>';
			data += '<td><span id="b_'+p.id+'"></td>';
			data += '</tr>';
		}
		
	data += '</table>';
	data += '</span>';
	
	data += '</fieldset>';
	elem.innerHTML += data;
	
	} catch (err) {
		console.log('Error! '+err+', '+p.dName()+', '+p.currentAge()+', '+p.dBirthday()+' --> '+p.nBirthday());
	}
}

function createGraphNod(p) {
	try {
	 var graph = g.addNode(p.id, { label: p.dName()+' ('+p.currAge+')'});
	} catch (err) {}
}

var updCount = 0;
function updateCountdown() {
	if(persons) {
		for(var i=0; i<persons.length; i++) {
			//next birthday
			var person = persons[i];
			var nBDay = (person.dieDate == null ? person.tillNextBirthday() : person.dieDateDisplay());
			document.getElementById('b_'+person.id).innerHTML = nBDay;
		}
	}
	if(cdowns) {
		for(var i=0; i<cdowns.length; i++) {
			//next enddate
			var obj = cdowns[i];
			document.getElementById('b_'+obj.id).innerHTML = obj.tillEndDate();
		}
	}
	updCount++;
	setTimeout(updateCountdown, 1000);
}

var countdownIndex = 0;
function Countdown(title, eDate, repeat) {
	var obj = {
		id: 'cd_'+countdownIndex++,
		title: title,
		eDate: eDate,
		eDateDisplay: function() {
			var d = new Date(this.eDate);
			var r = '?';
			try {
				r = d.getDate()+'.'+(d.getMonth()+1)+'.'+d.getFullYear();
			} catch(err) {}
			return r;
		},
		tillEndDate: function() {
			try {
				var cDate = new Date();
				var tmpDate = new Date(this.eDate);
				tmpDate.setFullYear(cDate.getFullYear());
				if(cDate.getTime() > tmpDate.getTime()) {
					tmpDate.setFullYear(cDate.getFullYear()+1);
				}
				
	            var distance = tmpDate - cDate;
				
	            var days = Math.floor(distance / time_day);
	            var hours = Math.floor((distance % time_day) / time_hour);
	            var minutes = Math.floor((distance % time_hour) / time_minute);
	            var seconds = Math.floor((distance % time_minute) / time_seconds);

				return days+'vrk '+hours+'h '+minutes+'min '+seconds+'s';
				
			} catch (err) {
				return '?';
			}
			
		},
		repeat: repeat
	};
	return obj;
}