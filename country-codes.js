/* Shared worldwide dialling codes.
   Populates every <select class="ccode"> and auto-selects by the visitor's timezone.
   Loaded last (defer) so it overrides any older inline list on a page. */
(function(){
  var C=[["+1","US"],["+1","CA"],["+44","GB"],["+91","IN"],["+61","AU"],["+64","NZ"],["+353","IE"],
  ["+49","DE"],["+33","FR"],["+34","ES"],["+39","IT"],["+31","NL"],["+32","BE"],["+41","CH"],["+43","AT"],
  ["+46","SE"],["+47","NO"],["+45","DK"],["+358","FI"],["+351","PT"],["+30","GR"],["+48","PL"],["+420","CZ"],
  ["+36","HU"],["+40","RO"],["+359","BG"],["+385","HR"],["+386","SI"],["+421","SK"],["+370","LT"],["+371","LV"],
  ["+372","EE"],["+352","LU"],["+356","MT"],["+357","CY"],["+354","IS"],
  ["+971","AE"],["+966","SA"],["+974","QA"],["+965","KW"],["+973","BH"],["+968","OM"],["+962","JO"],["+961","LB"],
  ["+972","IL"],["+90","TR"],["+20","EG"],["+212","MA"],["+216","TN"],["+213","DZ"],
  ["+27","ZA"],["+234","NG"],["+254","KE"],["+233","GH"],["+255","TZ"],["+256","UG"],["+251","ET"],
  ["+65","SG"],["+60","MY"],["+66","TH"],["+62","ID"],["+63","PH"],["+84","VN"],["+852","HK"],["+853","MO"],
  ["+886","TW"],["+81","JP"],["+82","KR"],["+86","CN"],["+92","PK"],["+880","BD"],["+94","LK"],["+977","NP"],
  ["+960","MV"],["+95","MM"],["+855","KH"],["+856","LA"],
  ["+52","MX"],["+55","BR"],["+54","AR"],["+56","CL"],["+57","CO"],["+51","PE"],["+58","VE"],["+593","EC"],
  ["+598","UY"],["+595","PY"],["+591","BO"],["+506","CR"],["+507","PA"],["+1809","DO"],
  ["+7","RU"],["+380","UA"],["+375","BY"],["+7","KZ"],["+995","GE"],["+374","AM"],["+994","AZ"],["+998","UZ"]];

  var TZ={"Asia/Kolkata":"+91","Asia/Calcutta":"+91","Asia/Dhaka":"+880","Asia/Karachi":"+92",
  "Asia/Colombo":"+94","Asia/Kathmandu":"+977","Asia/Dubai":"+971","Asia/Riyadh":"+966","Asia/Qatar":"+974",
  "Asia/Kuwait":"+965","Asia/Singapore":"+65","Asia/Kuala_Lumpur":"+60","Asia/Bangkok":"+66","Asia/Jakarta":"+62",
  "Asia/Manila":"+63","Asia/Ho_Chi_Minh":"+84","Asia/Hong_Kong":"+852","Asia/Taipei":"+886","Asia/Tokyo":"+81",
  "Asia/Seoul":"+82","Asia/Shanghai":"+86","Asia/Jerusalem":"+972","Asia/Istanbul":"+90",
  "Europe/London":"+44","Europe/Dublin":"+353","Europe/Berlin":"+49","Europe/Paris":"+33","Europe/Madrid":"+34",
  "Europe/Rome":"+39","Europe/Amsterdam":"+31","Europe/Brussels":"+32","Europe/Zurich":"+41","Europe/Vienna":"+43",
  "Europe/Stockholm":"+46","Europe/Oslo":"+47","Europe/Copenhagen":"+45","Europe/Helsinki":"+358",
  "Europe/Lisbon":"+351","Europe/Athens":"+30","Europe/Warsaw":"+48","Europe/Prague":"+420","Europe/Moscow":"+7",
  "Europe/Kiev":"+380","Europe/Kyiv":"+380",
  "America/":"+1","America/Sao_Paulo":"+55","America/Mexico_City":"+52","America/Argentina/Buenos_Aires":"+54",
  "America/Bogota":"+57","America/Santiago":"+56","America/Lima":"+51",
  "Australia/":"+61","Pacific/Auckland":"+64","Africa/Johannesburg":"+27","Africa/Lagos":"+234",
  "Africa/Nairobi":"+254","Africa/Cairo":"+20","Africa/Accra":"+233"};

  function guess(){
    try{
      var tz=Intl.DateTimeFormat().resolvedOptions().timeZone||"";
      if(TZ[tz]) return TZ[tz];
      for(var k in TZ){ if(k.slice(-1)==="/" && tz.indexOf(k)===0) return TZ[k]; }
      var loc=(navigator.language||"").toUpperCase(), m=loc.split("-")[1];
      if(m){ for(var i=0;i<C.length;i++){ if(C[i][1]===m) return C[i][0]; } }
    }catch(e){}
    return "+1";
  }

  function init(){
    var g=guess();
    document.querySelectorAll("select.ccode").forEach(function(sel){
      sel.innerHTML="";                       /* replace any older short list */
      C.forEach(function(c){
        var o=document.createElement("option");
        o.value=c[0]; o.textContent=c[1]+" "+c[0];
        sel.appendChild(o);
      });
      sel.value=g;
      if(!sel.value) sel.value="+1";
    });
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
  else init();
})();
