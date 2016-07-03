var d = new Date()
	var day = d.getDate()
	var hour = d.getHours()
	var minute = d.getMinutes()
	var month = d.getMonth()
	var year = d.getFullYear()
	var offset = d.getTimezoneOffset()
	var daysByMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]


function gettime(){
	//alert(month)
	document.getElementById("timeleft").style.backgroundColor = '#FFFFFF'
	d = new Date()
	day = d.getDate()
	hour = d.getHours()
	minute = d.getMinutes()
	month = d.getMonth()
	year = d.getFullYear()
	offset = d.getTimezoneOffset()
	daysByMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
}
	
function twtime(){
	gettime()
	var tmpd = new Date()
   	var endDay =31
      var endHour = 10
   	//endDay =12
      /*
	if (day > 17) 
	{
		endDay = daysByMonth[month]
	}
   	tmpd.setDate(endDay)
   	var week = tmpd.getDay()
   	var endHour = 10
   	if (week == 6)
   		endDay -= 1
   	if (week == 0)
   		endDay += 1*/
   	timeleft = 24*(endDay-day)+endHour-hour-Math.ceil(minute/6)/10.0-8-offset/60
   	if (day > endDay){timeleft = 24*(endDay+daysByMonth[month]-day)+endHour-hour-parseInt(minute/6)/10.0-8-offset/60}
   	document.getElementById("timeleft").value=timeleft.toFixed(1)
   	document.getElementById("endday").value=endDay
   	document.getElementById("endhour").value=endHour
   }
   
    function cntime(){
    	gettime()
    	var tmpd = new Date()
      var expectday = 10
   	var endDay =30
   	//endDay = 11
   	/*
   	if ((day > 12) && (day < 30)) {
   		endDay = 26
   		tmpd.setDate(endDay)
   	}
   	else if (day > 26){
   		tmpd.setDate(endDay)
   		tmpd.setMonth((month+1) % 12)
   		oo = tmpd.getMonth()
   		if (oo == 0)
   			tmpd.setYear(year+1)
   	}
   	
   	var week = tmpd.getDay()
   	if (week == 6)
   		endDay -= 1
   	if (week == 0)
   		endDay += 1*/
   	var endHour = 14
   	timeleft = 24*(endDay-day)+endHour-hour-Math.ceil(minute/6)/10.0-8-offset/60
if (day > endDay){timeleft = 24*(endDay+daysByMonth[month]-day)+endHour-hour-parseInt(minute/6)/10.0-8-offset/60}
   	if (timeleft > 24*expectday-1) timeleft = 24*expectday-1
      document.getElementById("timeleft").value=timeleft.toFixed(1)
   	document.getElementById("endday").value=endDay
   	document.getElementById("endhour").value=endHour
   }
   
   function jptime(){
   	gettime()
   	var endDay =15
      var startDay = 5
   	if (day > 16) {endDay = daysByMonth[month];startDay = 20}
   	var endHour = 14
   	timeleft = 24*(endDay-day)+endHour-hour-Math.ceil(minute/6)/10.0-8-offset/60
      if (timeleft > 24*(endDay-startDay)-1)
         timeleft = 24*(endDay-startDay)-1
   	document.getElementById("timeleft").value=timeleft.toFixed(1)
   	document.getElementById("endday").value=endDay
   	document.getElementById("endhour").value=endHour
   }
   
   function diytime(){
   	gettime()
   	var endDay = parseInt(document.getElementById("endday").value)
   	var endHour = parseInt(document.getElementById("endhour").value)
   	timeleft = 24*(endDay-day)+endHour-hour-Math.ceil(minute/6)/10.0-8-offset/60
   	if (day > endDay){timeleft = 24*(endDay+daysByMonth[month]-day)+endHour-hour-parseInt(minute/6)/10.0-8-offset/60}
   	document.getElementById("timeleft").value=timeleft.toFixed(1)
   	document.getElementById("endday").value=endDay
   	document.getElementById("endhour").value=endHour
   }