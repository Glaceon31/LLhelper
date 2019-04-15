/*
 * manage site version
 */

var LLSiteVersion = (function(){
   var current_version = 20190415;
   var VISITED_VERSION_KEY = 'llhelper_visited_version__';

   function getVisitedVersion() {
      var version = current_version;
      try {
         version = parseInt(localStorage.getItem(VISITED_VERSION_KEY) || 0);
      } catch (e) {
         console.error(e);
      }
      return version;
   }

   var visited_version = getVisitedVersion();

   function updateVisitedVersion() {
      try {
         localStorage.setItem(VISITED_VERSION_KEY, current_version);
         visited_version = current_version;
      } catch (e) {
         console.error(e);
      }
   }

   function checkUpdateHint() {
      if (visited_version < current_version) {
         document.getElementById('recent_updates').innerHTML = '近期更新 <span class="badge" style="background-color:#f33">1</span>';
      } else {
         document.getElementById('recent_updates').innerHTML = '近期更新';
      }
   }

   var ret = {};
   ret.update = updateVisitedVersion;
   ret.check = checkUpdateHint;
   ret.current_version = current_version;
   ret.visited_version = visited_version;
   return ret;
})();

