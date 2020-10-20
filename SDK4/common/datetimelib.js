//v1.1
var dtlib = {
  
  KEY_TIMEFORMAT: "timeformat",   
  TIMEFORMAT_24H: 0, 
  TIMEFORMAT_12H: 1,
  timeFormat: 1,                  

  KEY_DOWFORMAT: "dowformat",
  DOWFORMAT_SHORT: 0,
  DOWFORMAT_LONG: 1,
  dowFormat: 0,  
  
  // enumeration of languages for language-depending functions
  LANGUAGES: {
    ENGLISH : 0
  },
  
  //array of arrays, each second level array per language
  monthNamesShort: [
    ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  ],
  
  //array of arrays, each second level array per language
  dowNamesShort: [
    ["SUN","MON","TUE","WED","THU","FRI","SAT"]
  ],
  
  //array of arrays, each second level array per language
  dowNamesLong: [
    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
  ],
  
  // Get short name of the month
  // language: based on enum, e.g. libname.ENGLISH
  // monthNo: month number 0-11
  getMonthNameShort: function(language, monthNo) {
    return this.monthNamesShort[language][monthNo]
  },  
  
  // Get short name of the day of he week
  // language: based on enum, e.g. libname.ENGLISH
  // monthNo: month number 0-11   
  getDowNameShort: function(language, dowNo) {
    return this.dowNamesShort[language][dowNo]
  },   
    
  // Get long name of the day of he week
  // language: based on enum, e.g. libname.ENGLISH
  // monthNo: month number 0-11     
  getDowNameLong: function(language, dowNo) {
    return this.dowNamesLong[language][dowNo]
  },     
  
  // Returns string AM/PM or 24H based user preference stored in timeFormat property.
  // hours: hours 0-23
  getAmApm: function (hours) {
    if (this.timeFormat == this.TIMEFORMAT_24H) {
      return "24H"
    } else {
      return hours >= 12 ? 'PM' : 'AM'
    }
  },  

  // Returns hours in 12H or 24H format based user preference stored in timeFormat property.
  // hours: hours 0-23 
  format1224hour: function(hours) {
    if (this.timeFormat == this.TIMEFORMAT_12H) {
      hours = hours % 12;
      hours = hours ? hours : 12;
    }
    return hours;
  },
  
  //adds preceeding 0 to single digits number
  zeroPad: function (i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }

};

export default dtlib
